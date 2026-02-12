export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  location?: string;
  bookingType?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Booking' | 'Payment' | 'Refunds' | 'Escrow' | 'Groups';
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
  suffix?: string;
}
