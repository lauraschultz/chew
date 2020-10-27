import React, { FormEvent, useEffect, useState } from "react";
import { matchPath, useHistory, useLocation } from "react-router-dom";
import socket from "./socket";
import md5 from "blueimp-md5";

export const UserContext = React.createContext<any>({});
const { Provider, Consumer } = UserContext;

export const UserContextProvider: React.FC = ({ children }) => {
	let [sessionId, setSessionId] = useState("");
	let [userId, setUserId] = useState<string>();
	let [userState, setUserState] = useState("");
	let [location, setLocation] = useState("");
	let [previousVotes, setPreviousVotes] = useState<{
		[restaurantId: string]: number;
	}>({});
	let [creator, setCreator] = useState<{ name: string; hashId: string }>();
	let [userIdHash, setUserIdHash] = useState("");
	let history = useHistory();

	let appLoc = useLocation();

	useEffect(() => {
		const sUserId = localStorage.getItem("chewUserId");
		if (sUserId) {
			setUserId(sUserId);
		}
	}, []);

	useEffect(() => {
		if (userId) {
			console.log(`setting localStorage`);
			localStorage.setItem("chewUserId", userId);
			setUserIdHash(md5(userId));
		}
	}, [userId]);

	useEffect(() => {
		const match = matchPath<{ sessionId: string }>(appLoc.pathname, {
			path: "/ID/:sessionId",
		});
		if (match) {
			setSessionId(match.params.sessionId);
		}
	}, [location, appLoc.pathname]);

	let createSession = (e: FormEvent, userName: string, loc: string) => {
		e.preventDefault();
		setLocation(loc);
		socket.newSession({ userName, location: loc, userId }, (response) => {
			setSessionId(response.sessionId || "");
			setCreator({ name: userName, hashId: md5(response.userId || "") });
			setUserId(response.userId);
			setUserState("canVote");
			history.push(`/ID/${response.sessionId}`);
			// history.
			window.history.replaceState({ fromLogin: true }, "");
			// console.log(`window.history.state: ${JSON.stringify(window.history.state)}`)
		});
		// history.push("/home");
		// setSessionId(sessId)
	};
	return (
		<Provider
			value={{
				sessionId,
				setSessionId,
				userId,
				userIdHash,
				setUserId,
				userState,
				setUserState,
				createSession,
				location,
				setLocation,
				creator,
				setCreator,
				previousVotes,
				setPreviousVotes,
			}}
		>
			{children}
		</Provider>
	);
};

export { Consumer as UserContextConsumer };
