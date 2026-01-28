export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
] as const;

export const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
] as const;

export const CITIES = [
  "Dhaka",
  "Chittagong",
  "Cox's Bazar",
  "Sylhet",
  "Rangamati",
  "Sundarbans",
  "Bandarban",
  "Kuakata",
  "Sajek Valley",
  "Saint Martin's Island",
] as const;

export const CATEGORIES = [
  { id: "hotels", name: "Hotels & Resorts", icon: "🏨" },
  { id: "tours", name: "Tour Packages", icon: "🗺️" },
  { id: "experiences", name: "Experiences", icon: "🎭" },
  { id: "transport", name: "Transportation", icon: "🚗" },
  { id: "adventure", name: "Adventure Sports", icon: "🏔️" },
  { id: "cultural", name: "Cultural Tours", icon: "🏛️" },
] as const;

export const HERO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=80",
    alt: "Cox's Bazar Beach - World's Longest Natural Sea Beach",
    title: "Explore Cox's Bazar",
    subtitle: "World's Longest Natural Sea Beach"
  },
  {
    url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1920&q=80",
    alt: "Sundarbans Mangrove Forest",
    title: "Discover Sundarbans",
    subtitle: "UNESCO World Heritage Site"
  },
  {
    url: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1920&q=80",
    alt: "Tea Gardens of Sylhet",
    title: "Experience Sylhet",
    subtitle: "Endless Tea Gardens & Hills"
  },
  {
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80",
    alt: "Rangamati Lake Views",
    title: "Visit Rangamati",
    subtitle: "Lake City of Bangladesh"
  },
  {
    url: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1920&q=80",
    alt: "Bandarban Hills",
    title: "Escape to Bandarban",
    subtitle: "Mountains & Tribal Culture"
  },
] as const;

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/deshghuri",
  instagram: "https://instagram.com/deshghuri",
  twitter: "https://twitter.com/deshghuri",
  linkedin: "https://linkedin.com/company/deshghuri",
  youtube: "https://youtube.com/@deshghuri",
} as const;

export const PAYMENT_PARTNERS = [
  { name: "bKash", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext x='10' y='20' fill='%23E2136E' font-size='20' font-weight='bold'%3EbKash%3C/text%3E%3C/svg%3E" },
  { name: "Nagad", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext x='10' y='20' fill='%23EA1747' font-size='20' font-weight='bold'%3ENagad%3C/text%3E%3C/svg%3E" },
  { name: "Visa", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext x='10' y='20' fill='%231434CB' font-size='20' font-weight='bold'%3EVISA%3C/text%3E%3C/svg%3E" },
  { name: "Mastercard", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext x='5' y='20' fill='%23EB001B' font-size='18' font-weight='bold'%3EMastercard%3C/text%3E%3C/svg%3E" },
] as const;

export const APP_STORE_LINKS = {
  playStore: "#",
  appStore: "#",
} as const;
