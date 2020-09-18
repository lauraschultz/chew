const axios = require("axios"),
  express = require("express"),
  firebase = require("firebase"),
  { firebaseConfig, yelpApiKey } = require("./config"),
  socket = require("socket.io");

const PORT = process.env.PORT || 4000;

const activeSessions = {};
const VOTE_VALUES = 3;

const objExists = (obj) => {
  console.log(`objExists method: obj is ${JSON.stringify(obj)}`);
  if (!obj) {
    return false;
  }
  return Object.keys(obj).length > 0;
};

firebase.initializeApp(firebaseConfig);
let database = firebase.database(),
  app = express(),
  server = app.listen(PORT, () => console.log(`listening on port ${PORT}`)),
  io = socket(server, { origins: "*:*" });

const rootRef = database.ref();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

io.on("connection", function (socket) {
  socket.on("newSession", (params, callback) =>
    newSession(params, callback, socket)
  );
  socket.on("joinSession", (params, callback) =>
    joinSession(params, callback, socket)
  );
  socket.on("addRestaurant", addRestaurant);
  socket.on("voteOnRestaurant", voteOnRestaurant);
  socket.on("resumeSession", (params, callback) =>
    resumeSession(params, callback, socket)
  );
});

let yelpFusion = (url) =>
  axios({
    method: "GET",
    url: url,
    headers: {
      authorization: `Bearer ${yelpApiKey}`,
      "Content-Type": "application/json",
    },
  });

app.get("/search/:searchTerm", (req, res) => {
  const searchTerm = req.params.searchTerm;
  console.log(`searching for: ${searchTerm}`);
  restaurantSearch(searchTerm).then((d) => res.send(d.data));
});

let createSession = (userName, location) => {
  const sessionId = rootRef.push().key;
  const userId = rootRef.child("users").push().key;
  let session = {
    location: location,
    users: {
      [userId]: {
        name: userName,
      },
    },
    restaurants: false,
  };
  rootRef.child(sessionId).update(session);
  return { sessionId, userId };
};

let newSession = ({ userName, location }, callback, socket) => {
  console.log(
    `creating new session: ${JSON.stringify({ userName, location })}`
  );
  const { sessionId, userId } = createSession(userName, location);
  socket.join(sessionId);
  callback({ sessionId, userId });
  activeSessions[sessionId] = {
    users: {},
    restaurants: {},
  };
};

let resumeSession = ({ sessionId }, callback, socket) => {
  // console.log(`joining a session: ${JSON.stringify({ sessionId, userId })}`);
  refreshCache(sessionId, () => {
    socket.join(sessionId);
    callback({
      success: true,
      restaurants: activeSessions[sessionId].restaurants,
    });
  });
};

let joinSession = async ({ sessionId, userName }, callback, socket) => {
  console.log(`joining a session: ${JSON.stringify({ sessionId, userName })}`);
  if (!userName) {
    userName = "Anonymous";
  }
  await rootRef.child(sessionId).once("value", (snapshot) => {
    if (!objExists(snapshot.val())) {
      callback({ success: false });
      console.log("returned.");
      return;
    }
  });
  console.log("here");
  const userId = rootRef.child(`users`).push().key;
  rootRef.child(`${sessionId}/users`).update({ [userId]: { name: userName } });
  refreshCache(sessionId, () => {
    activeSessions[sessionId].users[userId] = { name: userName };
    socket.join(sessionId);
    callback({
      success: true,
      userId: userId,
      restaurants: activeSessions[sessionId].restaurants,
    });
  });
};

let setName = ({ sessionId, userId, userName }, callback, socket) => {
  const userRef = rootRef.child(`${sessionId}/users/${userId}`);
  userRef.once("value", (snapshot) => {
    if (objExists(snapshot.val())) {
      userRef.update({ name: userName });
      callback(true);
    } else {
      callback(false);
    }
  });
};

let newVoteArray = () => {
  let voteArr = new Array(VOTE_VALUES);
  for (let i = 0; i < VOTE_VALUES; i++) {
    voteArr[i] = [];
  }
  return voteArr;
};

let addRestaurant = ({ sessionId, restaurant }, callback) => {
  console.log(
    `adding a restaurant: ${JSON.stringify({ sessionId, restaurant })}`
  );
  if (!sessionId) {
    callback(false);
    return;
  }
  rootRef
    .child(`${sessionId}/restaurants/${restaurant.id}`)
    .update({ votes: true });
  io.in(sessionId).emit("addedRestaurant", {
    business: restaurant,
    votes: newVoteArray(),
  });
  refreshCache(sessionId, () => {
    activeSessions[sessionId].restaurants[restaurant.id] = {
      business: restaurant,
      votes: newVoteArray(),
    };
  });
  callback(true);
};

let voteOnRestaurant = ({ sessionId, restaurantId, userId, voteNum }) => {
  console.log(
    `voting on a restaurant: ${JSON.stringify({
      sessionId,
      restaurantId,
      userId,
      voteNum,
    })}`
  );
  let voteRef = rootRef.child(`${sessionId}/restaurants/${restaurantId}/votes`);
  voteRef.once('value', (snapshot) => {
    const allVotes = snapshot.val();
    Object.entries(allVotes).map()
  })
  voteRef.update({ [voteNum]: { [userId]: true } });

  // let userRef = rootRef.child(`${sessionId}/users`);
  const currentUsers = activeSessions[sessionId].users;
  activeSessions[sessionId].restaurants[restaurantId].votes[+voteNum].push(
    currentUsers[userId].name
  );
  io.in(sessionId).emit("addedVote", {
    restaurantId: restaurantId,
    vote: {
      level: voteNum,
      names: (voteRef[voteNum] ? Object.keys(voteRef[voteNum]) : [])
        .concat([userId])
        .map((userId) => {
          console.log(`currentUsers is ${JSON.stringify(currentUsers)}`);
          return currentUsers[userId] ? currentUsers[userId].name : "N/A";
        }),
    },
  });
};

let getRestaurantById = (id) =>
  yelpFusion(`https://api.yelp.com/v3/businesses/${id}`);

let restaurantSearch = (searchTerm) =>
  yelpFusion(
    `https://api.yelp.com/v3/businesses/search?categories=restaurant&location=55105&term=${searchTerm}`
  );

refreshCache = (sessionId, callback) => {
  if (activeSessions[sessionId]) {
    console.log("there is already an active session.");
    callback();
    return;
  }
  rootRef
    .child(sessionId)
    .once("value")
    .then((snapshot) => {
      const root = snapshot.val();
      if (!objExists(root)) {
        return;
      }
      console.log(`root is ${JSON.stringify(root)}`);
      Promise.allSettled(
        Object.keys(root.restaurants).map(getRestaurantById)
      ).then((results) => {
        console.log(`results of promise.allSettled: ${results}`);

        activeSessions[sessionId] = {
          location: root.location,
          users: root.users,
          restaurants: results
            .filter((r) => r.status === "fulfilled")
            .map((r) => {
              const b = r.value.data;
              let vArr = newVoteArray();
              Object.entries(root.restaurants[b.id].votes).map(
                ([voteNum, val]) => {
                  Object.keys(val).forEach((v) => {
                    vArr[+voteNum].push(root.users[v].name);
                  });
                }
              );
              return {
                business: b,
                votes: vArr,
              };
            })
            .reduce((obj, cur) => {
              return { ...obj, [cur.business.id]: cur };
            }, {}),
        };
        callback();
      });
      // .catch(() => console.log(`bad news.`));
    });
};
