import React, { useEffect, useState } from "react";
import { matchPath, useHistory, useLocation } from "react-router-dom";
import { SERVER } from "./config";
// import {
//   subscribeToRestaurantAdded,
//   subscribeToVoteAdded,
//   tryJoinSession,
// } from "./socket";
import socket from "./socket";

import { BusinessWithVotes } from "./YelpInterfaces";

export function useAddedRestaurants() {
  let [addedRestaurants, setAddedRestaurants] = useState<{
    [id: string]: BusinessWithVotes;
  }>({});

  useEffect(
    () =>
      console.log(
        `setting addedRestaurants ${JSON.stringify(addedRestaurants)}`
      ),
    [addedRestaurants]
  );

  socket.subscribeToRestaurantAdded((newRestaurant: BusinessWithVotes) => {
    console.log('recieving an added restaurant.')
    setAddedRestaurants((r) => ({
      ...r,
      [newRestaurant.business.id]: newRestaurant,
    }));
  });

  socket.subscribeToVoteAdded(
    (params: { restaurantId: string; votes: string[] }) => {
      setAddedRestaurants((r) => ({
        ...r,
        [params.restaurantId]: {
          ...r[params.restaurantId],
          votes: params.votes,
        },
      }));
    }
  );

  return { addedRestaurants, setAddedRestaurants };
}

export function useUserData() {
  let [userId, setUserId] = useState<string>();
  let [sessionId, setSessionId] = useState<string>("");
  let [userState, setUserState] = useState<"canView" | "canVote">();
  console.log(`init userState is ${userState}`);
  //     let [addedRestaurants, setAddedRestaurants] = useState<{
  //     [id: string]: BusinessWithVotes;
  // }>({});
  let { setAddedRestaurants } = useAddedRestaurants();
  let location = useLocation();
  let history = useHistory();

  useEffect(() => {
    const sUserId = localStorage.getItem("chewUserId");
    if (sUserId) {
      setUserId(sUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log(`setting localStorage`);
      localStorage.setItem("chewUserId", userId);
    }
  }, [userId]);

  useEffect(() => {
    console.log(`location useEffect`);
    const match = matchPath<{ sessionId: string }>(location.pathname, {
      path: "/ID/:sessionId",
    });
    if (match) {
      setSessionId(match.params.sessionId);
    }
  }, [location]);

  // useEffect(() => {
  //   console.log(`starting useEffect, userState is ${userState}`)
  //   if(userState !== "unauthenticated"){
  //     console.log(`useEffect; user has already been authenticated.`)
  //     return;
  //   }
  //   // if(!addedRestaurants)
  //   const match = matchPath<{ sessionId: string }>(location.pathname, {
  //     path: "/ID/:sessionId",
  //   });
  //   if (match) {
  //     //&& !initialized
  //     console.log(`found match: ${JSON.stringify(match)}`);
  //     const storageUserId = localStorage.getItem("chewUserId");
  //     console.log(
  //       `trying to join session w/ sessionId: ${match.params.sessionId}, userId: ${storageUserId}`
  //     );
  //     socket.tryJoinSession({ sessionId: match.params.sessionId, userId: storageUserId || undefined },
  //       (response) => {
  //         console.log(
  //           `response from tryJoinSession is ${JSON.stringify(response)}`
  //         );
  //         if (response.success) {
  //           setSessionId(match.params.sessionId);
  //           setUserId(response.userId);
  //           setUserState(
  //             response.previouslyAuthenticated ? "canVote" : "canView"
  //           );
  //           setAddedRestaurants(response.restaurants);
  //           // history.push(`/ID/${match.params.sessionId}`);
  //         } else {
  //           console.log("recieved failure from server");
  //         }
  //       },
  //     );
  //     //else redirect?????
  //   } else {
  //     history.replace("/getStarted");
  //   }
  // }, []);

  return {
    userId,
    setUserId,
    userState,
    setUserState,
    sessionId,
    setSessionId,
  };
}

// export function createNewSession(params: { userName: string; location: string }) {
//     let { setUserId, sessionId, setSessionId, setInitialized } = useUserData();
//     let history = useHistory();
//     socket.emit(
//         "newSession",
//         params,
//         (res: { sessionId: string; userId: string }) => {
//             console.log(`created new session. response: ${JSON.stringify(res)}`);
//             setSessionId(res.sessionId);
//             setUserId(res.userId);
//             history.push(`/ID/${sessionId}`);
//             setInitialized(true);
//         }
//     );

// }
