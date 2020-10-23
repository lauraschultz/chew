type Transaction = "pickup" | "delivery" | "restaurant_reservation";

export interface Business {
  id: string;
  name: string;
  url: string;
  categories: { alias: string; title: string }[];
  transactions: Transaction[];
  location: {
    display_address: string[];
  };
  display_phone: string;
  hours: [Hours];
  price: string;
}

// "special_hours": [
//   {
//     "date": "2019-02-07",
//     "is_closed": null,
//     "start": "1600",
//     "end": "2000",
//     "is_overnight": false
//   }
// ]

export interface Hours {
  open: {
    is_overnight: boolean;
    start: string; //4-char strings with the 24hr time
    end: string;
    day: number;
  }[];
}

export interface BusinessWithVotes {
  business: Business;
  votes: string[];
}

export interface ClientEmitRequest {
  data: any;
  callback: (params: any) => void;
}

export interface NewSessionData {
  userName: string;
  location: string;
  userId?: string;
}

export type NewSessionCallback = (params: {
  success: boolean;
  sessionId?: string;
  userId?: string;
  errorMessage?: string;
}) => void;

export interface TryJoinSessionData {
  sessionId: string;
  userId?: string;
}

export type TryJoinSessionCallback = (params: {
  success: boolean;
  userId?: string;
  creatorName?: string;
  previouslyAuthenticated?: boolean;
  restaurants?: { [id: string]: BusinessWithVotes };
  location?: string;
  previousVotes?: { [restaurantId: string]: number };
}) => void;

export interface SetUserNameData {
  sessionId: string;
  userId: string;
  userName: string;
}

export type SetUserNameCallback = (params: { success: boolean }) => void;

type ServerEmitCallback = (params: any) => void;

export type VoteAddedCallback = (params: {
  restaurantId: string;
  votes: string;
}) => void;

export type RestaurantAddedCallback = (params: {
  newRestaurant: BusinessWithVotes;
}) => void;
