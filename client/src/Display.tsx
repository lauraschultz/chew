import React, { useEffect, useState } from "react";
import { BusinessWithVotes, Hours } from "./YelpInterfaces";
import Search from "./Search";
import Vote from "./Vote";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronCircleDown,
  faChevronCircleUp,
  faCircle,
  faClock,
  faDollarSign,
  faExternalLinkAlt,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import { icons } from "./VotingIcons";
import DisplayItem from "./DisplayItem";
import { Link } from "react-router-dom";
import { useAddedRestaurants } from "./customHooks";
// import { matchPath, RouteComponentProps, useParams } from "react-router-dom";

const Display: React.FC<{
  voteOnRestaurant: Function;
}> = ({ voteOnRestaurant }) => {
  let { addedRestaurants } = useAddedRestaurants();
  console.log(`hellllloooooooooooo`);
  console.log(
    `display component: addedRestaurants is ${JSON.stringify(addedRestaurants)}`
  );
  // const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <div className="divide-y divide-theme-extra-light-gray">
      <h2 className="max-w-md mx-auto text-2xl px-1 text-theme-dark-gray font-display leading-none -mb-1">
        Restaurants
      </h2>
      {Object.keys(addedRestaurants).length === 0 && (
        <div className="text-theme-light-gray py-2 px-4 rounded my-3 border border-theme-light-gray italic text-sm">
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
