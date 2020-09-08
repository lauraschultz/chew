const axios = require("axios"),
  express = require("express"),
  firebase = require("firebase"),
  { firebaseConfig, yelpApiKey } = require("./config"),
  socket = require("socket.io");

const PORT = process.env.PORT || 4000;

const activeSessions = {};

firebase.initializeApp(firebaseConfig);
let database = firebase.database(),
  app = express(),
  server = app.listen(PORT, () => console.log(`listening on port ${PORT}`)),
  io = socket(server, { origins: "*:*" });

io.on('connection', function(socket){
    socket.on("newSession", (params, callback) => {
        const sessionId = createSession(params.userName, params.location);
        socket.join(sessionId);
        callback(sessionId);
        activeSessions[sessionId] = {};
    });
    socket.on("addRestaurant", (params) => {
        console.log(`adding a restaurant: ${JSON.stringify(params)}`)
        addRestaurant("-MGeNx4U0qx-eBfym09E", params.restaurant);
    })
})

const rootRef = database.ref();



app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
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

// app.post("/new/:userName/:location", (req, res) => {
//   console.log(`create new session: ${JSON.stringify(req.params)}`);
//   const { userName, location } = req.params;
//   const sessionId = createSession(userName, location);
//   res.send(sessionId);
//   console.log(`sent sessionID: ${sessionId}`);
// });

// app.post("/add/:sessionId/:restaurantId", (req, res) => {
//   console.log(`add a restaurant: ${JSON.stringify(req.params)}`);
//   const {sessionId, restaurantId} = req.params;
// //   addRestaurant("-MGeNx4U0qx-eBfym09E", restaurantId);
// });

app.get("/search/:searchTerm", (req, res) => {
    const searchTerm = req.params.searchTerm
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
    restaurants: true,
  };
  rootRef.child(sessionId).update(session);
  return sessionId;
};

let addRestaurant = (sessionId, restaurant) => {
  rootRef
    .child(`${sessionId}/restaurants/${restaurant.id}`)
    .update({ votes: true });
    io.in(sessionId).emit("")
};

let voteOnRestaurant = (sessionId, restaurantId, userId, voteNum) => {
  rootRef
    .child(`${sessionId}/restaurants/${restaurantId}/votes/${voteNum}`)
    .update({ [userId]: true });
};

let getRestaurantById = (id) =>
  yelpFusion(`https://api.yelp.com/v3/businesses/${id}`);

let restaurantSearch = (searchTerm) =>
  yelpFusion(
    `https://api.yelp.com/v3/businesses/search?categories=restaurant&location=55105&term=${searchTerm}`
  );

// restaurantSearch("vegan lunch")
//   .then((d) => console.log(`recieved: ${JSON.stringify(d.data)}`))
//   .catch((e) => console.log(`whoopsies ${e}`));

// createSession('Laura', 55105);
// addRestaurant("-MGeNx4U0qx-eBfym09E", "123");
// voteOnRestaurant("-MGeNx4U0qx-eBfym09E", "123", "-MGeNx4VNeJVHDUuBxOu", 2);
