export interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  currency: "BDT";
  rating: number;
  reviewCount: number;
  image: string;
  isTrending?: boolean;
  isFlashDeal?: boolean;
  dealEndsAt?: string;
  discountPercent?: number;
  description?: string;
  features?: string[];
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
}

export interface GroupBooking {
  id: string;
  listing: Listing;
  destination: string;
  travelDate: string;
  currentMembers: number;
  minMembers: number;
  maxMembers: number;
  currentTier: number;
  pricePerPerson: number;
  organizer: {
    name: string;
    avatar?: string;
  };
  isPublic: boolean;
  deadline: string;
}
