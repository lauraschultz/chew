import React from "react";
import Papers from "./assets/papers.svg";
import LoginTemplate from "./Templates/LoginTemplate";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const TOS: React.FC = () => (
	<LoginTemplate>
		<img
			src={Papers}
			className="hidden md:inline flex-1 max-w-md"
			alt="girl reading a book"
		/>
		<div className="flex-1 py-2 px-4 md:py-4 md:px-6 bg-white text-dark-800 rounded-lg shadow-lg max-w-md m-2 lg:mr-6">
			<h2 className="text-xl font-display font-bold italic">
				Terms of Use and Privacy Policy
			</h2>
			<p className="leading-tight mt-1 px-2">
				By using Chew, you are bound by Google's{" "}
				<a
					className="border-b border-blue-light2"
					href="https://policies.google.com/terms?hl=en"
					target="_blank"
					rel="noopener noreferrer"
				>
					Terms of Service
				</a>
				.
			</p>
			<p className="leading-tight mt-1 px-2">
				Chew uses the Google Places API on the <i>Get Started</i> page to
				provide location suggestions and to autocomplete your searches. For
				information about what data Google collects and how they use it, please
				read{" "}
				<a
					className="border-b border-blue-light2"
					href="https://policies.google.com/privacy"
					target="_blank"
					rel="noopener noreferrer"
				>
					Google's Privacy Policy
				</a>
				.
			</p>
			<Link
				to="/getStarted"
				className="inline-block shadow rounded bg-red py-1 px-2 text-sm text-white uppercase tracking-wide mt-3"
			>
				<FontAwesomeIcon icon={faHome} className="mr-2" />
				Go home
			</Link>
		</div>
	</LoginTemplate>
);

export default TOS;
