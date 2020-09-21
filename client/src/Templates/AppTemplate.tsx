import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/chew_logo.svg"

const AppTemplate: React.FC = ({ children }) => {
  return (
    <div className="bg-theme-light font-body h-screen w-screen">
      <nav className="bg-theme-red text-white shadow">
        <img className="text-white" src={Logo} alt="chew logo"/>
        <Link to="/getStarted">leave this group</Link>
      </nav>

      {children}

      <div>
        <Link to="">show restaurants</Link>
        <Link to="">show search</Link>
      </div>
    </div>
  );
};

export default AppTemplate;
