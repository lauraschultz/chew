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
import {
  useAddedRestaurants,
  useUserData,
} from "./customHooks";


const App: React.FC = () => {
  let history = useHistory();
  // let addedRestaurants = useAddedRestaurants();
  let [showModal, setShowModal] = useState(false);
  let { userId, sessionId } = useUserData();
  let modalContent;
  // let modalContent: {title:string, content: React.FC, acceptMsg: string, acceptFunc: Function, closeMsg?:string }
  let socket = io.connect(SERVER);
  let {setAddedRestaurants} = useAddedRestaurants()



  // let resumeSession = (params: { sessionId: string }, userId: string) => {
  //   socket.emit(
  //     "resumeSession",
  //     params,
  //     (response: {
  //       success: boolean;
  //       restaurants: { [id: string]: BusinessWithVotes };
  //     }) => {
  //       if (response.success) {
  //         console.log(
  //           `recieved from resumeSession response: ${JSON.stringify(
  //             response.restaurants
  //           )}`
  //         );
  //         setLocalStorage(params.sessionId, userId);
  //         sessionId = params.sessionId;
  //         userId = userId;
  //         setAddedRestaurants(response.restaurants);
  //       } else {
  //         console.log("whoops!");
  //       }
  //     }
  //   );
  // };

  // let joinSession = (params: { sessionId: string; userName?: string }) => {
  //   socket.emit(
  //     "joinSession",
  //     params,
  //     (response: {
  //       success: boolean;
  //       userId: string;
  //       restaurants: { [id: string]: BusinessWithVotes };
  //     }) => {
  //       if (!response.success) {
  //         console.log("unsuccessful.");
  //       } else {
  //         setAddedRestaurants(response.restaurants);
  //         userId = response.userId;
  //         sessionId = params.sessionId;
  //         history.push(`/ID/${params.sessionId}`);
  //         // history.forward();
  //         // initialized = true;
  //         setLocalStorage(params.sessionId, userId);
  //       }
  //     }
  //   );
  // };

  // let newSession = (params: { userName: string; location: string }): void => {
  // socket.emit(
  //   "newSession",
  //   params,
  //   (res: { sessionId: string; userId: string }) => {
  //     console.log(`created new session. response: ${JSON.stringify(res)}`);
  //     sessionId = res.sessionId;
  //     userId = res.userId;
  //     setLocalStorage(res.sessionId, res.userId);
  //     history.push(`/ID/${sessionId}`);
  //     // history.forward();
  //     initialized = true;
  //   }
  // );
  // };

  let voteOnRestaurant = (restaurantId: string, voteNum: number) => {
    // console.log(`params are ${JSON.stringify(params)}`)
    socket.emit("voteOnRestaurant", {
      sessionId: sessionId,
      restaurantId: restaurantId,
      userId: userId,
      voteNum: voteNum,
    });
  };

  let searchRestaurants = (term: string): Promise<Business[]> => {
    return new Promise((resolve, reject) => axios.get(`${SERVER}/search/${sessionId}/${term}`).then(results => {
      console.log(`got fron restaurant search endpt: ${JSON.stringify(results.data)}`)
      resolve(results.data)
      // setAddedRestaurants(results.data)
    }))
      // map((d: any) => {
      //   console.log(`recieved ${JSON.stringify(d.data)}`);
      //   return d.data.businesses as Business[];
      // })
    //   .catch((e: Error) => console.log(`error: ${e}`));
    // return of([]);
  };
  // const match = matchPath<{ sessionId: string }>(history.location.pathname, {
  //   path: "/:sessionId",
  //   strict: false,
  // });
  return (

      <Switch>
        <Route path="/getStarted">
          <LoginTemplate>
            <Login/>
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
                    search={searchRestaurants}
                    voteOnRestaurant={voteOnRestaurant}
                  />
                </div>
              }
              display={
                <div className="flex-1 pt-4">
                  <Display
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

  );
};

export default App;
