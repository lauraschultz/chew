import React from "react";
import Triangles from "./assets/triangles.svg";
import FooterLinks from "./FooterLinks";
import Logo from "./assets/chew_logo.svg";
import { Link } from "react-router-dom";

const LoginFooter: React.FC = () => (
	<footer className="w-full">
		<img
			src={Triangles}
			alt="decorative footer border"
			className="hidden sm:block"
		/>
		<div className="bg-theme-dark-gray text-white p-2 md:px-8 md:py-4 lg:px-24 block sm:flex justify-around leading-tight items-center">
			<Link to="/getStarted">
				<img
					className="hidden sm:block flex-initial w-32"
					src={Logo}
					alt="chew logo"
				/>
			</Link>
			<div className="flex-initial">
				<FooterLinks />
			</div>
		</div>
	</footer>
);

export default LoginFooter;
