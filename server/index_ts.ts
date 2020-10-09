import express, { json } from "express";
import axios, { AxiosPromise } from "axios";
import firebase from "firebase";
import socket from "socket.io";
import {
  Business,
  BusinessWithVotes,
  NewSessionData,
  NewSessionCallback,
  TryJoinSessionCallback,
  TryJoinSessionData,
  SetUserNameData,
} from "../shared/types";
import { firebaseConfig, yelpApiKey } from "./config";
import { FirebaseDb, FirebaseSession, Users, Votes } from "./firebaseTypes";

const PORT = process.env.PORT || 4000;
const VOTE_VALUES = 4;

let restaurantCache: { [yelpId: string]: Business } = {};
let sessionCache: FirebaseDb = {};

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

app.get(
  "/search/:sessionId/:searchTerm",
  async (req: express.Request, res: express.Response) => {
    console.log(`searching: ${JSON.stringify(req.params)}`)
    const { sessionId, searchTerm } = req.params;
    await refreshCache(sessionId);
    // console.log(`refreshed cache: ${JSON.stringify(sessionCache)}`)
    restaurantSearch(
      searchTerm,
      sessionCache[sessionId].location || ''
    ).then((result) => res.send(result));
  }
);

app.post(
  "/setUserName/:sessionId/:userId/:userName",
  (req: express.Request, res: express.Response) => {
    const { sessionId, userId, userName } = req.params;
    setUserName(sessionId, userId, userName ).then((r) => res.send(r));
  }
);

app.post(
  "/addVote/:sessionId/:userId/:restaurantId/:voteNum",
  (req: express.Request, res: express.Response) => {
    const {sessionId, userId, restaurantId, voteNum} = req.params;
    addVote(sessionId, userId, restaurantId, +voteNum);
    res.send(true);
  }
);

app.post(
  "/addRestaurant/:sessionId/:userId/:restaurantId",
  (req: express.Request, res: express.Response) => {
    const { sessionId, userId, restaurantId } = req.params;
    addRestaurant(sessionId, userId, restaurantId);
    res.send(true);
  }
);

io.on("connection", function (socket) {
  console.log(`socket connected: ${socket.id}`);
  socket.on(
    "newSession",
    (data: NewSessionData, callback: NewSessionCallback) =>
      newSession(data, callback, socket)
  );
  socket.on("tryJoinSession", (data, callback) =>
    tryJoinSession(data, callback, socket)
  );
  socket.on("setUserName", setUserName);
  // socket.on("addRestaurant", addRestaurant);
  // socket.on("voteOnRestaurant", voteOnRestaurant);
});

const newSession = (
  data: NewSessionData,
  callback: NewSessionCallback,
  socket: socket.Socket
) => {
  console.log(`creating new session: ${JSON.stringify(data)}`);
  const sessionId = generateSessionId();
  socket.join(sessionId);
  console.log(`socket ${socket.id} joined ${sessionId}.`);
  const userId = data.userId || generateUserId();
  // new session in cache
  sessionCache[sessionId] = {
    location: data.location,
    creator: userId,
    users: {
      [userId]: { name: data.userName },
    },
    restaurants: {},
  };
  // new session in firebase
  rootRef
    .update({
      [sessionId]: {
        location: data.location,
        creator: userId,
        restaurants: false,
        users: { [userId]: { name: data.userName } },
      },
    })
    .then(() => callback({ success: true, sessionId, userId }))
    .catch((e) => callback({success:false, errorMessage: e}));
};

const tryJoinSession = async (
  data: TryJoinSessionData,
  callback: TryJoinSessionCallback,
  socket: socket.Socket
) => {
  console.log(`joining session: ${JSON.stringify(data)}`);
  if (data.sessionId === "") {
    // ignore requests w/o sessionId; probably from initial useEffect
    return;
  }
  await refreshCache(data.sessionId);
  if (sessionCache[data.sessionId]) {
    socket.join(data.sessionId);
    const userId = data.userId || generateUserId();
    const previouslyAuthenticated = sessionCache[data.sessionId].users[userId]
      ? true
      : false;
    console.log(`sending success callback.`);
    callback({
      success: true,
      userId: userId,
      previouslyAuthenticated: previouslyAuthenticated,
      restaurants: await joinRestaurants(data.sessionId),
      location: sessionCache[data.sessionId].location,
    });
  } else {
    console.log(`sending failure callback.`);
    callback({ success: false });
  }
};

const setUserName = async (
  sessionId: string, userId: string, userName: string
): Promise<boolean> => {
  console.log(`setting userName: ${JSON.stringify({sessionId, userId, userName})}`);
  await refreshCache(sessionId);
  if (!sessionCache[sessionId]) {
    // callback({ success: false });
    return false;
  }
  // update in cache
  sessionCache[sessionId].users[userId] = { name: userName };
  // update in firebase
  await rootRef
    .child(`${sessionId}/users/${userId}`)
    .update({ name: userName })
    .then()
    return true;
  // callback({ success: true });
  ;
};

const addVote = async (
  sessionId: string,
  userId: string,
  restaurantId: string,
  voteNum: number
) => {
  await refreshCache(sessionId);
  // update in cache
  if(sessionCache[sessionId].restaurants[restaurantId]){
    (sessionCache[sessionId].restaurants[restaurantId] as Votes)[userId] = voteNum;
  } else {
    sessionCache[sessionId].restaurants[restaurantId] = {[userId]: voteNum}
  }

  // update in firebase
  rootRef
    .child(`${sessionId}/restaurants/${restaurantId}`)
    .update({ [userId]: voteNum })
    .then(() => {
      console.log("emitting addedVote");
  io.in(sessionId).emit("addedVote", {
    restaurantId: restaurantId,
    votes: shapeVotes(sessionCache[sessionId].restaurants[restaurantId], sessionCache[sessionId].users),
  });
    });
  

}

const addRestaurant = async (
  sessionId: string,
  userId: string,
  restaurantId: string
) => {
  await refreshCache(sessionId);
  // update in cache
  if (sessionCache[sessionId].restaurants) {
    sessionCache[sessionId].restaurants[restaurantId] = {};
  } else {
    sessionCache[sessionId].restaurants = { [restaurantId]: {} };
  }
  // update in firebase
  rootRef
    .child(`${sessionId}/restaurants`)
    .update({ [restaurantId]: false })
    .then();
  console.log("emitting addedRestaurant");
  io.in(sessionId).emit("addedRestaurant", {
    business: await memoizedGetRestaurantById(restaurantId),
    votes: new Array(VOTE_VALUES),
  });
};

let yelpFusion = (url: string): AxiosPromise =>
  axios({
    method: "GET",
    url: url,
    headers: {
      authorization: `Bearer ${yelpApiKey}`,
      "Content-Type": "application/json",
    },
  });

let getRestaurantById = (id: string): Promise<Business> =>
  new Promise((resolve, reject) =>
    yelpFusion(`https://api.yelp.com/v3/businesses/${id}`).then((result) => {
      if (result.status > 200 || result.status > 299) {
        console.log(`request from yelp api rejected: ${result.statusText}`);
        reject();
      }
      resolve(result.data as Business);
    })
  );

let memoizedGetRestaurantById = (id: string): Promise<Business> => {
  if (restaurantCache[id]) {
    return new Promise((resolve, reject) => resolve(restaurantCache[id]));
  }
  return getRestaurantById(id);
};

let restaurantSearch = (
  searchTerm: string,
  location: string
): Promise<Business[]> => {
  console.log(
    `search request: ${searchTerm}, ${location}, restCache is ${JSON.stringify(
      restaurantCache
    )}`
  );
  return new Promise((resolve, reject) => {
    yelpFusion(
      `https://api.yelp.com/v3/businesses/search?categories=restaurant&location=${location}&term=${searchTerm}`
    ).then((result) => {
      result.data.businesses.forEach((b: Business) => {
        restaurantCache[b.id] = b;
      });
      resolve(result.data.businesses as Business[]);
    });
  });
};

const refreshCache = async (sessionId: string) => {
  console.log(`refreshing cache.`);
  if (sessionCache[sessionId]) {
    console.log(`there is already an active session.`);
    return sessionCache[sessionId];
  }
  const dbSessionObj = await new Promise<FirebaseSession>((resolve, reject) =>
    rootRef
      .child(sessionId)
      .once("value", (snp) => resolve(snp.val() as FirebaseSession))
  );
  if (!dbSessionObj) {
    return;
  }
  console.log(`dbSessionObj is ${JSON.stringify(dbSessionObj)}`);
  sessionCache[sessionId] = dbSessionObj;
  restaurantCache =
    (await (Promise as any)
      .allSettled(
        Object.keys(dbSessionObj.restaurants).map(memoizedGetRestaurantById)
      )
      .then((results: any) => {
        results
          .filter((r: any) => r.status === "fulfilled")
          .map((r: any) => {
            console.log(`current value in map: ${JSON.stringify(r.value)}`);
            return r.value;
          })
          .reduce((obj: any, cur: any) => {
            return { ...obj, [cur.id]: cur };
          }, {});
      })) || {};
  console.log("done refreshing cache.");
};

const generateSessionId = (): string => rootRef.push().key!;

const generateUserId = (): string => rootRef.child("users").push().key!;

// uses both caches to create interface accepted by frontend
const joinRestaurants = async (
  sessionId: string
): Promise<{ [id: string]: BusinessWithVotes }> => {
  await refreshCache(sessionId);
  return new Promise((resolve, reject) => {
    (Promise as any)
      .allSettled(
        Object.entries(sessionCache[sessionId].restaurants).map(
          async ([rId, votes]) => {
            console.log(`join map fn: ${JSON.stringify({ rId, votes })}`);
            return {
              business: await memoizedGetRestaurantById(rId),
              votes: shapeVotes(
                // sessionCache[sessionId].restaurants[rId],
                votes,
                sessionCache[sessionId].users
              ),
            };
          }
        )
      )
      .then((result: BusinessWithVotes[]) =>
        // {console.log(`result of promise.allsettled: ${JSON.stringify(result)}`)
        resolve(
          result
            .map((r: any) => r.value)
            .reduce((obj: any, cur: any) => {
              // console.log(`reduce: cur is ${JSON.stringify(cur)}`);
              return { ...obj, [cur.business.id]: cur };
            }, {})
        )
      );
  });
};

const shapeVotes = (votes: Votes | false, users: Users): string[] => {
  let voteArr = new Array(VOTE_VALUES);
  if (!votes) {
    return voteArr;
  }
  Object.entries(votes).forEach(([userId, v]) => {
    if (users[userId]) {
      const name = (users[userId] as { name: string }).name;
      if (voteArr[v]) {
        voteArr[v] += `, ${name}`;
      } else {
        voteArr[v] = name;
      }
    }
  });
  console.log(`shape votes: ${voteArr}`);
  return voteArr;
};
