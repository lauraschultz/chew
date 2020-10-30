import express from "express";
import axios, { AxiosPromise } from "axios";
import firebase from "firebase";
import socket from "socket.io";
import { firebaseConfig, googleCloudApiKey, yelpApiKey } from "../config";
import { FirebaseDb, FirebaseSession, Users, Votes } from "../firebaseTypes";
import {
	Business,
	BusinessWithVotes,
	NewSessionData,
	NewSessionCallback,
	TryJoinSessionCallback,
	TryJoinSessionData,
	Hours,
} from "./types";
import md5 from "blueimp-md5";

const PORT = process.env.PORT || 4000;
const VOTE_VALUES = 4;
const TIME_BETWEEN_REQUESTS = 190;

let restaurantCache: { [yelpId: string]: Business } = {};
console.log(`resetting restCache.`);
let sessionCache: FirebaseDb = {};
let requestTimer;

firebase.initializeApp(firebaseConfig);
let database = firebase.database(),
	app = express(),
	server = app.listen(PORT, () => console.log(`listening on port ${PORT}`)),
	io = socket(server, { origins: "*:*" });

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});
const rootRef = database.ref();

const dashReplacement = "_usedToBeADash_";

app.get(
	"/search/:sessionId/:searchTerm/:openHours/:priceRange/:services",
	async (req: express.Request, res: express.Response) => {
		console.log(`searching: ${JSON.stringify(req.params)}`);
		const {
			sessionId,
			searchTerm,
			openHours,
			priceRange,
			services,
		} = req.params;
		await refreshCache(sessionId);
		// console.log(`refreshed cache: ${JSON.stringify(sessionCache)}`)
		restaurantSearch(
			searchTerm,
			sessionCache[sessionId].location || "",
			openHours,
			priceRange,
			services
		).then((result) => res.send(result));
	}
);

app.post(
	"/setUserName/:sessionId/:userId/:userName",
	(req: express.Request, res: express.Response) => {
		const { sessionId, userId, userName } = req.params;
		setUserName(sessionId, userId, userName).then((r) => res.send(r));
	}
);

app.post(
	"/addVote/:sessionId/:userId/:restaurantId/:voteNum",
	async (req: express.Request, res: express.Response) => {
		const { sessionId, userId, restaurantId, voteNum } = req.params;
		await addVote(sessionId, userId, restaurantId, +voteNum);
		res.send(true);
	}
);

app.post(
	"/addRestaurant/:sessionId/:userId/:restaurantId",
	async (req: express.Request, res: express.Response) => {
		const { sessionId, userId, restaurantId } = req.params;
		await addRestaurant(sessionId, userId, restaurantId).then((r) =>
			res.send(r)
		);
	}
);

app.post(
	"/removeRestaurant/:sessionId/:userId/:restaurantId",
	async (req: express.Request, res: express.Response) => {
		const { sessionId, userId, restaurantId } = req.params;
		await removeRestaurant(sessionId, userId, restaurantId);
		res.send(true);
	}
);

app.get(
	"/autocomplete/:sessionId/:searchTerm",
	(req: express.Request, res: express.Response) => {
		const { sessionId, searchTerm } = req.params;
		autocomplete(searchTerm, sessionId)
			.then((result) => res.send(result))
			.catch(() => res.send([]));
	}
);

io.on("connection", function (socket) {
	console.log(`socket connected: ${socket.id}`);
	socket.on(
		"newSession",
		(data: NewSessionData, callback: NewSessionCallback) =>
			newSession(data, callback, socket)
	);
	socket.on("tryJoinSession", (data, callback) =>
		tryJoinSession(data, callback, socket)
	);
	socket.on("setUserName", setUserName);
	// socket.on("addRestaurant", addRestaurant);
	// socket.on("voteOnRestaurant", voteOnRestaurant);
});

const newSession = async (
	data: NewSessionData,
	callback: NewSessionCallback,
	socket: socket.Socket
) => {
	console.log(`creating new session: ${JSON.stringify(data)}`);
	const sessionId = generateSessionId();
	socket.join(sessionId);
	console.log(`socket ${socket.id} joined ${sessionId}.`);
	const userId = data.userId || generateUserId();
	// new session in cache
	const latLng = (await getLatLngFromAddress(data.location)) || {
		lat: undefined,
		lng: undefined,
	};
	sessionCache[sessionId] = {
		location: data.location,
		lat: latLng.lat,
		lng: latLng.lng,
		creatorId: userId,
		users: {
			[userId]: { name: data.userName },
		},
		restaurants: {},
	};
	// new session in firebase
	rootRef
		.update({
			[sessionId]: {
				location: data.location,
				lat: latLng.lat,
				lng: latLng.lng,
				creatorId: userId,
				restaurants: false,
				users: { [userId]: { name: data.userName } },
			},
		})
		.then(() => callback({ success: true, sessionId, userId }))
		.catch((e) => callback({ success: false, errorMessage: e }));
};

const tryJoinSession = async (
	data: TryJoinSessionData,
	callback: TryJoinSessionCallback,
	socket: socket.Socket
) => {
	console.log(`joining session: ${JSON.stringify(data)}`);
	if (data.sessionId === "") {
		// ignore requests w/o sessionId; probably from initial useEffect
		return;
	}
	await refreshCache(data.sessionId);
	if (sessionCache[data.sessionId]) {
		socket.join(data.sessionId);
		const userId = data.userId || generateUserId();
		const previouslyAuthenticated = sessionCache[data.sessionId].users[userId]
			? true
			: false;
		console.log(`sending success callback.`);
		const sC = sessionCache[data.sessionId];
		console.log(`sessionCache is ${JSON.stringify(sC)}`);
		callback({
			success: true,
			userId: userId,
			creator: { name: sC.users[sC.creatorId].name, hashId: md5(sC.creatorId) },
			previouslyAuthenticated: previouslyAuthenticated,
			restaurants: await joinRestaurants(data.sessionId),
			location: sessionCache[data.sessionId].location,
			previousVotes:
				Object.entries(sessionCache[data.sessionId].restaurants)
					.filter(([_, restaurantInfo]) =>
						restaurantInfo.votes.hasOwnProperty(userId)
					)
					.map(([restId, restaurantInfo]) => ({
						id: restId,
						votes: restaurantInfo.votes
							? (restaurantInfo.votes as Votes)[userId]
							: {},
					}))
					.reduce((obj: any, cur) => {
						return { ...obj, [cur.id]: cur.votes };
					}, {}) || {},
		});
	} else {
		console.log(`sending failure callback.`);
		callback({ success: false });
	}
};

const setUserName = async (
	sessionId: string,
	userId: string,
	userName: string
): Promise<boolean> => {
	console.log(
		`setting userName: ${JSON.stringify({ sessionId, userId, userName })}`
	);
	await refreshCache(sessionId);
	if (!sessionCache[sessionId]) {
		// callback({ success: false });
		return false;
	}
	// update in cache
	sessionCache[sessionId].users[userId] = { name: userName };
	// update in firebase
	await rootRef
		.child(`${sessionId}/users/${userId}`)
		.update({ name: userName })
		.then();
	return true;
	// callback({ success: true });
};

const addVote = async (
	sessionId: string,
	userId: string,
	restaurantId: string,
	voteNum: number
) => {
	await refreshCache(sessionId);
	// update in cache
	if (
		sessionCache[sessionId].restaurants[restaurantId] &&
		sessionCache[sessionId].restaurants[restaurantId].votes
	) {
		(sessionCache[sessionId].restaurants[restaurantId].votes as Votes)[
			userId
		] = voteNum;
	} else {
		sessionCache[sessionId].restaurants[restaurantId].votes = {
			[userId]: voteNum,
		};
	}

	// update in firebase
	rootRef
		.child(`${sessionId}/restaurants/${restaurantId}/votes`)
		.update({ [userId]: voteNum })
		.then(() => {
			console.log("emitting addedVote");
			io.in(sessionId).emit("addedVote", {
				restaurantId: restaurantId,
				votes: shapeVotes(
					sessionCache[sessionId].restaurants[restaurantId].votes,
					sessionCache[sessionId].users
				),
			});
		});
};

const addRestaurant = (
	sessionId: string,
	userId: string,
	restaurantId: string
): Promise<boolean> => {
	return new Promise(async (resolve, reject) => {
		await refreshCache(sessionId);
		if (sessionCache[sessionId] && sessionCache[sessionId].users[userId]) {
			// update in cache
			if (sessionCache[sessionId].restaurants) {
				sessionCache[sessionId].restaurants[restaurantId] = {
					addedBy: userId,
					votes: false,
				};
			} else {
				sessionCache[sessionId].restaurants = {
					[restaurantId]: { addedBy: userId, votes: false },
				};
			}
			// update in firebase
			rootRef
				.child(`${sessionId}/restaurants`)
				.update({
					[restaurantId]: sessionCache[sessionId].restaurants[restaurantId],
				})
				.then();
			console.log("emitting addedRestaurant");
			io.in(sessionId).emit("addedRestaurant", {
				business: await memoizedGetRestaurantById(restaurantId),
				votes: new Array(VOTE_VALUES),
				addedBy: {
					name: getUserNameById(userId, sessionCache[sessionId].users),
					hashId: md5(userId),
				},
			});
			resolve(true);
		} else {
			resolve(false);
		}
	});
};

const removeRestaurant = (
	sessionId: string,
	userId: string,
	restaurantId: string
): Promise<boolean> => {
	console.log(
		`remove restaurant: ${JSON.stringify({ sessionId, userId, restaurantId })}`
	);
	return new Promise(async (resolve, reject) => {
		await refreshCache(sessionId);
		if (
			sessionCache[sessionId].restaurants &&
			sessionCache[sessionId].restaurants[restaurantId].addedBy === userId
		) {
			// update in cache
			delete sessionCache[sessionId].restaurants[restaurantId];
			// update in firebase
			rootRef.child(`${sessionId}/restaurants/${restaurantId}`).remove().then();
			console.log("emitting removedRestaurant");
			io.in(sessionId).emit("removedRestaurant", {
				restaurantId,
			});
			resolve(true);
		}

		resolve(false);
	});
};

let yelpFusion = (url: string, retry?: boolean): AxiosPromise => {
	console.log(`sending ${url}`);
	return new Promise((resolve, reject) =>
		setTimeout(() => {
			axios({
				method: "GET",
				url: encodeURI(url),
				headers: {
					authorization: `Bearer ${yelpApiKey}`,
					"Content-Type": "application/json",
				},
			})
				.then((r) => resolve(r))
				.catch((e) => {
					console.log(`yelp fusion request rejected: ${JSON.stringify(e)}`);
					reject();
				});
		}, TIME_BETWEEN_REQUESTS)
	);
};

let yelpGql = (query: string): AxiosPromise<any> =>
	axios({
		url: "https://api.yelp.com/v3/graphql",
		headers: {
			Authorization: `Bearer ${yelpApiKey}`,
			"Content-Type": "application/graphql",
		},
		method: "POST",
		data: query,
	});

let autocomplete = async (
	text: string,
	sessionId: string
): Promise<string[]> => {
	await refreshCache(sessionId);
	return new Promise((resolve, reject) =>
		yelpFusion(
			`https://api.yelp.com/v3/autocomplete?text=${text}&latitude=${sessionCache[sessionId].lat}&longitude=${sessionCache[sessionId].lng}`
		).then((result) => {
			if (result.status === 200) {
				const terms = result.data.terms.map((term: any) => term.text);
				const businesses = result.data.businesses.map(
					(business: any) => business.name
				);
				const categories = result.data.categories.map(
					(category: any) => category.title
				);

				resolve(terms.concat(businesses, categories));
			} else {
				reject();
			}
		})
	);
};

let getRestaurantById = (id: string): Promise<Business> =>
	new Promise((resolve, reject) =>
		yelpFusion(`https://api.yelp.com/v3/businesses/${id}`)
			.then((result) => {
				if (result.status > 200 || result.status > 299) {
					console.log(`request from yelp api rejected: ${result.statusText}`);
					reject();
				}
				restaurantCache[(result.data as Business).id] = result.data;
				console.log(
					`business added to restCache: ${(result.data as Business).id}`
				);
				resolve(result.data as Business);
			})
			.catch((e) => {
				console.log(`error getting business ${id}`);
				reject();
			})
	);

let memoizedGetRestaurantById = (id: string): Promise<Business> => {
	console.log(`starting memoizedGetRestaurantById, id: ${id}`);
	if (restaurantCache[id]) {
		return new Promise((resolve, reject) => resolve(restaurantCache[id]));
	}
	return getRestaurantById(id);
};

let getLatLngFromAddress = (
	address: string
): Promise<{ lat: string; lng: string }> =>
	new Promise((resolve, reject) =>
		axios({
			method: "GET",
			url: encodeURI(
				`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googleCloudApiKey}`
			),
		})
			.then((result) => {
				if (result.data.status === "OK") {
					// console.log(JSON.stringify(result.data));
					resolve(result.data.results[0].geometry.location);
				} else {
					reject();
				}
			})
			.catch(() => {
				console.log("geocoding request failed.");
				reject();
			})
	);
let isOpenLaterToday = (business: Business): boolean => {
	if (!business.hours[0].open) {
		return true;
	}
	const currentTime = new Date();
	const padZeros = (n: number) => ("00" + n).slice(-2);
	const currentStringTime =
		padZeros(currentTime.getHours()) + padZeros(currentTime.getMinutes());
	const dayOfWeek = (((currentTime.getDay() - 1) % 6) + 6) % 6;
	for (let h of business.hours[0].open) {
		if (h.day === dayOfWeek) {
			if (h.end < currentStringTime) {
				return true;
			}
		}
	}
	return false;
};
//
let getHours = (
	businesses: Business[]
): Promise<{ [b_id: string]: { hours: [Hours] } }> => {
	const request = `{ 
   ${businesses.map((b) => {
			const newId = "b_" + b.id.replace(/-/gi, dashReplacement);
			return `
      ${newId}: business(id: "${b.id}") {
        hours {
          open {
            day
            start
            end
          }
        }
      }`;
		})}
  }`;
	// console.log(`request is ${request}`);
	return new Promise((resolve, reject) => {
		yelpGql(request)
			.then(({ data }) => {
				// console.log(`DONE ${JSON.stringify(data)}`);
				resolve(data.data);
			})
			.catch((r) => {
				console.log(`error fetching hours.`);
				reject();
			});
	});
};

// let getBulkBusinesses = (
// 	businessIds: string[]
// ): Promise<{ [b_id: string]: Business }> => {
// 	const request = `{
//    ${businessIds.map((b) => {
// 			const newId = "b_" + b.replace(/-/gi, dashReplacement);
// 			return `
//       ${newId}: business(id: "${b}") {
//         hours {
//           open {
//             day
//             start
//             end
//           }
//         }
//       }`;
// 		})}
//   }`;
//  console.log(`request is ${request}`);
// 	return new Promise((resolve, reject) => {
// 		yelpGql(request)
// 			.then(({ data }) => {
// 				// console.log(`DONE ${JSON.stringify(data)}`);
// 				resolve(data.data);
// 			})
// 			.catch((r) => {
// 				console.log(`error fetching hours.`);
// 				reject();
// 			});
// 	});
// };

let restaurantSearch = (
	searchTerm: string,
	location: string,
	openHours: string,
	priceRange: string,
	services: string
): Promise<Business[]> => {
	console.log(
		`search request: ${JSON.stringify({
			searchTerm,
			location,
			openHours,
			priceRange,
			services,
		})}}`
	);
	return new Promise(async (resolve, reject) => {
		let returnedBusinesses: Business[] = [];
		await yelpFusion(
			`https://api.yelp.com/v3/businesses/search?categories=restaurant&location=${location}&term=${searchTerm}&price=${priceRange}&open_now=${
				openHours === "now"
			}`
		).then((result) => {
			// console.log(
			// 	`RESULTS FROM BUSINESS SEARCH: ${JSON.stringify(result.data)}`
			// );
			// if (result.data.total === 0) {
			// 	console.log(`no results.`);
			// 	resolve([]);
			// 	return;
			// }
			// console.log(`got results.`);
			returnedBusinesses = result.data.businesses;
		});
		if (returnedBusinesses.length > 0) {
			returnedBusinesses
				.filter((b: Business) => {
					if (b.hours && openHours === "today") {
						return isOpenLaterToday(b);
					}
				})
				.filter((b: Business) => {
					if (b.transactions.length === 0) {
						return true;
					}
					const selectedServices = services.split(",");
					for (let t of b.transactions) {
						if (selectedServices.includes(t)) {
							return true;
						}
					}
					return false;
					// return b.transactions.filter(t => services.split(",").includes(t)).length > 0
				});
			await getHours(returnedBusinesses).then((hours) => {
				returnedBusinesses = returnedBusinesses.map(
					(b) =>
						({
							...b,
							hours: hours[`b_${b.id.replace(/-/gi, dashReplacement)}`].hours,
						} as Business)
				);
			});
			console.log(
				`returnedbusinesses are now ${JSON.stringify(returnedBusinesses)}`
			);
			resolve(returnedBusinesses);
			returnedBusinesses.forEach((b: Business) => {
				restaurantCache[b.id] = b;
			});
		} else {
			resolve([]);
		}
	});
};

const refreshCache = async (sessionId: string) => {
	console.log(`refreshing cache.`);
	if (sessionCache[sessionId]) {
		console.log(`there is already an active session.`);
		return sessionCache[sessionId];
	}
	const dbSessionObj = await new Promise<FirebaseSession>((resolve, reject) =>
		rootRef
			.child(sessionId)
			.once("value", (snp) => resolve(snp.val() as FirebaseSession))
	);
	if (!dbSessionObj) {
		return;
	}
	console.log(`dbSessionObj is ${JSON.stringify(dbSessionObj)}`);
	sessionCache[sessionId] = dbSessionObj;
	await (Promise as any)
		.allSettled(
			Object.keys(dbSessionObj.restaurants).map((id, idx) => {
				if (restaurantCache[id]) {
					return new Promise((resolve, reject) => resolve(restaurantCache[id]));
				}
				return new Promise((resolve, reject) =>
					setTimeout(() => {
						resolve(memoizedGetRestaurantById(id));
					}, idx * TIME_BETWEEN_REQUESTS)
				);
			})
		)
		.then();
	// 	(results: any) => {
	// 	console.log(`PROMISES ALL DONE`);
	// 	results
	// 		.filter((r: any) => r.status === "fulfilled")
	// 		.map((r: any) => {
	// 			return r.value;
	// 		})
	// 		.reduce((obj: any, cur: any) => {
	// 			return { ...obj, [cur.id]: cur };
	// 		}, {});
	// })

	console.log("done refreshing cache.");
};

const generateSessionId = (): string => rootRef.push().key!;

const generateUserId = (): string => rootRef.child("users").push().key!;

// uses both caches to create interface accepted by frontend
const joinRestaurants = async (
	sessionId: string
): Promise<{ [id: string]: BusinessWithVotes }> => {
	console.log(`starting joinrestaurants`);
	await refreshCache(sessionId);
	return new Promise((resolve, reject) => {
		(Promise as any)
			.allSettled(
				Object.entries(sessionCache[sessionId].restaurants).map(
					async ([rId, restaurantInfo]) => {
						const addedByUserId =
							sessionCache[sessionId].restaurants[rId].addedBy;
						return {
							business: await memoizedGetRestaurantById(rId), //restaurantCache[rId],
							votes: shapeVotes(
								// sessionCache[sessionId].restaurants[rId],
								restaurantInfo.votes,
								sessionCache[sessionId].users
							),
							addedBy: {
								name: getUserNameById(
									addedByUserId,
									sessionCache[sessionId].users
								),
								hashId: md5(addedByUserId),
							},
						};
					}
				)
			)
			.then((result: BusinessWithVotes[]) => {
				resolve(
					result
						.filter((r: any) => r.status === "fulfilled")
						.map((r: any) => r.value)
						.reduce((obj: any, cur: any) => {
							// console.log(`reduce: cur is ${JSON.stringify(cur)}`);
							return { ...obj, [cur.business.id]: cur };
						}, {})
				);
			});
	});
};

const getUserNameById = (userId: string, users: Users) => {
	if (users && users[userId]) {
		return (users[userId] as { name: string }).name;
	}
	return null;
};

const shapeVotes = (votes: Votes | false, users: Users): string[] => {
	let voteArr = new Array(VOTE_VALUES);
	if (!votes) {
		return voteArr;
	}
	Object.entries(votes).forEach(([userId, v]) => {
		if (users[userId]) {
			const name = (users[userId] as { name: string }).name;
			if (voteArr[v]) {
				voteArr[v] += `, ${name}`;
			} else {
				voteArr[v] = name;
			}
		}
	});
	return voteArr;
};
