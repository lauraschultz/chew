import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Search from "./Search";
import { Switch, Link, Route, Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import Login from "./Login";

function App() {
  let [sessionId, setSessionId] = useState("");
  let history = createBrowserHistory();
  return (
    <Router history={history}>
      <Switch>
        <Route path="/getStarted">
          <Login setId={setSessionId}/>
        </Route>
        <Route path="/search">
          <Search />
        </Route>
        <Route path="/">{/* main component */}</Route>
      </Switch>
    </Router>
  );
}

export default App;
