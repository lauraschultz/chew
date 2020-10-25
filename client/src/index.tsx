import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { googleCloudApiKey, SERVER } from "./config";

process.env.REACT_APP_SERVER = SERVER;
process.env.REACT_APP_GOOGLE_CLOUD_API_KEY = googleCloudApiKey;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename="/chew">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
