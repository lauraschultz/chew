import {
  faCopyright,
  faStar,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Footer: React.FC = () => (
  <footer className="text-theme-red w-full">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 818 55"  xmlns="http://www.w3.org/2000/svg">
<path d="M-6.10352e-05 13.9999C61 13 67 54 158 55C249 56 360 2.00001 476 1.00001C592 6.17467e-06 580 43.9999 665 43.9999C750 43.9999 762 12 818 13.9999V55H-6.10352e-05V13.9999Z" fill="currentColor"/>
</svg>

    {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
      <path
        fill="currentColor"
        fill-opacity="1"
        d="M0,256L34.3,234.7C68.6,213,137,171,206,138.7C274.3,107,343,85,411,96C480,107,549,149,617,186.7C685.7,224,754,256,823,245.3C891.4,235,960,181,1029,176C1097.1,171,1166,213,1234,208C1302.9,203,1371,149,1406,122.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
      ></path>
    </svg> */}
    <div className="bg-theme-red text-white p-2 md:px-8 md:py-4 lg:px-24 block md:flex justify-around leading-tight">
      <div className="flex-1">
        <p>
          <FontAwesomeIcon icon={faCopyright} size="sm" className="mr-2" />
          <a href="" target="_blank">
            Laura Schultz
          </a>{" "}
          2020
        </p>
        <a
          className="block"
          href="http://github.com/lauraschultz/chew"
          target="_blank"
        >
          <FontAwesomeIcon icon={faStar} size="sm" className="mr-2" />
          star on Github
        </a>
      </div>
      <div className="flex-1">
        <a className="block">
          <FontAwesomeIcon icon={faFileSignature} size="sm" className="mr-2" />
          terms of use & privacy policy
        </a>
      </div>

      {/* <Link to="">show restaurants</Link>
          <Link to="">show search</Link> */}
    </div>
  </footer>
);

export default Footer;
