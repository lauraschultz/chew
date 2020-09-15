import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import logo from "./logo.svg";
import "./App.css";
import Search from "./Search";
import {
  Switch,
  Route,
  Router,
  matchPath,
  Redirect,
  BrowserRouter,
  useHistory,
} from "react-router-dom";
import { createBrowserHistory } from "history";
import Login from "./Login";
import Main from "./Main";
import { SERVER } from "./config";
import { BusinessWithVotes, Business } from "./YelpInterfaces";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";
import axios from "axios";
import io from "socket.io-client";

// let history = createBrowserHistory();
let sessionId: string;
let userId: string;

let initialized = false;

const App: React.FC = () => {
  let history = useHistory();
  let [addedRestaurants, setAddedRestaurants] = useState<{
    [id: string]: BusinessWithVotes;
  }>({});
  let [showModal, setShowModal] = useState(false);
  // let modalContent: {title:string, content: React.FC, acceptMsg: string, acceptFunc: Function, closeMsg?:string }
  let modalContent;
  let socket = io.connect(SERVER);
  socket.on("addedRestaurant", (restaurant: BusinessWithVotes) => {
    console.log(`someone added ${JSON.stringify(restaurant)}`);
    setAddedRestaurants((r) => ({
      ...r,
      [restaurant.business.id]: restaurant,
    }));
  });

  const Modal: React.FC = () => {
    let [userName, setUserName] = useState("");
    return (
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          joinSession({ sessionId, userName: userName });
          setShowModal(false);
        }}
      >
        <label>
          your name:
          <input
            value={userName}
            type="text"
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <button type="submit">done</button>
      </form>
    );
  };

  useEffect(() => {
    console.log("useeffect:)");
    // if(!addedRestaurants)
    const match = matchPath<{ sessionId: string }>(history.location.pathname, {
      path: "/ID/:sessionId",
    });
    if (match) {
      if (!Object.keys(addedRestaurants).length) {
        console.log("no added restaurants.");
        const { localSessionId, localUserId } = getLocalStorage();
        // sessionId = localSessionId || "";
        if (localSessionId === match.params.sessionId) {
          sessionId = localSessionId;
          userId = localUserId || "";
          resumeSession({ sessionId }, userId);
          console.log("resume session.");
        } else {
          sessionId = match.params.sessionId;
          console.log("modal");
          modalContent = <Modal />;
          setShowModal(true);
        }
      }
      // resumeSession({sessionId})
    }
  }, []);

  useEffect(
    () =>
      console.log(
        `addedRestaurants is now ${JSON.stringify(addedRestaurants)}`
      ),
    [addedRestaurants]
  );

  socket.on(
    "addedVote",
    (params: {
      restaurantId: string;
      vote: { level: number; names: string[] };
    }) => {
      console.log(`recieved ${JSON.stringify(params)}`);
      console.log(params.restaurantId);
      console.log(addedRestaurants);
      setAddedRestaurants(r => ({
        ...r,
        [params.restaurantId]: {
          business: r[params.restaurantId].business,
          votes: r[params.restaurantId].votes.map((v, idx) => idx===params.vote.level ? params.vote.names : v)
        }
      }))
      // console.log(this);
      // addedRestaurants[params.restaurantId].votes[params.vote.level] =
      //   params.vote.names;
    }
  );

  let resumeSession = (params: { sessionId: string }, userId: string) => {
    socket.emit(
      "resumeSession",
      params,
      (response: {
        success: boolean;
        restaurants: { [id: string]: BusinessWithVotes };
      }) => {
        if (response.success) {
          setLocalStorage(params.sessionId, userId);
          sessionId = params.sessionId;
          userId = userId;
          setAddedRestaurants(response.restaurants);
        } else {
          console.log("whoops!");
        }
      }
    );
  };

  let joinSession = (params: { sessionId: string; userName?: string }) => {
    socket.emit(
      "joinSession",
      params,
      (response: {
        success: boolean;
        userId: string;
        restaurants: { [id: string]: BusinessWithVotes };
      }) => {
        if (!response.success) {
          console.log("unsuccessful.");
        } else {
          setAddedRestaurants(response.restaurants);
          userId = response.userId;
          sessionId = params.sessionId;
          history.push(`/ID/${params.sessionId}`);
          // history.forward();
          // initialized = true;
          setLocalStorage(params.sessionId, userId);
        }
      }
    );
  };

  let newSession = (params: { userName: string; location: string }): void => {
    socket.emit(
      "newSession",
      params,
      (res: { sessionId: string; userId: string }) => {
        console.log(`created new session. response: ${JSON.stringify(res)}`);
        sessionId = res.sessionId;
        userId = res.userId;
        setLocalStorage(res.sessionId, res.userId);
        history.push(`/ID/${sessionId}`);
        // history.forward();
        initialized = true;
      }
    );
  };

  let setLocalStorage = (sId: string, uId: string) => {
    console.log(`setting local storage: ${sId}, ${uId}`);
    localStorage.setItem("rCUserId", uId);
    localStorage.setItem("rCSessionId", sId);
  };

  let getLocalStorage = () => {
    return {
      localSessionId: localStorage.getItem("rCSessionId"),
      localUserId: localStorage.getItem("rCUserId"),
    };
  };

  let addRestaurant = (restaurant: Business): void => {
    console.log(`adding restaurant, sessionId is ${sessionId}`);
    socket.emit("addRestaurant", { restaurant, sessionId }, (res: boolean) => {
      console.log(`response is ${res}`);
    });
  };

  let voteOnRestaurant = (restaurantId: string, voteNum: number) => {
    // console.log(`params are ${JSON.stringify(params)}`)
    socket.emit("voteOnRestaurant", {
      sessionId: sessionId,
      restaurantId: restaurantId,
      userId: userId,
      voteNum: voteNum,
    });
  };

  let search = (term: string): Observable<Business[]> => {
    return from(axios.get(`${SERVER}/search/${term}`)).pipe(
      map((d: any) => {
        console.log(`recieved ${JSON.stringify(d.data)}`);
        return d.data.businesses as Business[];
      })
    );
    //   .catch((e: Error) => console.log(`error: ${e}`));
    // return of([]);
  };
  // const match = matchPath<{ sessionId: string }>(history.location.pathname, {
  //   path: "/:sessionId",
  //   strict: false,
  // });
  return (
    // <Router history={history}>
    // <BrowserRouter>
    <div>
      {showModal && <Modal />}
      <Switch>
        <Route path="/getStarted">
          <Login
            // setSessionId={(id: string) => (sessionId = id)}
            joinSession={joinSession}
            newSession={newSession}
          />
        </Route>
        <Route path="/ID/:sessionId" exact>
          <h2>SESSIONID PATHMATCH</h2>
          <Main
            restaurants={addedRestaurants}
            search={search}
            addRestaurant={addRestaurant}
            voteOnRestaurant={voteOnRestaurant}
            joinSession={joinSession}
          />
        </Route>
        <Route path="/ID/:sessionId/search" exact>
          <h2>SESSIONID SEARCH PATHMATCH</h2>
          <Search
            search={search}
            addRestaurant={addRestaurant}
            voteOnRestaurant={voteOnRestaurant}
          />
        </Route>
        <Route path="/" exact>
          <Redirect to="/getStarted" />
        </Route>
      </Switch>
      {/* </Router> */}
      {/* </BrowserRouter> */}
    </div>
  );
};

export default App;
