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
import axios from "axios";
import io from "socket.io-client";
import LoginTemplate from "./Templates/LoginTemplate";
import AppTemplate from "./Templates/AppTemplate";
import "./comp.css";
import ModalContainer from "./ModalContainer";
import { UserContextProvider } from "./UserDataContext";
import FourOhFour from "./404";

const App: React.FC = () => {
  let history = useHistory();
  // let addedRestaurants = useAddedRestaurants();
  let [showModal, setShowModal] = useState(false);
  let modalContent;
  // let modalContent: {title:string, content: React.FC, acceptMsg: string, acceptFunc: Function, closeMsg?:string }
  let socket = io.connect(SERVER);

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

  


  // const match = matchPath<{ sessionId: string }>(history.location.pathname, {
  //   path: "/:sessionId",
  //   strict: false,
  // });
  return (
    <UserContextProvider>
      <Switch>
        <Route path="/getStarted" exact>
          <LoginTemplate>
            <Login />
          </LoginTemplate>
        </Route>
        <Route
          path="/ID/:sessionId"
          render={(props) => (
            <AppTemplate />
              
          )}
        ></Route>
        <Route path="/404" exact >
          <FourOhFour />
        </Route>
        <Route path="/">
          <Redirect to="/getStarted" />
        </Route>
      </Switch>
    </UserContextProvider>
  );
};

export default App;
