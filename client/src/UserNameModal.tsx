import React, { useState, FormEvent } from "react";
import socket from "./socket";
import Logo from "./assets/chew_logo.svg";
import { UserContextConsumer } from "./UserDataContext";

export const UserNameModal: React.FC = () => {
  let [currentUserName, setCurrentUserName] = useState("");
  return (
    <>
      <div className="py-2 px-3 text-white bg-gradient-to-r from-theme-red to-theme-dark-red rounded-t font-bold text-xl">
        <span className="">Welcome to</span>
        <img className="inline w-24 ml-1" src={Logo} />
      </div>
      <UserContextConsumer>
          {(context) => (
              <form
              className="pb-3 px-4 rounded-b bg-white text-gray-800"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (context.userId) {
                  socket
                    .setUserName(context.sessionId, context.userId, currentUserName)
                    .then((response) => {
                      console.log(`result of setting name: ${response}`);
                      if (response) {
                        context.setUserState("canVote");
                      }
                    });
                }
              }}
            >
              <div className="uppercase tracking-wide text-gray-600 text-xs pt-1 pb-4">
                invited to AAA's session by BBB
              </div>
              <label>
                your name:
                <input
                  value={currentUserName}
                  type="text"
                  onChange={(e) => setCurrentUserName(e.target.value)}
                  className="border-b-2 border-gray-600 px-1 ml-2"
                />
              </label>
              <button
                type="submit"
                className="py-1 px-1 uppercase tracking-wide text-sm text-white bg-theme-yellow block w-full mt-4 rounded shadow font-bold"
              >
                done
              </button>
            </form>
          )}
      </UserContextConsumer>
      
    </>
  );
};
