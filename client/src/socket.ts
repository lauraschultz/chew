import io from "socket.io-client";
import {
	NewSessionData,
	NewSessionCallback,
	TryJoinSessionData,
	TryJoinSessionCallback,
	Business,
} from "../../shared/types";
import axios from "axios";
const SERVER = process.env.REACT_APP_SERVER || "localhost:4000";

export class Socket {
	socket: SocketIOClient.Socket;

	constructor() {
		this.socket = io.connect(SERVER);
	}

	search = (
		sessionId: string,
		searchTerm: string,
		openHours: string,
		priceRange: string,
		services: string
	): Promise<Business[]> =>
		new Promise((resolve, reject) =>
			axios
				.get(
					`${SERVER}/search/${sessionId}/${searchTerm}/${openHours}/${priceRange}/${services}`
				)
				.then((result) => resolve(result.data))
		);

	setUserName = (
		sessionId: string,
		userId: string,
		userName: string
	): Promise<boolean> =>
		new Promise((resolve, reject) =>
			axios
				.post(`${SERVER}/setUserName/${sessionId}/${userId}/${userName}`)
				.then((result) => resolve(result.data))
				.catch(() => console.log(`error`))
		);

	addVote = (
		sessionId: string,
		userId: string,
		restaurantId: string,
		voteNum: number
	): Promise<boolean> =>
		new Promise((resolve, reject) =>
			axios
				.post(
					`${SERVER}/addVote/${sessionId}/${userId}/${restaurantId}/${voteNum}`
				)
				.then((result) => resolve(result.data))
		);

	addRestaurant = (
		sessionId: string,
		userId: string,
		restaurantId: string
	): Promise<boolean> =>
		new Promise((resolve, reject) =>
			axios
				.post(`${SERVER}/addRestaurant/${sessionId}/${userId}/${restaurantId}`)
				.then((result) => resolve(result.data))
		);

	removeRestaurant = (
		sessionId: string,
		userId: string,
		restaurantId: string
	): Promise<boolean> =>
		new Promise((resolve, reject) =>
			axios
				.post(
					`${SERVER}/removeRestaurant/${sessionId}/${userId}/${restaurantId}`
				)
				.then((result) => resolve(result.data))
		);

	autocomplete = (sessionId: string, searchTerm: string): Promise<string[]> => {
		return new Promise((resolve, reject) =>
			axios
				.get(`${SERVER}/autocomplete/${sessionId}/${searchTerm}`)
				.then((result) => resolve(result.data))
		);
	};

	emit = (data: any, callback: (p: any) => void, title: string) => {
		console.log(`socket emitting ${title} with data ${JSON.stringify(data)}`);
		this.socket.emit(title, data, callback);
	};

	newSession: (data: NewSessionData, callback: NewSessionCallback) => void = (
		data,
		callback
	) => {
		this.emit(data, callback, "newSession");
	};

	tryJoinSession: (
		data: TryJoinSessionData,
		callback: TryJoinSessionCallback
	) => void = (data, callback) => {
		this.emit(data, callback, "tryJoinSession");
	};

	subscribeToVoteAdded = (callback: Function) => {
		this.socket.on("addedVote", callback);
	};

	unSubscribeToVoteAdded = () => {
		this.socket.off("addedVote");
	};

	subscribeToRestaurantAdded = (callback: Function) => {
		this.socket.on("addedRestaurant", callback);
	};

	unSubscribeToRestaurantAdded = () => {
		this.socket.off("addedRestaurant");
	};

	subscribeToRestaurantRemoved = (callback: Function) => {
		this.socket.on("removedRestaurant", callback);
	};

	unSubscribeToRestaurantRemoved = () => {
		this.socket.off("removedRestaurant");
	};
}

let socket = new Socket();
export default socket;
