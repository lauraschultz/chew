import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { SERVER } from "./config";
import { Business } from "./YelpInterfaces";
import businessCacheService from "./BusinessCacheService";
import Vote from "./Vote";

const DisplaySearchResults: React.FC<{
  businesses: Business[];
  addRestaurant: Function;
  voteOnRestaurant: Function;
}> = ({ businesses, addRestaurant, voteOnRestaurant }) => {
  //   let add = (restaurantId: string) => {
  //     axios.post(`${SERVER}/add/gabbagoo/${restaurantId}`).then();
  //   };
  // let addVote = (vote: number, restaurantId: string) => {
  //   voteOnRestaurant()
  // }
  let [displayVoteComponent, setDisplayVoteComponent] = useState<{[id:string]:boolean}>({});
  let toggle = (id:string) => {
    console.log(`changing ${id}, currently ${JSON.stringify(displayVoteComponent)}`)
    setDisplayVoteComponent(old =>  ({
      ...old,
      [id]: !old[id]
    }))
  }
  return (
    <ul>
      {businesses.map((b) => 
      <li key={b.id}>
            <button
              onClick={() => {
                addRestaurant(b);
                toggle(b.id);
              }}
            >
              add me
            </button>
            <strong>{b.name}</strong>{" "}
            {b.categories.map((c) => (
              <span key={c.alias}> {c.title}</span>
            ))}
            {displayVoteComponent[b.id] ? (
              <Vote addVote={(v: number) => {console.log(`search component. vote is ${v} and restId is ${b.id}`);voteOnRestaurant(b.id, v)}} />
            ) : null}
          </li>
        )}
    </ul>
  );
};

const Search: React.FC<{
  search: Function;
  addRestaurant: Function;
  voteOnRestaurant: Function;
}> = ({ search, addRestaurant, voteOnRestaurant }) => {
  let [searchTerm, setSearchTerm] = useState("");
  let [businesses, setBusinesses] = useState(new Array<Business>());
  useEffect(() => businessCacheService.add(businesses), [businesses]);
  return (
    <div>
      <h2>Search</h2>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          search(searchTerm).subscribe((b: Business[]) => setBusinesses(b));
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            console.log("setting");
            setSearchTerm(e.target.value);
          }}
        ></input>
        <button type="submit">search</button>
      </form>
      <DisplaySearchResults
        businesses={businesses}
        addRestaurant={addRestaurant}
        voteOnRestaurant={voteOnRestaurant}
      />
    </div>
  );
};

export default Search;
