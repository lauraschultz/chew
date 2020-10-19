import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import Logo from "./assets/chew_logo.svg";

const ModalWelcomeHeader:React.FC<{escape: () => void}> = ({escape}) => {
    return <div className="p-2 text-white bg-gradient-to-r from-theme-red to-theme-dark-red rounded-t font-bold text-xl">
    <span className="">Welcome to</span>
    <img className="inline w-24 ml-1 mr-6" src={Logo} />
    <button className="float-right leading-none" onClick={escape}>
      <FontAwesomeIcon icon={faTimes} />
    </button>
  </div>
}

export default ModalWelcomeHeader;