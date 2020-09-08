export interface Business {
    id: string;
    name: string;
    url: string;
    categories: { alias: string; title: string }[];
    transactions: string[];
    display_address: string;
    display_phone: string;
  }
  