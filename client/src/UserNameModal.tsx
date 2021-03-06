import React, { useState, FormEvent } from "react";
import socket from "./socket";

import { UserContextConsumer } from "./UserDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import ModalWelcomeHeader from "./ModalWelcomeHeader";

export const UserNameModal: React.FC<{ escape: () => void }> = ({ escape }) => {
	let [currentUserName, setCurrentUserName] = useState("");

	return (
		<>
			<ModalWelcomeHeader onClose={escape} />
			<UserContextConsumer>
				{(context) => (
					<form
						className="pb-4 pt-1 px-6 rounded-b bg-gray-50 text-gray-700"
						onSubmit={(e: FormEvent) => {
							e.preventDefault();
							if (context.userId) {
								socket
									.setUserName(
										context.sessionId,
										context.userId,
										currentUserName
									)
									.then((response) => {
										if (response) {
											context.setUserState("canVote");
										}
									});
							}
						}}
					>
						<div className="text-gray-500 text-sm py-1 italic tracking-wide">
							Invited to {context.creator.name}'s session
						</div>
						<label className="block m-2">
							{/* <FontAwesomeIcon icon={faUser} /> */}
							<span className="uppercase font-bold text-sm">Your name:</span>
							<div className="py-1 px-2 rounded border border-gray-300 bg-white focus-within:border-blue-light2 w-max-content">
								<FontAwesomeIcon icon={faUser} className="mr-2" />
								<input
									className="px-2 focus:ring-0 border-0 border-l border-gray-300 bg-white focus:border-gray-300 py-0"
									type="text"
									value={currentUserName}
									onChange={(e) => setCurrentUserName(e.target.value)}
								/>
							</div>
						</label>
						<button
							type="submit"
							className="py-1 uppercase tracking-wide text-sm text-gray-50 bg-yellow hover:theme-dark-yellow w-full mt-4 rounded shadow font-bold btn-focus"
							aria-label="join session"
						>
							join session
						</button>
					</form>
				)}
			</UserContextConsumer>
		</>
	);
};
