import React from "react";
import CopySessionUrl from "./CopySessionUrl";
import Waves from "./assets/waves.svg";
import FooterLinks from "./FooterLinks";

const AppFooter: React.FC = () => (
  <footer className="text-theme-red w-full">
    <img src={Waves} alt="decorative footer border"/>
    <div className="bg-theme-red text-white p-2 md:px-8 md:py-4 lg:px-24 block sm:flex justify-around leading-tight">
      <div className="flex-initial">
        <p className="mb-1">Share this session with others:</p>
        <CopySessionUrl
          buttonThemes="bg-white text-theme-red border-white"
          buttonShadowColor="#e8505b"
          inputThemes="border-white bg-theme-red"
        />
      </div>
      <div className="flex-initial">
        <FooterLinks />
      </div>

      {/* <Link to="">show restaurants</Link>
          <Link to="">show search</Link> */}
    </div>
  </footer>
);

export default AppFooter;
