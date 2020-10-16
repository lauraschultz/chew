import React, { useState, FormEvent } from "react";
import { useHistory } from "react-router-dom";
import IceCreamGirl from "./assets/ice_cream_girl.svg";
import Logo from "./assets/chew_logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faMapMarkerAlt,
  faMapPin,
  faPizzaSlice,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
// import { newSession } from "./socket";
import socket from "./socket";
import { UserContextConsumer } from "./UserDataContext";
import PlacesAutocomplete from "./PlacesAutocomplete";

const Login: React.FC = () => {
  let [userName, setUserName] = useState(""),
    [location, setLocation] = useState("");
    // {
    //   sessionId,
    //   setSessionId,
    //   userId,
    //   setUserId,
    //   setUserState,
    // } = useUserData();
  // [sessionId, setSessionId] = useState("");

  // let history = useHistory();

  

  // let join = (e: FormEvent) => {
  //   e.preventDefault();
  //   console.log(`join session, username is ${userName}`);
  //   joinSession({ sessionId, userName });
  //   // history.push("/home");
  // };
  return (
    <>
      <div className="flex-1 py-2 px-4 md:px-6 bg-theme-red text-gray-200 rounded-lg shadow-lg max-w-lg md:m-2 lg:mr-6">
        <img className="w-40" src={Logo} />
        <p className="font-display text-lg leading-tight py-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime magnam
          minus rem quasi eum doloremque autem, unde recusandae quia cum,
          aliquid, accusantium dicta natus odio ducimus? Blanditiis architecto
          aliquam nam.
        </p>
        <UserContextConsumer>
          {(context) => (
            <form
              onSubmit={(e) => context.createSession(e, userName, location)}
              className="p-3 bg-gray-100 text-gray-600 rounded my-4 mx-4 lg:mx-6 shadow"
            >
              <h2 className="font-bold font-display text-xl text-gray-700 italic">
                Create a new session:
              </h2>
              <hr />
              <label className="block my-2 mx-3">
                {/* <FontAwesomeIcon icon={faUser} /> */}
                <span className="uppercase font-bold text-sm">
                 Your name: 
                </span>
                <div className="py-1 px-2 rounded border border-gray-300 bg-white focus-within:border-theme-blue-l-2 w-max-content">
                  <FontAwesomeIcon icon={faUser} className="mr-2"/>
                  <input
                  className="px-2 focus:outline-none border-l"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                </div>
                
              </label>
              <label className="block my-2 mx-3">
                {/* <FontAwesomeIcon icon={faUser} /> */}
                <span className="uppercase font-bold text-sm">
                 Location: 
                </span>
                <div className="py-1 px-2 rounded border border-gray-300 bg-white focus-within:border-theme-blue-l-2 w-max-content">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2"/>
                  <input
                  className="px-2 focus:outline-none border-l"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <PlacesAutocomplete searchTerm={location} selectPlace={(place) => setLocation(place)}/>
                </div>
                
              </label>
              <div className="text-gray-500 italic text-sm leading-none my-2 ml-4 flex items-center">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="pr-2 flex-none"
                  size="2x"
                />
                <p className="flex-initial">
                  Results returned will not be strictly within this area, it
                  serves as a starting point for your search.
                </p>
              </div>
              <div className="relative overflow-hidden group text-white">
                <button
                  type="submit"
                  className="block w-full p-2 uppercase font-bold tracking-wide bg-theme-yellow hover:bg-theme-dark-yellow rounded shadow"
                >
                  create
                </button>{" "}
                {/* LEFT SIDE */}
                <FontAwesomeIcon
                  icon={faPizzaSlice}
                  className="absolute left-0 top-0 group-hover:mt-10 group-hover:ml-12 -mt-16 ml-2 opacity-75 transition-spacing duration-500 ease-linear pointer-events-none"
                  size="4x"
                />
                <FontAwesomeIcon
                  icon={faPizzaSlice}
                  className="absolute left-0 top-0 group-hover:-mt-12 group-hover:ml-24 mt-12 ml-0 opacity-75 transition-spacing duration-300 ease-linear pointer-events-none"
                  size="3x"
                />
                {/* RIGHT SIDE */}
                <FontAwesomeIcon
                  icon={faPizzaSlice}
                  className="absolute right-0 top-0 group-hover:mt-10 group-hover:mr-24 -mt-20 mr-16 opacity-75 transition-spacing duration-500 ease-linear pointer-events-none"
                  size="4x"
                />
                <FontAwesomeIcon
                  icon={faPizzaSlice}
                  className="absolute right-0 top-0 group-hover:-mt-12 group-hover:mr-2 mt-16 mr-12 opacity-75 transition-spacing duration-300 ease-linear pointer-events-none"
                  size="3x"
                />
                <FontAwesomeIcon
                  icon={faPizzaSlice}
                  className="absolute right-0 top-0 group-hover:-mt-12 group-hover:mr-20 mt-16 mr-0 opacity-75 transition-spacing duration-300 ease-linear pointer-events-none"
                  size="3x"
                />
              </div>
            </form>
          )}
        </UserContextConsumer>
        <div className="p-4 border-l-8 border-gray-200 bg-white bg-opacity-25 m-2 md:my-4 md:mx-8 rounded shadow leading-tight">
          If you are trying to join someone else's session, lorem ipsum dolor
          sit amet consectetur adipisicing elit.
        </div>
      </div>

      <div className="flex-1 hidden md:inline max-w-lg">
        <img src={IceCreamGirl} />
      </div>

      {/* <form onSubmit={join}>
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
      </form> */}
    </>
  );
};

export default Login;
