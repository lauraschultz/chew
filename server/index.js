// getUserId() => creates new user id
// submitName(userId, sessionId, userName)
// validateId(sessionId)

const axios = require("axios"),
  express = require("express"),
  firebase = require("firebase"),
  { firebaseConfig, yelpApiKey } = require("./config"),
  socket = require("socket.io");

const PORT = process.env.PORT || 4000;

const activeSessions = {};
const VOTE_VALUES = 4;

const objExists = (obj) => {
  // console.log(`objExists method: obj is ${JSON.stringify(obj)}`);
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

let validateId = (sessionId) => {
  console.log(`validating ${sessionId}`);
  return rootRef
    .child(sessionId)
    .once("value")
    .then((snp) => snp.exists());
};

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
  socket.on("tryJoinSession", (params, callback) =>
    tryJoinSession(params, callback, socket)
  );
  socket.on("setUserName", setUserName);
  socket.on("addRestaurant", addRestaurant);
  socket.on("voteOnRestaurant", voteOnRestaurant);
  // socket.on("resumeSession", (params, callback) =>
  //   resumeSession(params, callback, socket)
  // );
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

let generateBusinessSearchQuery = (searchTerm, location, priceRange) =>
  `{
      search(term: ${searchTerm}, location: ${location}, ${
    priceRange ? `price: ${priceRange}` : ""
  }){
        business {
          name
          url
          hours
        }
      }
    }`;

let yelpFusionGql = (query) =>
  axios({
    url: "https://api.yelp.com/v3/graphql",
    headers: {
      Authorization: `Bearer ${yelpApiKey}`,
      "Content-Type": "application/graphql",
      // "content-type": "application/graphql"
    },
    method: "POST",
    data: query,
    //   `{
    //     business(id: "garaje-san-francisco") {
    //         name
    //         id
    //         rating
    //         url
    //     }
    // }`
  });

app.get("/search/:sessionId/:searchTerm", (req, res) => {
  const sessionId = req.params.sessionId;
  const searchTerm = req.params.searchTerm;
  refreshCache(sessionId, () => {
    console.log(`searching for: ${searchTerm}`);
    restaurantSearch(searchTerm).then((d) => res.send(d.data));
  });
});

app.get("/validate/:sessionId", (req, res) =>
  validateId(req.params.sessionId).then((isValid) => res.send(isValid))
);

let generateUserId = () => rootRef.child("users").push().key;

let createSession = (userName, location, userId) => {
  const sessionId = rootRef.push().key;
  if(!userId){
    userId = generateUserId();
  }
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

let newSession = ({ userId, userName, location }, callback, socket) => {
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

let tryJoinSession = async ({ sessionId, userId }, callback, socket) => {
  console.log(`joining a session: ${JSON.stringify({ sessionId, userId })}`);
  const sessionObj = await rootRef
    .child(sessionId)
    .once("value", (snapshot) => {
      snapshot.val();
      // if (!objExists(snapshot.val())) {
      //   callback({ success: false });
      //   console.log("returned.");
      //   return;
      // }
    });
  
  console.log(`sessionObj is ${JSON.stringify(sessionObj)}`);
  console.log(`sessionObj.users is ${JSON.stringify(sessionObj["users"])}`);
  if (!objExists(sessionObj)) {
    callback({ success: false });
    console.log("returned.");
    return;
  }
  let previouslyAuthenticated;
  if (!userId) {
    console.log(`creating a userId.`);
    userId = rootRef.child(`users`).push().key;
    previouslyAuthenticated = false;
  } else {
    // check if user has already logged in to this particular session
    previouslyAuthenticated =
      sessionObj.users && sessionObj.users[userId] ? true : false;
  }
  if (!previouslyAuthenticated) {
    rootRef.child(`${sessionId}/users`).update({ [userId]: false });
  }
  refreshCache(sessionId, () => {
    // activeSessions[sessionId].users[userId] = { name: userName };
    socket.join(sessionId);
    // let currentRestaurants = activeSessions[sessionId].restaurants
    // Object.keys(currentRestaurants).forEach((id) => currentRestaurants[id] = {...currentRestaurants[id], votes: shapeVotes(currentRestaurants[id].votes, activeSessions[sessionId].users)})
    callback({
      success: true,
      userId: userId,
      previouslyAuthenticated: previouslyAuthenticated,
      restaurants: shapeRestaurants(
        activeSessions[sessionId].restaurants,
        activeSessions[sessionId].users
      ),
    });
  });
};

let setUserName = ({ sessionId, userId, userName }) => {
  const userRef = rootRef.child(`${sessionId}/users/${userId}`);
  userRef.once("value", (snapshot) => {
    if (objExists(snapshot.val())) {
      userRef.update({ name: userName });
      callback({ success: true });
    } else {
      callback({ success: false });
    }
  });
};

let newVoteArray = () => new Array(VOTE_VALUES);

let shapeRestaurants = (restaurants, users) => {
  let shapedRestaurants = {};
  for (restId in restaurants) {
    shapedRestaurants[restId] = {
      ...restaurants[restId],
      votes: shapeVotes(restaurants[restId].votes, users),
    };
  }
  return shapedRestaurants;
};

let shapeVotes = (votes, users) => {
  let votesArr = newVoteArray();
  Object.entries(votes).forEach(([userId, v]) => {
    if (users[userId]) {
      if (votesArr[v]) {
        votesArr[v] += `, ${users[userId].name}`;
      } else {
        votesArr[v] = users[userId].name;
      }
    }
  });
  return votesArr;
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
    .update({ votes: false });
  io.in(sessionId).emit("addedRestaurant", {
    business: restaurant,
    votes: newVoteArray(),
  });
  refreshCache(sessionId, () => {
    activeSessions[sessionId].restaurants[restaurant.id] = {
      business: restaurant,
      votes: {},
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
  refreshCache(sessionId, () => {
    let voteRef = rootRef.child(
      `${sessionId}/restaurants/${restaurantId}/votes`
    );
    const currentUsers = activeSessions[sessionId].users;
    voteRef.once("value", (snapshot) => {
      // const allVotes = snapshot.val();
      activeSessions[sessionId].restaurants[restaurantId].votes[
        userId
      ] = +voteNum;
      voteRef.update({ [userId]: voteNum });
      io.in(sessionId).emit("addedVote", {
        restaurantId: restaurantId,
        votes: shapeVotes(
          activeSessions[sessionId].restaurants[restaurantId].votes,
          activeSessions[sessionId].users
        ),
        // (voteRef[voteNum] ? Object.keys(voteRef[voteNum]) : [])
        //   .concat([userId])
        //   .map((userId) => {
        //     console.log(`currentUsers is ${JSON.stringify(currentUsers)}`);
        //     return currentUsers[userId] ? currentUsers[userId].name : "N/A";
        //   }),
      });
    });
  });
};

let getRestaurantById = (id) =>
  yelpFusion(`https://api.yelp.com/v3/businesses/${id}`);

let restaurantSearch = (searchTerm, sessionId, options) =>
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
            .map((r) => ({
              business: r.value.data,
              votes: root.restaurants[r.value.data.id].votes || {},
            }))
            .reduce((obj, cur) => {
              return { ...obj, [cur.business.id]: cur };
            }, {}),
        };
        console.log(
          `cache was refreshed from firebase, current active session is now ${JSON.stringify(
            activeSessions[sessionId]
          )}`
        );
        callback();
      });
      // .catch(() => console.log(`bad news.`));
    });
};
