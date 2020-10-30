"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const firebase_1 = __importDefault(require("firebase"));
const socket_io_1 = __importDefault(require("socket.io"));
const config_1 = require("../config");
const blueimp_md5_1 = __importDefault(require("blueimp-md5"));
const PORT = process.env.PORT || 4000;
const VOTE_VALUES = 4;
const TIME_BETWEEN_REQUESTS = 190;
let restaurantCache = {};
console.log(`resetting restCache.`);
let sessionCache = {};
let requestTimer;
firebase_1.default.initializeApp(config_1.firebaseConfig);
let database = firebase_1.default.database(),
	app = express_1.default(),
	server = app.listen(PORT, () => console.log(`listening on port ${PORT}`)),
	io = socket_io_1.default(server, { origins: "*:*" });
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
	async (req, res) => {
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
app.post("/setUserName/:sessionId/:userId/:userName", (req, res) => {
	const { sessionId, userId, userName } = req.params;
	setUserName(sessionId, userId, userName).then((r) => res.send(r));
});
app.post(
	"/addVote/:sessionId/:userId/:restaurantId/:voteNum",
	async (req, res) => {
		const { sessionId, userId, restaurantId, voteNum } = req.params;
		await addVote(sessionId, userId, restaurantId, +voteNum);
		res.send(true);
	}
);
app.post(
	"/addRestaurant/:sessionId/:userId/:restaurantId",
	async (req, res) => {
		const { sessionId, userId, restaurantId } = req.params;
		await addRestaurant(sessionId, userId, restaurantId).then((r) =>
			res.send(r)
		);
	}
);
app.post(
	"/removeRestaurant/:sessionId/:userId/:restaurantId",
	async (req, res) => {
		const { sessionId, userId, restaurantId } = req.params;
		await removeRestaurant(sessionId, userId, restaurantId);
		res.send(true);
	}
);
app.get("/autocomplete/:sessionId/:searchTerm", (req, res) => {
	const { sessionId, searchTerm } = req.params;
	autocomplete(searchTerm, sessionId)
		.then((result) => res.send(result))
		.catch(() => res.send([]));
});
io.on("connection", function (socket) {
	console.log(`socket connected: ${socket.id}`);
	socket.on("newSession", (data, callback) =>
		newSession(data, callback, socket)
	);
	socket.on("tryJoinSession", (data, callback) =>
		tryJoinSession(data, callback, socket)
	);
	socket.on("setUserName", setUserName);
	// socket.on("addRestaurant", addRestaurant);
	// socket.on("voteOnRestaurant", voteOnRestaurant);
});
const newSession = async (data, callback, socket) => {
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
const tryJoinSession = async (data, callback, socket) => {
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
			creator: {
				name: sC.users[sC.creatorId].name,
				hashId: blueimp_md5_1.default(sC.creatorId),
			},
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
						votes: restaurantInfo.votes ? restaurantInfo.votes[userId] : {},
					}))
					.reduce((obj, cur) => {
						return { ...obj, [cur.id]: cur.votes };
					}, {}) || {},
		});
	} else {
		console.log(`sending failure callback.`);
		callback({ success: false });
	}
};
const setUserName = async (sessionId, userId, userName) => {
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
const addVote = async (sessionId, userId, restaurantId, voteNum) => {
	await refreshCache(sessionId);
	// update in cache
	if (
		sessionCache[sessionId].restaurants[restaurantId] &&
		sessionCache[sessionId].restaurants[restaurantId].votes
	) {
		sessionCache[sessionId].restaurants[restaurantId].votes[userId] = voteNum;
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
const addRestaurant = (sessionId, userId, restaurantId) => {
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
					hashId: blueimp_md5_1.default(userId),
				},
			});
			resolve(true);
		} else {
			resolve(false);
		}
	});
};
const removeRestaurant = (sessionId, userId, restaurantId) => {
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
let yelpFusion = (url) => {
	console.log(`sending ${url}`);
	return new Promise((resolve, reject) =>
		setTimeout(() => {
			axios_1
				.default({
					method: "GET",
					url: encodeURI(url),
					headers: {
						authorization: `Bearer ${config_1.yelpApiKey}`,
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
let yelpGql = (query) =>
	axios_1.default({
		url: "https://api.yelp.com/v3/graphql",
		headers: {
			Authorization: `Bearer ${config_1.yelpApiKey}`,
			"Content-Type": "application/graphql",
		},
		method: "POST",
		data: query,
	});
let autocomplete = async (text, sessionId) => {
	await refreshCache(sessionId);
	return new Promise((resolve, reject) =>
		yelpFusion(
			`https://api.yelp.com/v3/autocomplete?text=${text}&latitude=${sessionCache[sessionId].lat}&longitude=${sessionCache[sessionId].lng}`
		).then((result) => {
			if (result.status === 200) {
				const terms = result.data.terms.map((term) => term.text);
				const businesses = result.data.businesses.map(
					(business) => business.name
				);
				const categories = result.data.categories.map(
					(category) => category.title
				);
				resolve(terms.concat(businesses, categories));
			} else {
				reject();
			}
		})
	);
};
let getRestaurantById = (id) =>
	new Promise((resolve, reject) =>
		yelpFusion(`https://api.yelp.com/v3/businesses/${id}`)
			.then((result) => {
				if (result.status > 200 || result.status > 299) {
					console.log(`request from yelp api rejected: ${result.statusText}`);
					reject();
				}
				restaurantCache[result.data.id] = result.data;
				console.log(`business added to restCache: ${result.data.id}`);
				resolve(result.data);
			})
			.catch((e) => {
				console.log(`error getting business ${id}`);
				reject();
			})
	);
let memoizedGetRestaurantById = (id) => {
	console.log(`starting memoizedGetRestaurantById, id: ${id}`);
	if (restaurantCache[id]) {
		return new Promise((resolve, reject) => resolve(restaurantCache[id]));
	}
	return getRestaurantById(id);
};
let getLatLngFromAddress = (address) =>
	new Promise((resolve, reject) =>
		axios_1
			.default({
				method: "GET",
				url: encodeURI(
					`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config_1.googleCloudApiKey}`
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
let isOpenLaterToday = (business) => {
	if (!business.hours[0].open) {
		return true;
	}
	const currentTime = new Date();
	const padZeros = (n) => ("00" + n).slice(-2);
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
let getHours = (businesses) => {
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
	searchTerm,
	location,
	openHours,
	priceRange,
	services
) => {
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
		let returnedBusinesses = [];
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
				.filter((b) => {
					if (b.hours && openHours === "today") {
						return isOpenLaterToday(b);
					}
				})
				.filter((b) => {
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
				returnedBusinesses = returnedBusinesses.map((b) => ({
					...b,
					hours: hours[`b_${b.id.replace(/-/gi, dashReplacement)}`].hours,
				}));
			});
			console.log(
				`returnedbusinesses are now ${JSON.stringify(returnedBusinesses)}`
			);
			resolve(returnedBusinesses);
			returnedBusinesses.forEach((b) => {
				restaurantCache[b.id] = b;
			});
		} else {
			resolve([]);
		}
	});
};
const refreshCache = async (sessionId) => {
	console.log(`refreshing cache.`);
	if (sessionCache[sessionId]) {
		console.log(`there is already an active session.`);
		return sessionCache[sessionId];
	}
	const dbSessionObj = await new Promise((resolve, reject) =>
		rootRef.child(sessionId).once("value", (snp) => resolve(snp.val()))
	);
	if (!dbSessionObj) {
		return;
	}
	console.log(`dbSessionObj is ${JSON.stringify(dbSessionObj)}`);
	sessionCache[sessionId] = dbSessionObj;
	await Promise.allSettled(
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
	).then();
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
const generateSessionId = () => rootRef.push().key;
const generateUserId = () => rootRef.child("users").push().key;
// uses both caches to create interface accepted by frontend
const joinRestaurants = async (sessionId) => {
	console.log(`starting joinrestaurants`);
	await refreshCache(sessionId);
	return new Promise((resolve, reject) => {
		Promise.allSettled(
			Object.entries(sessionCache[sessionId].restaurants).map(
				async ([rId, restaurantInfo]) => {
					const addedByUserId =
						sessionCache[sessionId].restaurants[rId].addedBy;
					return {
						business: await memoizedGetRestaurantById(rId),
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
							hashId: blueimp_md5_1.default(addedByUserId),
						},
					};
				}
			)
		).then((result) => {
			resolve(
				result
					.filter((r) => r.status === "fulfilled")
					.map((r) => r.value)
					.reduce((obj, cur) => {
						// console.log(`reduce: cur is ${JSON.stringify(cur)}`);
						return { ...obj, [cur.business.id]: cur };
					}, {})
			);
		});
	});
};
const getUserNameById = (userId, users) => {
	if (users && users[userId]) {
		return users[userId].name;
	}
	return null;
};
const shapeVotes = (votes, users) => {
	let voteArr = new Array(VOTE_VALUES);
	if (!votes) {
		return voteArr;
	}
	Object.entries(votes).forEach(([userId, v]) => {
		if (users[userId]) {
			const name = users[userId].name;
			if (voteArr[v]) {
				voteArr[v] += `, ${name}`;
			} else {
				voteArr[v] = name;
			}
		}
	});
	return voteArr;
};
