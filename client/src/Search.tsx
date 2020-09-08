import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { SERVER } from "./config";
import { Business } from "./YelpInterfaces";
import businessCacheService from "./BusinessCacheService";
import serverService from "./ServerService";

const DisplaySearchResults: React.FC<{ businesses: Business[] }> = ({
  businesses,
}) => {
//   let add = (restaurantId: string) => {
//     axios.post(`${SERVER}/add/gabbagoo/${restaurantId}`).then();
//   };
  return (
    <ul>
      {businesses.map((b) => (
        <li key={b.id}>
          <button onClick={() => serverService.addRestaurant(b)}>add me</button>
          <strong>{b.name}</strong>{" "}
          {b.categories.map((c) => (
            <span key={c.alias}> {c.title}</span>
          ))}
        </li>
      ))}
    </ul>
  );
};

const Search: React.FC = () => {
  let [searchTerm, setSearchTerm] = useState("");
  let [businesses, setBusinesses] = useState(new Array<Business>());
  useEffect(() => businessCacheService.add(businesses), [businesses]);
  return (
    <div>
      <h2>Search</h2>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          serverService.search(searchTerm).subscribe(b => {console.log('promise returned.');setBusinesses(b)});
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
      <DisplaySearchResults businesses={businesses} />
    </div>
  );
}

export default Search;
