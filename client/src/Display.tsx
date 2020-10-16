import React, {  } from "react";
import { BusinessWithVotes } from "./YelpInterfaces";
import Vote from "./Vote";
import DisplayItem from "./DisplayItem";
// import { matchPath, RouteComponentProps, useParams } from "react-router-dom";

const Display: React.FC<{
  voteOnRestaurant: Function;
  addedRestaurants: {[id:string]:BusinessWithVotes}
}> = ({ voteOnRestaurant, addedRestaurants }) => {

  return (
    <div className="divide-y divide-theme-extra-light-gray">
      <h2 className="max-w-md mx-auto text-2xl px-1 text-theme-dark-gray font-display leading-none -mb-1">
        Restaurants
      </h2>
      {Object.keys(addedRestaurants).length === 0 && (
        <div className="text-theme-light-gray py-2 px-4 rounded my-3 border border-theme-light-gray italic text-sm mx-auto max-w-md">
          No restaurants have been added
        </div>
      )}
      {Object.values(addedRestaurants).map((r) => (
        <DisplayItem
          key={r.business.id}
          restaurant={r}
          vote={
            <Vote
              currentVote={undefined}
              addVote={(voteNum: number) =>
                voteOnRestaurant(r.business.id, voteNum)
              }
            />
          }
        />
      ))}
    </div>
  );
};

export default Display;
