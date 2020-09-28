import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Search from "./Search";
import {
  Switch,
  Route,
  matchPath,
  Redirect,
  useHistory,
} from "react-router-dom";
import Login from "./Login";
import Display from "./Display";
import { SERVER } from "./config";
import { BusinessWithVotes, Business } from "./YelpInterfaces";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";
import axios from "axios";
import io from "socket.io-client";
import LoginTemplate from "./Templates/LoginTemplate";
import AppTemplate from "./Templates/AppTemplate";
import "./comp.css";
import ModalContainer from "./ModalContainer";
import Logo from "./assets/chew_logo.svg";

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
  let modalContent;
  // let modalContent: {title:string, content: React.FC, acceptMsg: string, acceptFunc: Function, closeMsg?:string }
  let socket = io.connect(SERVER);
  socket.on("addedRestaurant", (restaurant: BusinessWithVotes) => {
    console.log(`someone added ${JSON.stringify(restaurant)}`);
    setAddedRestaurants((r) => ({
      ...r,
      [restaurant.business.id]: restaurant,
    }));
  });

  const UserNameModal: React.FC = () => {
    let [userName, setUserName] = useState("");
    return (
      <>
        <div className="py-2 px-3 text-white bg-gradient-to-r from-theme-red to-theme-dark-red rounded-t font-bold text-xl">
          <span className="">Welcome to</span>
          <img className="inline w-24 ml-1" src={Logo} />
        </div>

        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            joinSession({ sessionId, userName: userName });
            setShowModal(false);
          }}
          className="pb-3 px-4 rounded-b bg-white text-gray-800"
        >
          <div className="uppercase tracking-wide text-gray-600 text-xs pt-1 pb-4">
            invited to AAA's session by BBB
          </div>
          <label>
            Your name:
            <input
              value={userName}
              type="text"
              onChange={(e) => setUserName(e.target.value)}
              className="border-b-2 border-gray-600 px-1 ml-2"
            />
          </label>
          <button
            type="submit"
            className="py-1 px-1 uppercase tracking-wide text-sm text-white bg-theme-yellow block w-full mt-4 rounded shadow font-bold"
          >
            Join
          </button>
        </form>
      </>
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
          modalContent = <UserNameModal />;
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
    (params: { restaurantId: string; votes: string[] }) => {
      console.log(`recieved ${JSON.stringify(params)}`);
      console.log(params.restaurantId);
      console.log(addedRestaurants);
      setAddedRestaurants((r) => ({
        ...r,
        [params.restaurantId]: {
          business: r[params.restaurantId].business,
          votes: params.votes,
          // r[params.restaurantId].votes.map((v, idx) =>
          //   idx === params.vote.level ? params.vote.names : v
          // ),
        },
      }));
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
          console.log(
            `recieved from resumeSession response: ${JSON.stringify(
              response.restaurants
            )}`
          );
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
    <>
      <ModalContainer show={showModal}>
        <UserNameModal />
      </ModalContainer>
      <Switch>
        <Route path="/getStarted">
          <LoginTemplate>
            <Login
              // setSessionId={(id: string) => (sessionId = id)}
              joinSession={joinSession}
              newSession={newSession}
            />
          </LoginTemplate>
        </Route>
        <Route
          path="/ID/:sessionId"
          render={(props) => (
            <AppTemplate
              {...props}
              search={
                <div className="flex-1 pt-4">
                  <Search
                    search={search}
                    addRestaurant={addRestaurant}
                    voteOnRestaurant={voteOnRestaurant}
                  />
                </div>
              }
              display={
                <div className="flex-1 pt-4">
                  <Display
                    restaurants={addedRestaurants}
                    voteOnRestaurant={voteOnRestaurant}
                  />
                </div>
              }
            >
              {/* <div className="flex justify-around px-1 pt-4">
              <div className="flex-1">
                <Display
                  restaurants={addedRestaurants}
                  voteOnRestaurant={voteOnRestaurant}
                />
              </div>
              <Route path="/ID/:sessionId/search" exact render={()=><div className="hidden flex-1 md:flex">
                <Search
                  search={search}
                  addRestaurant={addRestaurant}
                  voteOnRestaurant={voteOnRestaurant}
                ></Search>
              </div>} />
              
            </div> */}
            </AppTemplate>
          )}
        ></Route>
        {/* <Route path="/ID/:sessionId/search" exact>
          <AppTemplate>
            <Search
              search={search}
              addRestaurant={addRestaurant}
              voteOnRestaurant={voteOnRestaurant}
            />
          </AppTemplate>
        </Route> */}
        <Route path="/" exact>
          <Redirect to="/getStarted" />
        </Route>
      </Switch>
      {/* </Router> */}
      {/* </BrowserRouter> */}
    </>
  );
};

export default App;
