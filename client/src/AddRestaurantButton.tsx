import {
	faCheck,
	faCircleNotch,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import socket from "./socket";

const AddRestaurantButton: React.FC<{
	isRestaurantsAdded: boolean;
	userState: string;
	sessionId: string;
	userId: string;
	businessId: string;
}> = ({ isRestaurantsAdded, userState, sessionId, userId, businessId }) => {
	let [adding, setAdding] = useState(false);
	return (
		<button
			aria-label={
				isRestaurantsAdded
					? "restaurant has already been added"
					: userState === "canVote"
					? "add restaurant"
					: "you must join the session before adding a restaurant"
			}
			data-balloon-pos="right"
			className="py-1 px-2 mr-2 md:mr-4 text-gray-600 border border-gray-300 rounded-full group btn-focus shadow bg-gray-50"
			onClick={() => {
				if (!isRestaurantsAdded && userState === "canVote") {
					setAdding(true);
					socket
						.addRestaurant(sessionId, userId, businessId)
						.then((r) => setAdding(false));
				}
			}}
		>
			<FontAwesomeIcon
				className={adding ? "animate-spin" : ""}
				icon={adding ? faCircleNotch : isRestaurantsAdded ? faCheck : faPlus}
			/>
		</button>
	);
};

export default AddRestaurantButton;
