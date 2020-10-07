export interface FirebaseDb {
  [sessionId: string]: FirebaseSession;
}

export interface FirebaseSession {
  location: string;
  creator: string;
  restaurants: Restaurants;
  users: Users;
}

export interface Restaurants {
  [yelpId: string]: Votes | false;
}

export interface Votes {
   [userId: string]: number; 
}

export interface Users {
  [userId: string]:
    | {
        name: string;
      }
    | false;
}
