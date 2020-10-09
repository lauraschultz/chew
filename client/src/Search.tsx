import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { SERVER } from "./config";
import { Business } from "./YelpInterfaces";
import Vote from "./Vote";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import DisplayItem from "./DisplayItem";
import socket from "./socket";
import serverService from "./ServerService";

const DisplaySearchResults: React.FC<{
  businesses: Business[];
  voteOnRestaurant: Function;
  isAdded: { [id: string]: boolean };
  sessionId: string;
  userId: string;
}> = ({ businesses, voteOnRestaurant, isAdded, sessionId, userId }) => {
  // let {sessionId, userId} = useUserData();
  // let [displayVoteComponent, setDisplayVoteComponent] = useState<{
  //   [id: string]: boolean;
  // }>({});
  // let toggle = (id: string) => {
  //   console.log(
  //     `changing ${id}, currently ${JSON.stringify(displayVoteComponent)}`
  //   );
  //   setDisplayVoteComponent((old) => ({
  //     ...old,
  //     [id]: !old[id],
  //   }));
  // };
  return (
    <ul className="divide-y divide-theme-extra-light-gray">
      {businesses.map((b) => (
        <li key={b.id}>
          <DisplayItem
            restaurant={{ business: b, votes: [] }}
            addRestaurant={
              <button
                // title={displayVoteComponent[b.id] ? "you have already added" : "add this restaurant"}
                aria-label={
                  isAdded[b.id]
                    ? "restaurant has already been added"
                    : "add restaurant"
                }
                data-balloon-pos="right"
                className="py-1 px-2 mr-2 text-theme-med-gray border-2 border-theme-light-gray rounded-full group"
                onClick={() => {
                  if (!isAdded[b.id]) {
                    socket.addRestaurant(sessionId, userId, b.id);
                  }
                }}
              >
                <FontAwesomeIcon icon={isAdded[b.id] ? faCheck : faPlus} />
                {/* <span className="hidden hover:block absolute">
                <Tooltip>{displayVoteComponent[b.id] ? <p>you have already added</p> : <p>add this restaurant</p>}</Tooltip>
              </span> */}
              </button>
            }
            vote={
              isAdded[b.id] ? (
                <Vote
                  currentVote={undefined}
                  addVote={(v: number) => voteOnRestaurant(b.id, v)}
                />
              ) : null
            }
          />
        </li>
      ))}
    </ul>
  );
};

const Search: React.FC<{
  sessionId: string;
  userId: string;
  voteOnRestaurant: Function;
  isAdded: { [id: string]: boolean };
}> = ({ sessionId, userId, voteOnRestaurant, isAdded }) => {
  let [searchTerm, setSearchTerm] = useState("");
  let [businesses, setBusinesses] = useState(new Array<Business>());
  console.log(`SEARCH rerender, isAdded: ${JSON.stringify(isAdded)}`)

  return (
    <div className="max-w-md w-full mx-auto">
      <h2 className="max-w-md mx-auto text-2xl px-1 text-theme-dark-gray font-display leading-none mb-1">
        Search
      </h2>
      <hr className="border-theme-extra-light-gray" />
      <form
        className="p-2 w-full"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          socket
            .search(sessionId, searchTerm)
            .then((b: Business[]) => setBusinesses(b));
        }}
      >
        <input
          className="rounded py-1 px-2 shadow"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            console.log("setting");
            setSearchTerm(e.target.value);
          }}
        ></input>
        <button
          className="shadow py-1 px-2 ml-2 text-white bg-theme-blue rounded-full"
          type="submit"
        >
          <FontAwesomeIcon aria-label="search" icon={faSearch} />
        </button>
      </form>
      <DisplaySearchResults
        businesses={businesses}
        voteOnRestaurant={voteOnRestaurant}
        isAdded={isAdded}
        sessionId={sessionId}
        userId={userId}
      />
    </div>
  );
};

export default Search;
