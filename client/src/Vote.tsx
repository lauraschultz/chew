import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "./VotingIcons";
import { UserContext } from "./UserDataContext";

const Vote: React.FC<{
  addVote: Function;
  currentVote: number | undefined;
}> = ({ addVote, currentVote }) => {
  const { userState } = useContext(UserContext);
  if (userState === "canView") {
    return null;
  }

  return (
    <form
      className="flex items-center justify-center"
      onSubmit={(e) => e.preventDefault()}
    >
      <span className="text-theme-dark-gray tracking-wide font-bold italic uppercase mr-2">
        vote:
      </span>
      {icons.map((i, idx) => (
        <button
          key={idx}
          // className={"fa-layers fa-fw fa-2x m-1"}
          className={"p-1 " + (currentVote===idx ? "border rounded-full" + i.borderColor: "")}
          onClick={() => addVote(idx)}
          aria-label={i.descText}
          data-balloon-pos="down"
        >
          <div className="leading-none bg-white rounded-full">
            <FontAwesomeIcon className={i.color} icon={i.icon} size="2x" />
          </div>

          {/* <FontAwesomeIcon
            className="text-white"
              icon={faCircle}
              // size="2x"
            /> */}
        </button>
      ))}
    </form>
  );
};

export default Vote;
