import React, { useContext } from "react";
import { BusinessWithVotes } from "../../shared/types";
import Vote from "./Vote";
import DisplayItem from "./DisplayItem";
import { UserContext } from "./UserDataContext";

const Display: React.FC<{
	voteOnRestaurant: Function;
	addedRestaurants: { [id: string]: BusinessWithVotes };
}> = ({ voteOnRestaurant, addedRestaurants }) => {
	let {
		previousVotes,
		setPreviousVotes,
		userIdHash,
		userId,
		sessionId,
	} = useContext(UserContext);
	return (
		<>
			<h2 className="max-w-md mx-auto text-2xl px-1 text-gray-800 font-display leading-none">
				Restaurants
			</h2>
			{Object.keys(addedRestaurants).length === 0 && (
				<div className="text-gray-500 py-2 px-4 rounded my-3 border border-gray-300 italic text-sm mx-auto max-w-md">
					No restaurants have been added
				</div>
			)}
			{Object.values(addedRestaurants).map((r) => (
				<DisplayItem
					key={r.business.id}
					restaurant={r}
					vote={
						<Vote
							currentVote={previousVotes[r.business.id]}
							addVote={(voteNum: number) => {
								voteOnRestaurant(r.business.id, voteNum);
								setPreviousVotes((old: { [restaurantId: string]: number }) => ({
									...old,
									[r.business.id]: voteNum,
								}));
							}}
						/>
					}
					userIdHash={userIdHash}
					userId={userId}
					sessionId={sessionId}
				/>
			))}
		</>
	);
};

export default Display;
