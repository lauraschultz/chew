import React, { useState } from "react";
import IceCreamGirl from "./assets/ice_cream_girl.svg";
import Logo from "./assets/chew_logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faInfoCircle,
	faMapMarkerAlt,
	faPizzaSlice,
	faUser,
} from "@fortawesome/free-solid-svg-icons";
import { UserContextConsumer } from "./UserDataContext";
import PlacesAutocomplete from "./PlacesAutocomplete";

const Login: React.FC = () => {
	let [userName, setUserName] = useState(""),
		[location, setLocation] = useState("");
	return (
		<>
			<div className="flex-1 p-4 md:px-6 bg-red text-gray-200 sm:rounded-lg sm:shadow-lg sm:max-w-lg md:m-2 lg:mr-6">
				<img className="w-40" src={Logo} alt="chew logo" />
				<p className="font-display sm:text-lg leading-tight py-1">
					Chew is the easiest way to pick a restaurant with your friends and
					family. Simply create a session, share the link, and everyone can add
					restaurants that they're interested in and vote on each other's
					selections.
				</p>
				<UserContextConsumer>
					{(context) => (
						<form
							onSubmit={(e) => context.createSession(e, userName, location)}
							className="p-3 bg-gray-100 text-gray-600 rounded my-4 sm:mx-4 lg:mx-6 shadow"
						>
							<h2 className="font-bold font-display text-xl text-gray-700 italic">
								Create a new session:
							</h2>
							<hr />
							<label className="block my-3 mx-3">
								<span className="uppercase font-bold text-sm">Your name:</span>
								<div className="py-1 px-2 rounded border border-gray-300 bg-white focus-within:border-blue-light2 w-max-content">
									<FontAwesomeIcon icon={faUser} className="mr-2" />
									<input
										className="px-2 focus:ring-0 border-0 border-l border-gray-300 focus:border-gray-300 py-0"
										type="text"
										value={userName}
										onChange={(e) => setUserName(e.target.value)}
										required
									/>
								</div>
							</label>
							<label className="block my-3 mx-3">
								<span className="uppercase font-bold text-sm">Location:</span>
								<div
									className={
										"py-1 px-2 rounded border border-gray-300 focus:border-gray-300 bg-white focus-within:border-blue-light2 w-max-content "
									}
								>
									<FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
									<input
										className="px-2 focus:ring-0 border-0 border-l border-gray-300 focus:border-gray-300 py-0"
										type="text"
										value={location}
										onChange={(e) => setLocation(e.target.value)}
										required
									/>
								</div>
								<PlacesAutocomplete
									searchTerm={location}
									selectPlace={(place) => setLocation(place)}
								/>
							</label>
							<div className="text-gray-500 italic text-sm leading-none my-2 ml-4 flex items-center">
								<FontAwesomeIcon
									icon={faInfoCircle}
									className="pr-2 flex-none"
									size="2x"
								/>
								<p className="flex-initial">
									Results returned will not be strictly within this area, it
									serves as a starting point for your search.
								</p>
							</div>
							<div className="relative overflow-hidden group text-white">
								<button
									type="submit"
									className="block w-full p-2 uppercase font-bold tracking-wide bg-yellow hover:bg-yellow-dark rounded shadow btn-focus"
								>
									create
								</button>{" "}
								{/* LEFT SIDE */}
								<FontAwesomeIcon
									icon={faPizzaSlice}
									className="absolute left-0 top-0 group-hover:mt-10 group-hover:ml-12 -mt-16 ml-2 opacity-75 transition-spacing duration-500 ease-linear pointer-events-none"
									size="4x"
								/>
								<FontAwesomeIcon
									icon={faPizzaSlice}
									className="absolute left-0 top-0 group-hover:-mt-12 group-hover:ml-24 mt-12 ml-0 opacity-75 transition-spacing duration-300 ease-linear pointer-events-none"
									size="3x"
								/>
								{/* RIGHT SIDE */}
								<FontAwesomeIcon
									icon={faPizzaSlice}
									className="absolute right-0 top-0 group-hover:mt-10 group-hover:mr-24 -mt-20 mr-16 opacity-75 transition-spacing duration-500 ease-linear pointer-events-none"
									size="4x"
								/>
								<FontAwesomeIcon
									icon={faPizzaSlice}
									className="absolute right-0 top-0 group-hover:-mt-12 group-hover:mr-2 mt-16 mr-12 opacity-75 transition-spacing duration-300 ease-linear pointer-events-none"
									size="3x"
								/>
								<FontAwesomeIcon
									icon={faPizzaSlice}
									className="absolute right-0 top-0 group-hover:-mt-12 group-hover:mr-20 mt-16 mr-0 opacity-75 transition-spacing duration-300 ease-linear pointer-events-none"
									size="3x"
								/>
							</div>
						</form>
					)}
				</UserContextConsumer>
				<div className="p-4 border-l-8 border-gray-200 bg-white bg-opacity-25 mx-4 md:my-4 md:mx-8 rounded shadow leading-tight">
					If you are trying to join someone else's session, copy and paste the
					session link to your browser.
				</div>
			</div>

			{/* <div> */}
			<img
				className="flex-1 hidden md:inline max-w-lg"
				src={IceCreamGirl}
				alt="girl holding a giant ice cream cone"
			/>
			{/* </div> */}
		</>
	);
};

export default Login;
