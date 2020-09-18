import React, { useState } from "react";
import { BusinessWithVotes, Hours } from "./YelpInterfaces";
import Search from "./Search";
import Vote from "./Vote";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronCircleDown,
  faChevronCircleUp,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
// import { matchPath, RouteComponentProps, useParams } from "react-router-dom";

const HoursTable: React.FC<{ hours: Hours }> = ({ hours }) => {
  let days = [
    "Mon",
    "Tues",
    "Weds",
    "Thurs",
    "Fri",
    "Sat",
    "Sun",
  ].map((d: string) => ({ day: d, hourStr: new Array<string>() }));
  let dateify = (start: string, end: string): string =>
    `${start.slice(0, 2)}:${start.slice(2)} - ${end.slice(0, 2)}:${end.slice(
      2
    )}`;
  hours.open.forEach((h) => days[h.day].hourStr.push(dateify(h.start, h.end)));
  return (
    <table>
      <tbody>
        {days.map((day) => (
          <tr>
            <th className="text-left py-0">{day.day}</th>
            <td className="py-0 pl-3">{day.hourStr.join(", ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DisplayItem: React.FC<{
  restaurant: BusinessWithVotes;
  voteOnRestaurant: Function;
}> = ({ restaurant, voteOnRestaurant }) => {
  let isOpenNow = (): boolean => {
    return true;
  };
  let [expanded, setExpanded] = useState(false);
  return (
    <div
      key={restaurant.business.id}
      className="relative p-2 my-2 max-w-md mx-auto "
    >
      <FontAwesomeIcon
        className="absolute m-2 right-0 text-gray-700"
        size="2x"
        icon={expanded ? faChevronCircleUp : faChevronCircleDown}
        onClick={() => setExpanded((prev) => !prev)}
      />
      <h2 className="font-display italic font-bold text-2xl">
        {restaurant.business.name}
      </h2>
      <div className="pl-2">
        <div className="text-gray-700 font-display">
          {restaurant.business.categories.map((c) => c.title).join(", ")}
        </div>
        <div className="text-gray-600 uppercase font-thin tracking-wide -mt-2">
          <FontAwesomeIcon icon={faClock} /> open now
        </div>
        {restaurant.votes &&
          restaurant.votes.map((v, idx) =>
            v.length > 0 ? (
              <span className="m-1 border-gray-700 rounded-sm border-2">
                <span className="bg-gray-700 text-white px-1">{idx}</span>
                <span className="py-1 px-2 text-gray-700">{v}</span>
              </span>
            ) : null
          )}
        {expanded && (
          <div>
          {/* <hr className="my-2"/> */}
          <Vote
            currentVote={undefined}
            addVote={(voteNum: number) =>
              voteOnRestaurant(restaurant.business.id, voteNum)
            }
          />
          <div className="flex">
          {restaurant.business.hours && <div className="flex-shrink-0"><HoursTable hours={restaurant.business.hours[0]} /></div>}
<div className="flex-auto">
  some adress info (kind of very long. whats going to happen?????)
  st paul, MN
  </div>
            </div>
           </div>
        )}
       
      </div>
    </div>
  );
};

const Display: React.FC<{
  restaurants: { [id: string]: BusinessWithVotes };
  voteOnRestaurant: Function;
}> = ({ restaurants, voteOnRestaurant }) => {
  // const { sessionId } = useParams<{ sessionId: string }>();
  return (
    <div className="divide-y divide-gray-400">
      <h2>Restaurants</h2>
      {Object.values(restaurants).map((r) => (
        <DisplayItem
          key={r.business.id}
          restaurant={r}
          voteOnRestaurant={voteOnRestaurant}
        />
      ))}
    </div>
  );
};

export default Display;
