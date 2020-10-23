import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Login from "./Login";
import LoginTemplate from "./Templates/LoginTemplate";
import AppTemplate from "./Templates/AppTemplate";
import "./comp.css";
import { UserContextProvider } from "./UserDataContext";
import FourOhFour from "./404";

const App: React.FC = () => (
  <UserContextProvider>
    <Switch>
      <Route path="/getStarted" exact>
        <LoginTemplate>
          <Login />
        </LoginTemplate>
      </Route>
      <Route path="/ID/:sessionId" render={() => <AppTemplate />}></Route>
      <Route path="/404" exact>
        <FourOhFour />
      </Route>
      <Route path="/" exact>
        <Redirect to="/getStarted" />
      </Route>
      <Route path="/">
        <Redirect to="/404" />
      </Route>
    </Switch>
  </UserContextProvider>
);

export default App;
