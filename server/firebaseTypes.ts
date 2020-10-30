export interface FirebaseDb {
	[sessionId: string]: FirebaseSession;
}

export interface FirebaseSession {
	location: string;
	lat: string;
	lng: string;
	creatorId: string;
	restaurants: Restaurants;
	users: Users;
}

export interface Restaurants {
	[yelpId: string]: {
		addedBy: string;
		votes: Votes | false;
	};
}

export interface Votes {
	[userId: string]: number;
}

export interface Users {
	[userId: string]: {
		name: string;
	};
}
