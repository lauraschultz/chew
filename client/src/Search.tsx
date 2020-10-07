import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { SERVER } from "./config";
import { Business } from "./YelpInterfaces";
import businessCacheService from "./BusinessCacheService";
import Vote from "./Vote";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import DisplayItem from "./DisplayItem";
import { useUserData } from "./customHooks";

const DisplaySearchResults: React.FC<{
  businesses: Business[];
  voteOnRestaurant: Function;
}> = ({ businesses, voteOnRestaurant }) => {
  let {sessionId, userId} = useUserData();
  let [displayVoteComponent, setDisplayVoteComponent] = useState<{
    [id: string]: boolean;
  }>({});
  let toggle = (id: string) => {
    console.log(
      `changing ${id}, currently ${JSON.stringify(displayVoteComponent)}`
    );
    setDisplayVoteComponent((old) => ({
      ...old,
      [id]: !old[id],
    }));
  };
  return (
    <ul className="divide-y divide-theme-extra-light-gray">
      {businesses.map((b) => (
        <li>
          <DisplayItem
            key={b.id}
            restaurant={{ business: b, votes: [] }}
            addRestaurant={
              <button
                // title={displayVoteComponent[b.id] ? "you have already added" : "add this restaurant"}
                aria-label={
                  displayVoteComponent[b.id]
                    ? "this restaurant has already been added"
                    : "add this restaurant"
                }
                data-balloon-pos="down"
                className="py-1 px-2 mr-2 text-theme-med-gray border-2 border-theme-light-gray rounded-full group"
                onClick={() => {
                  if (!displayVoteComponent[b.id]) {
                    axios.post(`${SERVER}/addRestaurant/${sessionId}/${userId}/${b.id}`)
                    toggle(b.id);
                  }
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
                {/* <span className="hidden hover:block absolute">
                <Tooltip>{displayVoteComponent[b.id] ? <p>you have already added</p> : <p>add this restaurant</p>}</Tooltip>
              </span> */}
              </button>
            }
            vote={
              displayVoteComponent[b.id] ? (
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
  search: (term: string) => Promise<Business[]>;
  voteOnRestaurant: Function;
}> = ({ search, voteOnRestaurant }) => {
  let [searchTerm, setSearchTerm] = useState("");
  let [businesses, setBusinesses] = useState(new Array<Business>());
  useEffect(() => businessCacheService.add(businesses), [businesses]);
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
          search(searchTerm).then((b: Business[]) => setBusinesses(b));
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
      />
    </div>
  );
};

export default Search;
