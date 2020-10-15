import React, { useState, FormEvent, useEffect } from "react";
import socket from "./socket";
import Logo from "./assets/chew_logo.svg";
import { UserContextConsumer } from "./UserDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";

export const UserNameModal: React.FC<{ escape: () => void }> = ({ escape }) => {
  let [currentUserName, setCurrentUserName] = useState("");
  const keyPressEvent = (e: KeyboardEvent) => {
    if(e.code === "Escape"){
      escape()
    }
  }
  useEffect(() => {
    window.addEventListener("keydown", keyPressEvent);

    return () => window.removeEventListener("keydown", keyPressEvent);
  });

  return (
    <>
      <div className="p-2 text-white bg-gradient-to-r from-theme-red to-theme-dark-red rounded-t font-bold text-xl">
        <span className="">Welcome to</span>
        <img className="inline w-24 ml-1" src={Logo} />
        <button className="float-right leading-none" onClick={escape}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <UserContextConsumer>
        {(context) => (
          <form
            className="pb-3 px-4 rounded-b bg-white text-gray-700"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (context.userId) {
                socket
                  .setUserName(
                    context.sessionId,
                    context.userId,
                    currentUserName
                  )
                  .then((response) => {
                    console.log(`result of setting name: ${response}`);
                    if (response) {
                      context.setUserState("canVote");
                    }
                  });
              }
            }}
          >
            <div className="text-gray-600 text-sm py-1">
              Invited to {context.creatorName}'s session
            </div>
            <label className="block mx-3">
                {/* <FontAwesomeIcon icon={faUser} /> */}
                <span className="uppercase font-bold text-sm">
                 Your name: 
                </span>
                <div className="py-1 px-2 rounded border border-gray-300 bg-white focus-within:border-theme-blue-l-2 w-max-content">
                  <FontAwesomeIcon icon={faUser} className="mr-2"/>
                  <input
                  className="px-2 focus:outline-none border-l"
                  type="text"
                  value={currentUserName}
                  onChange={(e) => setCurrentUserName(e.target.value)}
                />
                </div>
                
              </label>
            <button
              type="submit"
              className="py-1 uppercase tracking-wide text-sm text-white bg-theme-yellow hover:theme-dark-yellow w-full mt-4 rounded shadow font-bold"
            >
              join session
            </button>
            {/* <div className="flex justify-around">
              <button
                type="button"
                onClick={escape}
                className="py-1 px-2 uppercase tracking-wide text-sm text-gray-500 border border-gray-500 mt-4 rounded shadow font-bold flex-1"
              >
                cancel
              </button>
              <button
                type="submit"
                className="py-1 px-2 uppercase tracking-wide text-sm text-white bg-theme-yellow mt-4 rounded shadow font-bold flex-1"
              >
                done
              </button>
            </div> */}
          </form>
        )}
      </UserContextConsumer>
    </>
  );
};
