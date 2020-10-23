import React from "react"
import ReadingGirl from "./assets/reading_girl.svg";
import LoginTemplate from "./Templates/LoginTemplate";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const FourOhFour:React.FC = () => <LoginTemplate>
      <div className="flex-1 py-2 px-4 md:py-4 md:px-6 bg-white text-theme-dark rounded-lg shadow-lg max-w-md md:m-2 lg:mr-6">
        <h2 className="text-xl font-display font-bold italic">Page not found</h2>
        <p className="leading-tight mt-1">
            If you are trying to join someone's session, please make sure you have entered the url correctly.
        </p>
        <Link to="/getStarted" className="inline-block shadow rounded bg-theme-red py-1 px-2 text-sm text-white uppercase tracking-wide mt-3">
            <FontAwesomeIcon icon={faHome} className="mr-2" />
           Go home 
        </Link>
    </div>
    <img src={ReadingGirl} className="flex-1 max-w-md" alt="girl reading a book"/>

</LoginTemplate>

export default FourOhFour;