type Transaction = "pickup" | "delivery" | "restaurant_reservation";

export interface Business {
  id: string;
  name: string;
  url: string;
  categories: { alias: string; title: string }[];
  transactions: Transaction[];
  location: {
    display_address: string[];
  }
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

export interface FilterForm {
  openDate: "any" | "today";
  openNow: boolean;
  prices: (number | undefined)[];
  services: {
    pickup: boolean;
    delivery: boolean;
    restaurant_reservation: boolean;
  };
}