import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/chew_logo.svg"

const AppTemplate: React.FC = ({ children }) => {
  return (
    <div className="bg-gray-100 font-body">
      <nav className="bg-blue-800 text-white">
        <img className="text-white" src={Logo} />
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
