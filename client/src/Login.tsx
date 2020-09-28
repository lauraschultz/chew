import React, { useState, FormEvent } from "react";
import { useHistory } from "react-router-dom";

const Login: React.FC<{joinSession: Function, newSession: Function}> = ({joinSession, newSession }) => {
  let [userName, setUserName] = useState(""),
    [location, setLocation] = useState(""),
    [sessionId, setSessionId] = useState("");

    let history = useHistory();

  let create = (e: FormEvent) => {
    e.preventDefault();
    newSession({ userName, location });
    // history.push("/home");
    // setSessionId(sessId)
  };

  let join = (e: FormEvent) => {
    e.preventDefault();
    console.log(`join session, username is ${userName}`)
    joinSession({sessionId, userName});
    // history.push("/home");
    
  };
  return (
    <>
      <form onSubmit={create}>
        <h2>Create a new session:</h2>
        <label>
          Your name:
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <button type="submit">create</button>
      </form>

      <form onSubmit={join}>
        <h2>Join someone else's session:</h2>
        <label>
          Session ID:
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
        </label>
        <button type="submit">join</button>
      </form>
    </>
  );
};

export default Login;
