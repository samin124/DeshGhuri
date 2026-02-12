import type { Listing, GroupBooking } from '@/types/listing';
import type { Category, Destination, BlogPost } from '@/types/category';
import type { Testimonial, FAQ, Partner, Stat } from '@/types/testimonial';

// Flash Deals with countdown
export const mockFlashDeals: Listing[] = [
  {
    id: 'flash-1',
    title: "Cox's Bazar Beach Resort 3D/2N Package",
    category: 'Hotel',
    location: "Cox's Bazar",
    price: 3500,
    currency: 'BDT',
    rating: 4.8,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&h=350&fit=crop',
    isFlashDeal: true,
    dealEndsAt: new Date(Date.now() + 3600000 * 12).toISOString(), // 12 hours
    discountPercent: 30,
    description: 'Luxury beach resort with ocean views',
    features: ['Free Breakfast', 'Beach Access', 'Pool', 'WiFi'],
  },
  {
    id: 'flash-2',
    title: 'Sundarbans Adventure Tour 2D/1N',
    category: 'Tour',
    location: 'Sundarbans',
    price: 4200,
    currency: 'BDT',
    rating: 4.9,
    reviewCount: 187,
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=500&h=350&fit=crop',
    isFlashDeal: true,
    dealEndsAt: new Date(Date.now() + 3600000 * 8).toISOString(), // 8 hours
    discountPercent: 25,
    description: 'UNESCO World Heritage Site exploration',
    features: ['Guide', 'Boat', 'Meals', 'Wildlife Spotting'],
  },
  {
    id: 'flash-3',
    title: 'Sajek Valley Camping Experience',
    category: 'Experience',
    location: 'Sajek Valley',
    price: 2800,
    currency: 'BDT',
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&h=350&fit=crop',
    isFlashDeal: true,
    dealEndsAt: new Date(Date.now() + 3600000 * 18).toISOString(), // 18 hours
    discountPercent: 20,
    description: 'Cloud camping above the valley',
    features: ['Camping Gear', 'BBQ Dinner', 'Bonfire', 'Sunrise View'],
  },
  {
    id: 'flash-4',
    title: 'Rangamati Lake Cruise & Stay',
    category: 'Hotel',
    location: 'Rangamati',
    price: 3200,
    currency: 'BDT',
    rating: 4.6,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&h=350&fit=crop',
    isFlashDeal: true,
    dealEndsAt: new Date(Date.now() + 3600000 * 6).toISOString(), // 6 hours
    discountPercent: 35,
    description: 'Lakeside resort with boat cruise',
    features: ['Lake Cruise', 'Island Visit', 'Tribal Museum', 'Local Cuisine'],
  },
];

// Trending Listings
export const mockTrendingListings: Listing[] = [
  {
    id: 'trend-1',
    title: 'Bandarban Hill Resort Premium',
    category: 'Hotel',
    location: 'Bandarban',
    price: 5500,
    currency: 'BDT',
    rating: 4.9,
    reviewCount: 342,
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&h=350&fit=crop',
    isTrending: true,
    description: 'Mountain resort with panoramic views',
    features: ['Mountain View', 'Trekking', 'Restaurant', '24/7 Service'],
  },
  {
    id: 'trend-2',
    title: 'Sylhet Tea Garden Tour',
    category: 'Tour',
    location: 'Sylhet',
    price: 2500,
    currency: 'BDT',
    rating: 4.8,
    reviewCount: 289,
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=500&h=350&fit=crop',
    isTrending: true,
    description: 'Explore endless tea plantations',
    features: ['Tea Factory Visit', 'Garden Walk', 'Tea Tasting', 'Photo Spots'],
  },
  {
    id: 'trend-3',
    title: "Saint Martin's Island Escape",
    category: 'Tour',
    location: 'Saint Martin',
    price: 6800,
    currency: 'BDT',
    rating: 4.9,
    reviewCount: 421,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=350&fit=crop',
    isTrending: true,
    description: 'Coral island paradise',
    features: ['Ferry Transfer', 'Beach Resort', 'Snorkeling', 'Seafood BBQ'],
  },
  {
    id: 'trend-4',
    title: 'Dhaka City Heritage Walk',
    category: 'Experience',
    location: 'Dhaka',
    price: 1200,
    currency: 'BDT',
    rating: 4.7,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&h=350&fit=crop',
    isTrending: true,
    description: "Discover Old Dhaka's hidden gems",
    features: ['Expert Guide', 'Historical Sites', 'Local Food', 'Photo Walk'],
  },
  {
    id: 'trend-5',
    title: 'Kuakata Sunrise & Sunset Beach',
    category: 'Hotel',
    location: 'Kuakata',
    price: 4000,
    currency: 'BDT',
    rating: 4.6,
    reviewCount: 176,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=500&h=350&fit=crop',
    isTrending: true,
    description: 'Unique beach where you can see both sunrise and sunset',
    features: ['Beachfront', 'Cycling', 'Boat Ride', 'Sunset Point'],
  },
  {
    id: 'trend-6',
    title: 'Chittagong Hill Tracts Adventure',
    category: 'Tour',
    location: 'Chittagong Hill Tracts',
    price: 7200,
    currency: 'BDT',
    rating: 4.8,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&h=350&fit=crop',
    isTrending: true,
    description: 'Multi-day tribal culture & nature tour',
    features: ['Tribal Villages', 'Waterfalls', 'Trekking', 'Cultural Experience'],
  },
];

// Special Offers
export const mockSpecialOffers: Listing[] = [
  {
    id: 'offer-1',
    title: 'Monsoon Special: Hill Station Package',
    category: 'Tour',
    location: 'Multiple Locations',
    price: 8500,
    currency: 'BDT',
    rating: 4.8,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    discountPercent: 15,
    description: 'Explore multiple hill stations in one package',
    features: ['5D/4N', 'Transport', 'All Meals', 'Guide'],
  },
  {
    id: 'offer-2',
    title: 'Weekend Getaway Bundle',
    category: 'Hotel',
    location: "Cox's Bazar",
    price: 5200,
    currency: 'BDT',
    rating: 4.7,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
    discountPercent: 20,
    description: 'Perfect 2-night weekend escape',
    features: ['Spa Access', 'Breakfast', 'Beach Activities', 'Welcome Drinks'],
  },
];

// Categories
export const mockCategories: Category[] = [
  {
    id: 'hotels',
    name: 'Hotels & Resorts',
    icon: '🏨',
    count: 450,
    description: 'Comfortable stays nationwide',
  },
  {
    id: 'tours',
    name: 'Tour Packages',
    icon: '🗺️',
    count: 320,
    description: 'Curated travel experiences',
  },
  {
    id: 'experiences',
    name: 'Experiences',
    icon: '🎭',
    count: 180,
    description: 'Unique activities & adventures',
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: '🚗',
    count: 95,
    description: 'Reliable travel solutions',
  },
  {
    id: 'adventure',
    name: 'Adventure Sports',
    icon: '🏔️',
    count: 67,
    description: 'Thrilling outdoor activities',
  },
  {
    id: 'cultural',
    name: 'Cultural Tours',
    icon: '🏛️',
    count: 123,
    description: 'Heritage & tradition',
  },
];

// Featured Destinations
export const mockDestinations: Destination[] = [
  {
    id: 'dest-1',
    name: "Cox's Bazar",
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop',
    description: "World's longest natural sea beach",
    listingCount: 234,
    popularActivities: ['Beach', 'Water Sports', 'Sunset Views', 'Seafood'],
  },
  {
    id: 'dest-2',
    name: 'Sundarbans',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&h=400&fit=crop',
    description: 'UNESCO World Heritage mangrove forest',
    listingCount: 87,
    popularActivities: ['Wildlife Safari', 'Boat Tours', 'Bird Watching', 'Photography'],
  },
  {
    id: 'dest-3',
    name: 'Sylhet',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&h=400&fit=crop',
    description: 'Tea gardens and lush green hills',
    listingCount: 156,
    popularActivities: ['Tea Garden Tours', 'Hiking', 'Waterfall Visits', 'Local Cuisine'],
  },
  {
    id: 'dest-4',
    name: 'Bandarban',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=400&fit=crop',
    description: 'Highest peaks and tribal culture',
    listingCount: 128,
    popularActivities: ['Trekking', 'Mountain Views', 'Tribal Villages', 'Adventure Sports'],
  },
  {
    id: 'dest-5',
    name: 'Rangamati',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop',
    description: 'Lake city with serene beauty',
    listingCount: 94,
    popularActivities: ['Lake Cruise', 'Island Hopping', 'Museums', 'Local Markets'],
  },
  {
    id: 'dest-6',
    name: 'Sajek Valley',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop',
    description: 'Above the clouds experience',
    listingCount: 67,
    popularActivities: ['Cloud Camping', 'Sunrise Views', 'Trekking', 'Photography'],
  },
];

// Group Bookings
export const mockGroupBookings: GroupBooking[] = [
  {
    id: 'group-1',
    listing: mockTrendingListings[0],
    destination: 'Bandarban',
    travelDate: '2026-02-15',
    currentMembers: 8,
    minMembers: 10,
    maxMembers: 20,
    currentTier: 2,
    pricePerPerson: 4400, // Tier 2 discount applied
    organizer: {
      name: 'Rahim Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    isPublic: true,
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days
  },
  {
    id: 'group-2',
    listing: mockTrendingListings[2],
    destination: "Saint Martin's Island",
    travelDate: '2026-02-20',
    currentMembers: 6,
    minMembers: 8,
    maxMembers: 15,
    currentTier: 1,
    pricePerPerson: 6120, // Tier 1 discount
    organizer: {
      name: 'Fatema Khatun',
      avatar: 'https://i.pravatar.cc/150?img=45',
    },
    isPublic: true,
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days
  },
  {
    id: 'group-3',
    listing: mockTrendingListings[5],
    destination: 'Chittagong Hill Tracts',
    travelDate: '2026-03-01',
    currentMembers: 12,
    minMembers: 10,
    maxMembers: 20,
    currentTier: 3,
    pricePerPerson: 5760, // Tier 3 discount
    organizer: {
      name: 'Karim Hassan',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    isPublic: true,
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days
  },
];

// Testimonials
export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Rahim Ahmed',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    text: 'Amazing experience! The booking process was smooth and the escrow system gave me complete confidence. Highly recommended for worry-free travel planning.',
    date: '2026-01-15',
    location: 'Dhaka',
    bookingType: 'Tour Package',
  },
  {
    id: 'test-2',
    name: 'Fatema Khatun',
    avatar: 'https://i.pravatar.cc/150?img=45',
    rating: 5,
    text: 'Group booking made our trip so affordable! We saved 35% by booking together. The platform handled everything perfectly from payment to service delivery.',
    date: '2026-01-10',
    location: 'Chittagong',
    bookingType: 'Group Booking',
  },
  {
    id: 'test-3',
    name: 'Karim Hassan',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 4,
    text: 'Price lock feature saved me ৳800! The rate dropped after I booked and I got automatic refund. This is the future of travel booking in Bangladesh.',
    date: '2026-01-08',
    location: 'Sylhet',
    bookingType: 'Hotel',
  },
  {
    id: 'test-4',
    name: 'Ayesha Siddika',
    avatar: 'https://i.pravatar.cc/150?img=28',
    rating: 5,
    text: 'Split payment feature was a lifesaver for our office trip! Everyone paid their share separately, no awkward money collection. Super convenient!',
    date: '2026-01-05',
    location: 'Dhaka',
    bookingType: 'Group Booking',
  },
  {
    id: 'test-5',
    name: 'Mahmud Rahman',
    avatar: 'https://i.pravatar.cc/150?img=51',
    rating: 5,
    text: 'The verification system ensures quality service. I felt secure knowing the seller was verified and my payment was protected by escrow.',
    date: '2025-12-28',
    location: "Cox's Bazar",
    bookingType: 'Experience',
  },
];

// FAQs
export const mockFAQs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How does the escrow system work?',
    answer:
      'Your payment is securely held in our escrow account until the service is delivered and verified. The seller receives payment only after you confirm service completion or after automatic verification. This protects both buyers and sellers.',
    category: 'Escrow',
  },
  {
    id: 'faq-2',
    question: 'What is group booking and how does it save money?',
    answer:
      "Group booking allows multiple travelers to book together and get tiered discounts. As more members join, everyone's price decreases automatically. You can save up to 40% compared to individual bookings. Plus, earlier members get automatic refunds when the price tier upgrades!",
    category: 'Groups',
  },
  {
    id: 'faq-3',
    question: 'How does price lock protection work?',
    answer:
      "When you enable price lock at checkout, we monitor the booking price continuously. If the price drops before your travel date (due to promotions, group tier upgrades, or seller discounts), we automatically refund you the difference. You're protected from price increases too!",
    category: 'Booking',
  },
  {
    id: 'faq-4',
    question: 'Can I split payment with my friends for a booking?',
    answer:
      'Yes! For group bookings, the organizer can enable split payment. Each member gets a payment link and can pay their share separately. The booking is confirmed only after all payments are received by the deadline. Very convenient for group trips!',
    category: 'Payment',
  },
  {
    id: 'faq-5',
    question: 'What is your cancellation policy?',
    answer:
      'Cancellation policies vary by listing (Flexible, Moderate, Strict, or Non-refundable). The policy is clearly displayed before booking. Most listings offer full or partial refunds if cancelled with sufficient notice. Refunds are processed within 5-7 business days.',
    category: 'Refunds',
  },
  {
    id: 'faq-6',
    question: 'How do I know if a seller is trustworthy?',
    answer:
      'We verify all sellers by checking their business license, NID, and relevant permits. Verified sellers get a badge on their profile. You can also check ratings, reviews, and response time before booking. All payments go through escrow for your protection.',
    category: 'General',
  },
  {
    id: 'faq-7',
    question: 'What happens if the service is not provided as described?',
    answer:
      'You can raise a dispute within 7 days of the service date. Upload evidence and explain the issue. Our admin team reviews both sides and makes a fair decision within 72 hours. Refunds (full or partial) are issued based on the resolution.',
    category: 'Escrow',
  },
  {
    id: 'faq-8',
    question: 'How long does it take for sellers to receive payment?',
    answer:
      'Sellers receive payment after service delivery is verified. They upload proof of service completion (photos, attendance, etc.), which is reviewed within 24 hours. Once approved, funds are released to their bank account within 3-5 business days.',
    category: 'Payment',
  },
];

// Blog Posts
export const mockBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Top 10 Hidden Gems in Bangladesh You Must Visit in 2026',
    excerpt:
      'Discover lesser-known destinations that offer breathtaking beauty and authentic cultural experiences away from the usual tourist crowds.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
    author: {
      name: 'Travel Team',
      avatar: 'https://i.pravatar.cc/150?img=60',
    },
    publishedAt: '2026-01-20',
    readTime: '8 min read',
    category: 'Destinations',
  },
  {
    id: 'blog-2',
    title: 'The Ultimate Guide to Group Travel: Save Money and Make Memories',
    excerpt:
      'Learn how to organize perfect group trips, leverage group discounts, and use split payment features to travel more for less.',
    image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&h=400&fit=crop',
    author: {
      name: 'Group Travel Expert',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    publishedAt: '2026-01-18',
    readTime: '6 min read',
    category: 'Travel Tips',
  },
  {
    id: 'blog-3',
    title: 'Why Escrow-Based Booking is Changing Travel in Bangladesh',
    excerpt:
      'Understanding how secure payment systems protect your money and ensure quality service delivery in the travel industry.',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600&h=400&fit=crop',
    author: {
      name: 'Finance Team',
      avatar: 'https://i.pravatar.cc/150?img=22',
    },
    publishedAt: '2026-01-12',
    readTime: '5 min read',
    category: 'Industry Insights',
  },
];

// Partners
export const mockPartners: Partner[] = [
  {
    id: 'partner-1',
    name: 'Bangladesh Tourism Board',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%23006747'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='white' font-size='12' font-weight='bold'%3EBTB%3C/text%3E%3C/svg%3E",
  },
  {
    id: 'partner-2',
    name: 'Hotel Association',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%23FF6B6B'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='white' font-size='10' font-weight='bold'%3EHotel Assoc%3C/text%3E%3C/svg%3E",
  },
  {
    id: 'partner-3',
    name: 'Tour Operators Guild',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%234ECDC4'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='white' font-size='11' font-weight='bold'%3ETOG%3C/text%3E%3C/svg%3E",
  },
  {
    id: 'partner-4',
    name: 'Travel Insurance BD',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%23FFE66D'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='%23333' font-size='10' font-weight='bold'%3EInsurance%3C/text%3E%3C/svg%3E",
  },
  {
    id: 'partner-5',
    name: 'Eco Tourism Alliance',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%2395E1D3'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='white' font-size='11' font-weight='bold'%3EEco Tour%3C/text%3E%3C/svg%3E",
  },
  {
    id: 'partner-6',
    name: 'Bangladesh Bank',
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%23006747'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='white' font-size='10' font-weight='bold'%3EBD Bank%3C/text%3E%3C/svg%3E",
  },
];

// Stats
export const mockStats: Stat[] = [
  { id: 'stat-1', label: 'Happy Travelers', value: '10,000', icon: '👥', suffix: '+' },
  { id: 'stat-2', label: 'Bookings Completed', value: '5,000', icon: '✅', suffix: '+' },
  { id: 'stat-3', label: 'Verified Sellers', value: '500', icon: '🏆', suffix: '+' },
  { id: 'stat-4', label: 'Average Rating', value: '4.8', icon: '⭐', suffix: '★' },
];

// Seasonal Packages
export const mockSeasonalPackages: Listing[] = [
  {
    id: 'season-1',
    title: 'Winter Wonderland: North Bengal Hills',
    category: 'Tour',
    location: 'Bandarban & Rangamati',
    price: 12500,
    currency: 'BDT',
    rating: 4.9,
    reviewCount: 87,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    description: '5-day winter exploration of hill tracts',
    features: ['5D/4N', 'All Transport', 'Guide', 'Meals', 'Camping'],
  },
  {
    id: 'season-2',
    title: 'Dry Season Beach Escape',
    category: 'Hotel',
    location: "Cox's Bazar & Kuakata",
    price: 8900,
    currency: 'BDT',
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
    description: 'Perfect winter beach vacation package',
    features: ['4D/3N', '2 Beaches', 'Water Sports', 'Seafood', 'Transfers'],
  },
  {
    id: 'season-3',
    title: 'Heritage Winter Tour: Old Bengal',
    category: 'Experience',
    location: 'Dhaka & Sonargaon',
    price: 4200,
    currency: 'BDT',
    rating: 4.8,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop',
    description: 'Cultural immersion in historical sites',
    features: ['3D/2N', 'Heritage Sites', 'Museum Visits', 'Traditional Meals', 'Expert Guide'],
  },
];
