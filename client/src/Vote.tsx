import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { icons } from "./VotingIcons";
import { useUserData } from "./customHooks";

const Vote: React.FC<{
  addVote: Function;
  currentVote: number | undefined;
}> = ({ addVote, currentVote }) => {
  let {userState} = useUserData()
  if(userState === "canView"){
    return null;
  }
  
  return (
    <form
      className="flex items-center justify-center p-1"
      onSubmit={(e) => e.preventDefault()}
    >
      <span className="text-theme-dark-gray tracking-wide font-bold italic uppercase mt-4">
        vote:{" "}
      </span>
      {icons.map((i, idx) => (
        <button
          key={idx}
          className={"fa-layers fa-fw fa-2x m-1"}
          onClick={() => addVote(idx)}
        >
          {/* <span className="inline-block relative"> */}
          
            <FontAwesomeIcon
            className="text-white"
              icon={faCircle}
              // size="2x"
            />
            <FontAwesomeIcon
            className={i.color}
              icon={i.icon}
              // size="2x"
            />
            
          {/* </span> */}
        </button>
      ))}
    </form>
  );
};

export default Vote;
