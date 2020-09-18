import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile, faMeh, faFrown } from "@fortawesome/free-solid-svg-icons";

const Vote: React.FC<{ addVote: Function, currentVote: number | undefined }> = ({ addVote, currentVote }) => {
  const icons = [
    { icon: faSmile, color: "text-green-700", hoverColor: "hover:bg-green-200" },
    { icon: faMeh, color: "text-yellow-600", hoverColor: "hover:bg-yellow-300" },
    { icon: faFrown, color: "text-red-700", hoverColor: "hover:bg-red-200" },
  ];
  return (
    <form className="bg-gray-300 content-center text-center p-1">
      <span className="text-gray-800 tracking-wide font-bold italic uppercase">vote: </span>
      {icons.map((i, idx) => <button className={"px-1 mx-1 rounded-full " + i.color +" " + i.hoverColor} onClick={() => addVote(idx)}>
        <FontAwesomeIcon icon={i.icon} size="1x" />
      </button>)}
      
    </form>
  );
};

export default Vote;
