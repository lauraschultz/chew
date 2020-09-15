import React, { useState } from "react";
import { BusinessWithVotes } from "./YelpInterfaces";
import Search from "./Search";
import { matchPath, RouteComponentProps, useParams } from "react-router-dom";

const Main: React.FC<{
  restaurants: { [id: string]: BusinessWithVotes };
  search: Function;
  addRestaurant: Function;
  voteOnRestaurant: Function;
  joinSession: Function;
}> = ({ restaurants, search, voteOnRestaurant, addRestaurant }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <div>
      <h2>{sessionId}</h2>
      {Object.values(restaurants).map((r) => (
        <div key={r.business.id}>
          {r.business && <p>{r.business.name}</p>}
          {r.votes && r.votes.map((v, idx) => (<span>{idx}: {v}</span>))}
        </div>
      ))}
      <Search
        search={search}
        addRestaurant={addRestaurant}
        voteOnRestaurant={voteOnRestaurant}
      />
    </div>
  );
};

export default Main;
