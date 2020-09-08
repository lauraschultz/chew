import React, { useState, FormEvent } from "react";
import axios from "axios";
import { SERVER } from "./config";

const Login: React.FC<{setId: Function}> = () => {
  let [userName, setUserName] = useState(""),
    [location, setLocation] = useState(""),
    [sessionId, setSessionId] = useState("");

    let create = (e: FormEvent) => {
        e.preventDefault();
        // axios.post(`${SERVER}/new/${userName}/${location}`).then((response) => {
        //     console.log(`response from adding new session: ${response}`);
        // })
        
    }
  return (
    <div>
      <form onSubmit={create}>
        <h2>Create a new session:</h2>
        <label>
          Your name:
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}/>
        </label>
        <label>
          Location:
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}/>
        </label>
        <button type="submit">create</button>
      </form>

      <form>
        <h2>Join someone else's session:</h2>
        <label>
          Session ID:
          <input type="text" value={sessionId} onChange={(e) => setSessionId(e.target.value)}/>
        </label>
        <button type="submit">join</button>
      </form>
    </div>
  );
}

export default Login;