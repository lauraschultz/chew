import React, { FormEvent, useEffect, useState } from "react";
import { matchPath, useHistory, useLocation } from "react-router-dom";
import socket from "./socket";

export const UserContext = React.createContext<any>({});
const { Provider, Consumer } = UserContext;

export const UserContextProvider: React.FC = ({ children }) => {
  let [sessionId, setSessionId] = useState("");
  let [userId, setUserId] = useState<string>();
  let [userState, setUserState] = useState("");
  let [location, setLocation] = useState("");
  let [previousVotes, setPreviousVotes] = useState<{
    [restaurantId: string]: number;
  }>({});
  let [creatorName, setCreatorName] = useState<string>();
  let history = useHistory();

  let appLoc = useLocation();

  useEffect(() => {
    console.log(`useeffect`);
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
    const match = matchPath<{ sessionId: string }>(appLoc.pathname, {
      path: "/ID/:sessionId",
    });
    if (match) {
      setSessionId(match.params.sessionId);
    }
  }, [location, appLoc.pathname]);

  let createSession = (e: FormEvent, userName: string, loc: string) => {
    e.preventDefault();
    setLocation(loc);
    socket.newSession({ userName, location: loc, userId }, (response) => {
      console.log(`emitting newSession. data is ${userName} ${loc} ${userId}`);
      setSessionId(response.sessionId || "");
      setCreatorName(userName);
      setUserId(response.userId);
      setUserState("canVote");
      history.push(`/ID/${response.sessionId}`);
      // history.
      window.history.replaceState({ fromLogin: true }, "");
      // console.log(`window.history.state: ${JSON.stringify(window.history.state)}`)
    });
    // history.push("/home");
    // setSessionId(sessId)
  };
  return (
    <Provider
      value={{
        sessionId,
        setSessionId,
        userId,
        setUserId,
        userState,
        setUserState,
        createSession,
        location,
        setLocation,
        creatorName,
        setCreatorName,
        previousVotes,
        setPreviousVotes,
      }}
    >
      {children}
    </Provider>
  );
};

export { Consumer as UserContextConsumer };
