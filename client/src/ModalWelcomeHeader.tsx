import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Logo from "./assets/chew_logo.svg";

const ModalWelcomeHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	return (
		<div className="px-6 py-4 text-gray-50 bg-gradient-to-r from-red to-red-dark rounded-t font-bold text-xl relative">
			<span className="">Welcome to</span>
			<img className="inline w-24 ml-1 mr-6" src={Logo} alt="chew logo" />
			<button
				className="absolute top-0 right-0 m-3 leading-none btn-focus"
				onClick={onClose}
				aria-label="close modal"
			>
				<FontAwesomeIcon icon={faTimes} />
			</button>
		</div>
	);
};

export default ModalWelcomeHeader;
