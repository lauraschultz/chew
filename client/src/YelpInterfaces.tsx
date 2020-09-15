type Transaction = "pickup" | "delivery" | "restaurant_reservation";

export interface Business {
  id: string;
  name: string;
  url: string;
  categories: { alias: string; title: string }[];
  transactions: Transaction[];
  display_address: string;
  display_phone: string;
}

export interface BusinessWithVotes {
  business: Business;
  votes: Array<Array<string>>;
}
