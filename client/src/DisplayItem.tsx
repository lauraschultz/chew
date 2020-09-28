import {
  faCircle,
  faChevronCircleUp,
  faChevronCircleDown,
  faDollarSign,
  faClock,
  faMapPin,
  faCheck,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useState } from "react";
import Vote from "./Vote";
import { icons } from "./VotingIcons";
import { BusinessWithVotes, Hours } from "./YelpInterfaces";

export const DisplayItem: React.FC<{
  restaurant: BusinessWithVotes;
  // voteOnRestaurant: Function;
  addRestaurant?: ReactNode;
  vote?: ReactNode;
}> = ({ restaurant, addRestaurant, vote }) => {
  let [expanded, setExpanded] = useState(false);
  return (
    <div
      key={restaurant.business.id}
      className="relative p-1 lg:p-2 my-2 max-w-md mx-auto flex"
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

      <div className="flex-initial">{addRestaurant}</div>

      <div className="flex-1">
        <h2 className="leading-none font-display italic font-bold text-xl text-theme-dark-gray">
          {restaurant.business.name}
          {restaurant.business.price && (
            <span className="ml-2 px-1 rounded bg-theme-med-gray text-white text-sm">
              {restaurant.business.price.split("").map((_) => (
                <FontAwesomeIcon icon={faDollarSign} />
              ))}
            </span>
          )}
        </h2>
        <div className="pl-2">
          <div className="text-theme-light-gray font-display leading-tight">
            {restaurant.business.categories.map((c) => c.title).join(", ")}
          </div>
          {restaurant.business.hours && (
            <div className="text-theme-med-gray uppercase font-light tracking-wide text-sm leading-tight">
              <FontAwesomeIcon icon={faClock} />{" "}
              {openMsg(restaurant.business.hours[0])}
            </div>
          )}

          {restaurant.votes.length > 0 && (
            <div className="my-2">
              {restaurant.votes.map((v, idx) =>
                v ? (
                  <span className="m-1 border-theme-dark-gray rounded-sm border-2 bg-white bg-opacity-50 shadow">
                    <span className="bg-theme-dark-gray text-white px-1">
                      <FontAwesomeIcon icon={icons[idx].icon} />
                    </span>
                    <span className="py-1 px-2 text-theme-dark-gray">{v}</span>
                  </span>
                ) : null
              )}
            </div>
          )}
          {!addRestaurant ? vote : null}
          {expanded && (
            <>
              {addRestaurant ? vote : null}

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
                  {restaurant.business.transactions &&
                    restaurant.business.transactions.length > 0 && (
                      <ul className="mt-3">
                        <h3 className="uppercase tracking-wide font-bold text-theme-med-gray text-sm font-light">
                          Services offered:
                        </h3>

                        {restaurant.business.transactions.map((t) => (
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="mr-2 text-green-500"
                            />
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}

                  <a
                    className="block text-center rounded w-full py-1 px-3 bg-theme-red text-white font-bold italic mt-3"
                    href={restaurant.business.url}
                    target="_blank"
                  >
                    more info
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="ml-2"
                    />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const HoursTable: React.FC<{ hours: [Hours] | undefined }> = ({ hours }) => {
  if (!hours) {
    return (
      <div className="text-theme-light-gray py-2 px-4 rounded my-3 border border-theme-light-gray italic text-sm">
        No hours available.
      </div>
    );
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
  hours[0].open.forEach((h) =>
    days[h.day].hourStr.push(dateify(h.start, h.end))
  );
  return (
    <table>
      <tbody>
        {days.map((day) => (
          <tr key={day.day}>
            <th className="text-left py-0">{day.day}</th>
            <td className="py-0 pl-3">
              {day.hourStr.length > 0 ? (
                day.hourStr.join(`,\n`)
              ) : (
                <span className="italic text-theme-light-gray">Closed</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const formatAsTime = (time: string): string =>
  `${time.slice(0, 2)}:${time.slice(2)}`;

const openMsg = (hours: Hours): string => {
  const padZeros = (n: number) => ("00" + n).slice(-2);
  const today = new Date();
  const dayOfWeek = (((today.getDay() - 1) % 6) + 6) % 6;
  const timeString = padZeros(today.getHours()) + padZeros(today.getMinutes());
  console.log(`day of week: ${dayOfWeek}, timeString: ${timeString}`);
  let diff = 9999999;
  const days = hours.open.filter((h) => h.day === dayOfWeek);
  if (days.length === 0) {
    console.log(
      `${JSON.stringify(hours)} is closed because no hrs for todays date`
    );
    return "Closed";
  }
  let t: string | undefined = undefined;
  for (let h of days) {
    if (timeString < h.start) {
      // will open later
      const currentDiff = +h.start - +timeString;
      if (currentDiff < diff) {
        t = formatAsTime(h.start);
        diff = currentDiff;
      }
    } else if (timeString < h.end) {
      // open now
      return "Open now";
    }
  }
  if (t) {
    return `Opens at ${t}`;
  }
  console.log(`${JSON.stringify(hours)} is closed because its too late`);
  return "Closed";
};

export default DisplayItem;