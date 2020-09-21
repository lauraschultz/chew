import React, { useState } from "react";
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
// import { matchPath, RouteComponentProps, useParams } from "react-router-dom";

const formatAsTime = (time: string): string =>
  `${time.slice(0, 2)}:${time.slice(2)}`;

const openMsg = (hours: Hours): string => {
  const padZeros = (n: number) => ("00" + n).slice(-2);
  const today = new Date();
  const dayOfWeek = (((today.getDate() - 1) % 6) + 6) % 6;
  const timeString = padZeros(today.getHours()) + padZeros(today.getMinutes());
  console.log(`day of week: ${dayOfWeek}`);
  let diff = 9999999;
  const days = hours.open.filter((h) => h.day === dayOfWeek);
  if (days.length === 0) {
    return "Closed";
  }
  let t: string | undefined = undefined;
  days.forEach((h) => {
    if (timeString < h.start) {
      // will open later
      const currentDiff = +h.start - +timeString;
      console.log(`found currentDiff: ${currentDiff}`);
      if (currentDiff < diff) {
        t = formatAsTime(h.start);
        diff = currentDiff;
      }
    } else if (timeString < h.end) {
      // open now
      return "Open now";
    }
  });
  if (t) {
    return `Opens at ${t}`;
  }
  return "Closed";
};

const HoursTable: React.FC<{ hours: [Hours]|undefined }> = ({ hours }) => {
  if(!hours) {
    return <div className="text-theme-light-gray py-2 px-4 rounded my-3 border border-theme-light-gray italic text-sm">No hours available.</div>
  }
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
    `${formatAsTime(start)} - ${formatAsTime(end)}`;
  hours[0].open.forEach((h) => days[h.day].hourStr.push(dateify(h.start, h.end)));
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
      className="relative p-1 lg:p-2 my-2 max-w-md mx-auto "
    >
      <button className="fa-layers fa-fw fa-2x absolute m-2 right-0">
        <FontAwesomeIcon
          className=" text-white"
          icon={faCircle}
          onClick={() => setExpanded((prev) => !prev)}
        />
        <FontAwesomeIcon
          className=" text-theme-yellow"
          icon={expanded ? faChevronCircleUp : faChevronCircleDown}
          onClick={() => setExpanded((prev) => !prev)}
        />
      </button>

      <h2 className="font-display italic font-bold text-2xl text-theme-dark-gray">
        {restaurant.business.name}
      {restaurant.business.price && <span className="ml-2 px-1 rounded bg-theme-med-gray text-white text-sm">
        {restaurant.business.price.split("").map(_ => <FontAwesomeIcon icon={faDollarSign} />)}
      </span>}
      </h2>
      <div className="pl-2">
        <div className="text-theme-light-gray font-display -mt-2">
          {restaurant.business.categories.map((c) => c.title).join(", ")}
        </div>
        {restaurant.business.hours && (
          <div className="text-theme-med-gray uppercase font-light tracking-wide -mt-2">
            <FontAwesomeIcon icon={faClock} />{" "}
            {openMsg(restaurant.business.hours[0])}
          </div>
        )}

        {restaurant.votes && <div className="my-2 overflow-x-scroll">
          {restaurant.votes.map((v, idx) =>
            v ? (
              <span className="m-1 border-theme-dark-gray rounded-sm border-2 bg-white bg-opacity-50">
                <span className="bg-theme-dark-gray text-white px-1">
                  <FontAwesomeIcon icon={icons[idx].icon} />
                </span>
                <span className="py-1 px-2 text-theme-dark-gray">{v}</span>
              </span>
            ) : null
          )}</div>}
        {expanded && (
          <div>
            {/* <hr className="my-2"/> */}
            <Vote
              currentVote={undefined}
              addVote={(voteNum: number) =>
                voteOnRestaurant(restaurant.business.id, voteNum)
              }
            />

            <div className="flex justify-around">
              <div className="flex-shrink-0">
                  <HoursTable hours={restaurant.business.hours} />
                </div>
              <div className="flex-initial">
                <div className="flex">
                  <FontAwesomeIcon
                    icon={faMapPin}
                    className="flex-none mt-1 mr-2"
                  />

                  <div className="flex-initial">
                    {restaurant.business.location.display_address.map(
                      (line) => (
                        <p>{line}</p>
                      )
                    )}
                  </div>
                </div>
                {restaurant.business.transactions && (
                  <ul className="mt-3">
                    <h3 className="uppercase tracking-wide font-bold text-theme-med-gray text-sm font-light">
                      Services offered:
                    </h3>

                    {restaurant.business.transactions.map((t) => (
                      <li><FontAwesomeIcon icon={faCheck} className="mr-2 text-green-500"/>{t}</li>
                    ))}
                  </ul>
                )}

                <button className="rounded w-full py-1 px-3 bg-theme-red text-white font-bold italic mt-3">
                  more info
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2"/>
                </button>
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
    <div className="divide-y divide-theme-light-gray divide-opacity-50">
      <h2 className="max-w-md mx-auto text-3xl px-1 -mb-3 text-theme-dark-gray font-display">
        Restaurants
      </h2>
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
