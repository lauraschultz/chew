import { faStar, faFileSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

const FooterLinks: React.FC = () => (
	<>
		<a
			className="block"
			href="http://github.com/lauraschultz/chew"
			target="_blank"
			rel="noopener noreferrer"
		>
			<FontAwesomeIcon icon={faStar} size="sm" className="mr-2" />
			star on Github
		</a>
		<Link to="/TOS">
			<FontAwesomeIcon icon={faFileSignature} size="sm" className="mr-2" />
			terms of use & privacy policy
		</Link>
	</>
);

export default FooterLinks;
