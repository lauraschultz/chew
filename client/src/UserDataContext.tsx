import React, { FormEvent, useEffect, useState } from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import socket from './socket';

interface ContextProps {
    createSession: (e: FormEvent, userName: string, location:string) => void,
    sessionId: string,
    setSessionId: (id: string) => void;
}

export const UserContext = React.createContext<any>({
})
const {Provider, Consumer} = UserContext;

export const UserContextProvider: React.FC = ({children}) => {
    let [sessionId, setSessionId] = useState('');
    // let sessionId = '';
    let [userId, setUserId] = useState<string>();
    let [userState, setUserState] = useState('');
    let preAuthenticated = false;
    let history = useHistory();
    let locString = ''
    let location = useLocation();

    useEffect(() => {
      console.log(`location useEffect`);
      const match = matchPath<{ sessionId: string }>(location.pathname, {
        path: "/ID/:sessionId",
      });
      if (match) {
        setSessionId(match.params.sessionId);
      }
    }, [locString]);

    let createSession = (e: FormEvent, userName: string, loc:string) => {
        e.preventDefault();
        locString = loc;
        socket.newSession({ userName, location: loc, userId }, (response) => {
          console.log(
            `emitting newSession. data is ${userName} ${loc} ${userId}`
          );
          setSessionId(response.sessionId || '');
          setUserId(response.userId);
           setUserState("canVote");
           preAuthenticated = true;
          // history.replace()
          history.push(`/ID/${response.sessionId}`);
        });
        // history.push("/home");
        // setSessionId(sessId)
      };
    return <Provider value={{sessionId, setSessionId, userId, setUserId, userState, setUserState, createSession, preAuthenticated, location: locString}}>{children}</Provider>
}

export {Consumer as UserContextConsumer};