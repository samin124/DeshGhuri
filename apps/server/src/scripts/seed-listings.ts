import {
  db,
  seller,
  listing,
  LISTING_CATEGORIES,
  LISTING_STATUSES,
  CANCELLATION_POLICIES,
  PRICE_UNITS,
} from '@DeshGhuri/db';
import { nanoid } from 'nanoid';

// ============================================================================
// SEED DATA GENERATOR
// Generates realistic listings for DeshGhuri marketplace
// ============================================================================

async function createTestSellers() {
  console.log('Creating test sellers...');

  const testSellers = [
    {
      id: `seller-${nanoid()}`,
      email: 'heritage.hotels@deshghuri.test',
      businessName: 'Heritage Hotels Bangladesh',
      category: 'hotel',
      registrationNumber: 'HH-2020-001',
      address: {
        street: '25 Gulshan Avenue',
        city: 'Dhaka',
        district: 'Dhaka',
        postalCode: '1212',
      },
      contactPhone: '+880-1711-123456',
      contactEmail: 'info@heritagehotels.bd',
      businessDescription: 'Premium hotel chain across Bangladesh',
      verificationStatus: 'verified',
      rating: 4,
      reviewCount: 125,
      totalBookings: 450,
      verifiedAt: new Date(),
    },
    {
      id: `seller-${nanoid()}`,
      email: 'wanderlust.tours@deshghuri.test',
      businessName: 'Wanderlust Tours & Travels',
      category: 'tour-operator',
      registrationNumber: 'WT-2019-045',
      address: {
        street: '12 Banani Road',
        city: 'Dhaka',
        district: 'Dhaka',
        postalCode: '1213',
      },
      contactPhone: '+880-1722-234567',
      contactEmail: 'bookings@wanderlust.bd',
      businessDescription: 'Authentic Bangladesh travel experiences since 2019',
      verificationStatus: 'verified',
      rating: 5,
      reviewCount: 89,
      totalBookings: 320,
      verifiedAt: new Date(),
    },
    {
      id: `seller-${nanoid()}`,
      email: 'coxsbazar.resorts@deshghuri.test',
      businessName: "Cox's Bazar Beach Resorts",
      category: 'hotel',
      registrationNumber: 'CBR-2021-012',
      address: {
        street: 'Marine Drive Road',
        city: "Cox's Bazar",
        district: "Cox's Bazar",
      },
      contactPhone: '+880-1733-345678',
      contactEmail: 'reservations@coxresorts.bd',
      businessDescription: 'Luxury beachfront accommodations',
      verificationStatus: 'verified',
      rating: 5,
      reviewCount: 203,
      totalBookings: 890,
      verifiedAt: new Date(),
    },
    {
      id: `seller-${nanoid()}`,
      email: 'sylhet.eco@deshghuri.test',
      businessName: 'Sylhet Eco Adventures',
      category: 'tour-operator',
      registrationNumber: 'SEA-2020-033',
      address: {
        street: 'Zindabazar',
        city: 'Sylhet',
        district: 'Sylhet',
      },
      contactPhone: '+880-1744-456789',
      contactEmail: 'contact@sylheteco.bd',
      businessDescription: 'Eco-tourism and tea garden tours',
      verificationStatus: 'verified',
      rating: 4,
      reviewCount: 67,
      totalBookings: 145,
      verifiedAt: new Date(),
    },
    {
      id: `seller-${nanoid()}`,
      email: 'sundarbans.explorer@deshghuri.test',
      businessName: 'Sundarbans Explorer',
      category: 'agency',
      registrationNumber: 'SE-2018-089',
      address: {
        street: 'Khulna Port Area',
        city: 'Khulna',
        district: 'Khulna',
      },
      contactPhone: '+880-1755-567890',
      contactEmail: 'info@sundarbanexplorer.bd',
      businessDescription: 'Specialized Sundarbans mangrove forest tours',
      verificationStatus: 'verified',
      rating: 5,
      reviewCount: 142,
      totalBookings: 378,
      verifiedAt: new Date(),
    },
  ];

  const createdSellers = [];

  for (const sellerData of testSellers) {
    try {
      const existing = await db.query.seller.findFirst({
        where: (seller, { eq }) => eq(seller.email, sellerData.email),
      });

      if (existing) {
        console.log(`Seller ${sellerData.businessName} already exists, skipping...`);
        createdSellers.push(existing);
      } else {
        const [newSeller] = await db.insert(seller).values(sellerData).returning();
        console.log(`Created seller: ${sellerData.businessName}`);
        createdSellers.push(newSeller);
      }
    } catch (error) {
      console.error(`Error creating seller ${sellerData.businessName}:`, error);
    }
  }

  return createdSellers;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createHotelListings(sellers: any[]) {
  console.log('Creating hotel listings...');

  const hotels = [
    {
      title: "Luxury Sea View Resort - Cox's Bazar",
      description:
        'Experience the longest natural sea beach in the world from our premium beachfront resort. All rooms feature ocean views, private balconies, and modern amenities. Perfect for families and couples.',
      location: {
        city: "Cox's Bazar",
        district: "Cox's Bazar",
        address: 'Marine Drive, Kolatoli Beach',
        landmark: 'Near Sugandha Point',
      },
      basePrice: '8500',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 50,
      maxGuests: 4,
      amenities: ['WiFi', 'AC', 'Pool', 'Restaurant', 'Beach Access', 'Parking'],
      inclusions: ['Breakfast buffet', 'Airport pickup', 'Welcome drinks'],
      exclusions: ['Lunch and dinner', 'Spa services'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 5, maxParticipants: 10, discountPercentage: 10, pricePerPerson: 7650 },
        { minParticipants: 11, maxParticipants: 20, discountPercentage: 15, pricePerPerson: 7225 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
          storageKey: 'placeholder-1',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
          storageKey: 'placeholder-2',
          isPrimary: false,
        },
        {
          url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
          storageKey: 'placeholder-3',
          isPrimary: false,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Heritage Boutique Hotel Dhaka',
      description:
        'Stay in the heart of Dhaka with modern comfort and traditional hospitality. Our boutique hotel offers personalized service, rooftop dining, and easy access to business districts.',
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Gulshan-1, Road 25',
        landmark: 'Near Gulshan Lake Park',
      },
      basePrice: '6500',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 30,
      maxGuests: 3,
      amenities: ['WiFi', 'AC', 'Gym', 'Restaurant', 'Business Center', 'Laundry'],
      inclusions: ['Breakfast', 'Airport transfer'],
      exclusions: ['Minibar items'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
          storageKey: 'placeholder-4',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6',
          storageKey: 'placeholder-5',
          isPrimary: false,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Sylhet Hill View Resort',
      description:
        'Escape to the tea gardens of Sylhet. Our eco-resort offers panoramic views of rolling hills, organic meals, and guided nature walks.',
      location: {
        city: 'Sylhet',
        district: 'Sylhet',
        address: 'Srimongal Tea Estate',
        landmark: 'Lawachara National Park',
      },
      basePrice: '4500',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 20,
      maxGuests: 4,
      amenities: ['WiFi', 'Restaurant', 'Nature Trails', 'Organic Farm'],
      inclusions: ['All meals', 'Tea garden tour'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      checkInTime: '13:00',
      checkOutTime: '11:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 4, maxParticipants: 8, discountPercentage: 12, pricePerPerson: 3960 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1586611292717-f8c4b7a6e9d1',
          storageKey: 'placeholder-6',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Chittagong Port City Hotel',
      description:
        'Modern business hotel in the port city. Close to Patenga Beach and commercial areas. Ideal for business travelers and tourists.',
      location: {
        city: 'Chittagong',
        district: 'Chittagong',
        address: 'Agrabad Commercial Area',
        landmark: 'Near GEC Circle',
      },
      basePrice: '5500',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 40,
      maxGuests: 3,
      amenities: ['WiFi', 'AC', 'Restaurant', 'Conference Room', 'Parking'],
      inclusions: ['Breakfast'],
      exclusions: ['Lunch and dinner', 'Airport transfer'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 6, maxParticipants: 12, discountPercentage: 10, pricePerPerson: 4950 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
          storageKey: 'placeholder-7',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
          storageKey: 'placeholder-8',
          isPrimary: false,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Kuakata Beach Resort',
      description:
        'Witness both sunrise and sunset from the same beach! Our resort offers direct beach access, fresh seafood, and peaceful surroundings.',
      location: {
        city: 'Kuakata',
        district: 'Patuakhali',
        address: 'Kuakata Beach Road',
        landmark: 'Near Gangamati Reserved Forest',
      },
      basePrice: '4000',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 25,
      maxGuests: 4,
      amenities: ['Beach Access', 'Restaurant', 'WiFi', 'Garden'],
      inclusions: ['Breakfast', 'Beach activities'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      checkInTime: '13:00',
      checkOutTime: '11:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
          storageKey: 'placeholder-9',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Bandarban Hill Resort',
      description:
        'Mountain retreat in Bandarban with stunning valley views. Perfect base for exploring Nilgiri, Boga Lake, and tribal villages.',
      location: {
        city: 'Bandarban',
        district: 'Bandarban',
        address: 'Chimbuk Road',
        landmark: 'Near Golden Temple',
      },
      basePrice: '3500',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 15,
      maxGuests: 3,
      amenities: ['Mountain View', 'Restaurant', 'Campfire', 'Trekking'],
      inclusions: ['All meals', 'Local guide'],
      exclusions: ['Adventure activities'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      checkInTime: '12:00',
      checkOutTime: '10:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 5, maxParticipants: 10, discountPercentage: 15, pricePerPerson: 2975 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          storageKey: 'placeholder-10',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Rajshahi Silk City Inn',
      description:
        'Budget-friendly hotel in the Silk City. Explore mango orchards, Puthia Temple complex, and local silk markets.',
      location: {
        city: 'Rajshahi',
        district: 'Rajshahi',
        address: 'Shaheb Bazar',
        landmark: 'Near Padma Garden',
      },
      basePrice: '2500',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 20,
      maxGuests: 2,
      amenities: ['WiFi', 'AC', 'Restaurant'],
      inclusions: ['Breakfast'],
      exclusions: ['Transportation', 'Tours'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
          storageKey: 'placeholder-11',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Rangpur Heritage Lodge',
      description:
        'Colonial-era architecture meets modern comfort. Perfect for exploring Tajhat Palace and the northern region.',
      location: {
        city: 'Rangpur',
        district: 'Rangpur',
        address: 'Station Road',
        landmark: 'Near Carmichael College',
      },
      basePrice: '3000',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 18,
      maxGuests: 3,
      amenities: ['WiFi', 'AC', 'Garden', 'Parking'],
      inclusions: ['Breakfast', 'City tour'],
      exclusions: ['Lunch and dinner'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
          storageKey: 'placeholder-12',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Dinajpur Royal Palace Hotel',
      description:
        'Experience royal hospitality near Kantaji Temple. Spacious rooms, traditional cuisine, and cultural programs.',
      location: {
        city: 'Dinajpur',
        district: 'Dinajpur',
        address: 'Pulhat Road',
        landmark: 'Near Kantaji Temple',
      },
      basePrice: '3200',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 22,
      maxGuests: 4,
      amenities: ['WiFi', 'AC', 'Restaurant', 'Cultural Shows'],
      inclusions: ['Breakfast', 'Cultural performance'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 4, maxParticipants: 8, discountPercentage: 8, pricePerPerson: 2944 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
          storageKey: 'placeholder-13',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Saint Martin Island Beach Cottage',
      description:
        "Bangladesh's only coral island! Stay in beachfront cottages, snorkel in crystal-clear waters, and enjoy fresh coconuts.",
      location: {
        city: 'Saint Martin',
        district: "Cox's Bazar",
        address: 'West Beach',
        landmark: 'Chera Dwip',
      },
      basePrice: '5000',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 12,
      maxGuests: 3,
      amenities: ['Beach Access', 'Snorkeling', 'Restaurant', 'Boat Tours'],
      inclusions: ['All meals', 'Island tour', 'Snorkeling gear'],
      exclusions: ['Boat transfer from Teknaf'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      checkInTime: '11:00',
      checkOutTime: '09:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 6, maxParticipants: 12, discountPercentage: 20, pricePerPerson: 4000 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
          storageKey: 'placeholder-14',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0',
          storageKey: 'placeholder-15',
          isPrimary: false,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Old Dhaka Heritage Hotel',
      description:
        "Immerse yourself in old Dhaka's charm. Walking distance to Lalbagh Fort, Ahsan Manzil, and Sadarghat River Port.",
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Islampur Road',
        landmark: 'Near Lalbagh Fort',
      },
      basePrice: '4200',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 16,
      maxGuests: 2,
      amenities: ['WiFi', 'AC', 'Rooftop Cafe', 'Heritage Tours'],
      inclusions: ['Breakfast', 'Old Dhaka walking tour'],
      exclusions: ['Lunch and dinner'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
          storageKey: 'placeholder-16',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Khulna Gateway Hotel',
      description:
        'Your gateway to the Sundarbans. Comfortable accommodation with expert tour planning assistance.',
      location: {
        city: 'Khulna',
        district: 'Khulna',
        address: 'Khan Jahan Ali Road',
        landmark: 'Near Rupsha Bridge',
      },
      basePrice: '3800',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 28,
      maxGuests: 3,
      amenities: ['WiFi', 'AC', 'Restaurant', 'Tour Desk', 'Parking'],
      inclusions: ['Breakfast'],
      exclusions: ['Tours', 'Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
          storageKey: 'placeholder-17',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Paharpur Archaeological Lodge',
      description:
        'Stay near the UNESCO World Heritage Site of Paharpur Buddhist Monastery. Ideal for history enthusiasts.',
      location: {
        city: 'Naogaon',
        district: 'Rajshahi',
        address: 'Paharpur',
        landmark: 'Somapura Mahavihara',
      },
      basePrice: '2800',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 10,
      maxGuests: 2,
      amenities: ['WiFi', 'Restaurant', 'Garden', 'Historical Tours'],
      inclusions: ['Breakfast', 'Site tour guide'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      checkInTime: '13:00',
      checkOutTime: '11:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d',
          storageKey: 'placeholder-18',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Barisal Floating Market Hotel',
      description:
        'Experience the Venice of Bengal. Convenient access to floating markets, backwater cruises, and Durga Sagar.',
      location: {
        city: 'Barisal',
        district: 'Barisal',
        address: 'Sadar Road',
        landmark: 'Near Gournadi River',
      },
      basePrice: '3300',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 24,
      maxGuests: 3,
      amenities: ['WiFi', 'AC', 'Restaurant', 'Boat Tours'],
      inclusions: ['Breakfast', 'Floating market visit'],
      exclusions: ['Boat rental'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 5, maxParticipants: 10, discountPercentage: 12, pricePerPerson: 2904 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
          storageKey: 'placeholder-19',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Teknaf Beach Resort - Pending Review',
      description:
        'Southernmost tip of Bangladesh with pristine beaches. Currently under verification.',
      location: { city: 'Teknaf', district: "Cox's Bazar", address: 'Shahpari Island Road' },
      basePrice: '6000',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 20,
      maxGuests: 4,
      amenities: ['Beach Access', 'Restaurant', 'WiFi'],
      inclusions: ['Breakfast'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
          storageKey: 'placeholder-20',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.PENDING_REVIEW,
      publishedAt: undefined,
    },
    {
      title: "Cox's Bazar Budget Inn - Draft",
      description: 'Affordable accommodation near the beach. Still finalizing details.',
      location: { city: "Cox's Bazar", district: "Cox's Bazar", address: 'Laboni Point' },
      basePrice: '2000',
      priceUnit: PRICE_UNITS.PER_NIGHT,
      capacity: 30,
      maxGuests: 3,
      amenities: ['WiFi', 'Restaurant'],
      inclusions: ['Breakfast'],
      exclusions: [],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
          storageKey: 'placeholder-21',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.DRAFT,
      publishedAt: undefined,
    },
  ];

  const hotelSellers = sellers.filter((s) => s.category === 'hotel');
  let sellerIndex = 0;

  for (const hotel of hotels) {
    try {
      const sellerId = hotelSellers[sellerIndex % hotelSellers.length].id;

      await db.insert(listing).values({
        id: `listing-${nanoid()}`,
        sellerId,
        title: hotel.title,
        slug: generateSlug(hotel.title),
        description: hotel.description,
        category: LISTING_CATEGORIES.HOTEL,
        location: hotel.location,
        basePrice: hotel.basePrice,
        currency: 'BDT',
        priceUnit: hotel.priceUnit,
        capacity: hotel.capacity,
        minGuests: 1,
        maxGuests: hotel.maxGuests,
        groupEligible: hotel.groupEligible,
        groupPricingTiers: hotel.groupPricingTiers,
        amenities: hotel.amenities,
        inclusions: hotel.inclusions,
        exclusions: hotel.exclusions,
        cancellationPolicy: hotel.cancellationPolicy,
        checkInTime: hotel.checkInTime,
        checkOutTime: hotel.checkOutTime,
        images: hotel.images,
        status: hotel.status,
        viewCount: Math.floor(Math.random() * 500),
        bookingCount: Math.floor(Math.random() * 50),
        rating: (Math.random() * 2 + 3).toFixed(2), // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 100),
        isFeatured: Math.random() > 0.7, // 30% featured
        isTrending: Math.random() > 0.8, // 20% trending
        publishedAt: hotel.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Created hotel: ${hotel.title}`);
      sellerIndex++;
    } catch (error) {
      console.error(`Error creating hotel ${hotel.title}:`, error);
    }
  }
}

async function createTourPackages(sellers: any[]) {
  console.log('Creating tour package listings...');

  const tours = [
    {
      title: 'Sundarbans Mangrove Forest 3-Day Safari',
      description:
        "Explore the world's largest mangrove forest and spot Royal Bengal Tigers, crocodiles, and exotic birds. Includes boat safari, guided tours, and traditional meals.",
      location: {
        city: 'Khulna',
        district: 'Khulna',
        address: 'Mongla Port departure',
        landmark: 'Sundarbans National Park',
      },
      basePrice: '12000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 40,
      maxGuests: 40,
      amenities: ['Boat Safari', 'Expert Guide', 'Wildlife Viewing', 'Meals Included'],
      inclusions: ['3 days boat accommodation', 'All meals', 'Park entry fees', 'Guide'],
      exclusions: ['Personal expenses', 'Travel insurance'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 10, maxParticipants: 20, discountPercentage: 15, pricePerPerson: 10200 },
        { minParticipants: 21, maxParticipants: 40, discountPercentage: 25, pricePerPerson: 9000 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1604055195689-6e55a1c81a63',
          storageKey: 'tour-1',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44',
          storageKey: 'tour-2',
          isPrimary: false,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Sajek Valley Cloud Paradise 2-Day Trip',
      description:
        'Journey to the "Roof of Rangamati" and witness breathtaking mountain views, tribal culture, and stunning sunrises above the clouds.',
      location: {
        city: 'Rangamati',
        district: 'Rangamati',
        address: 'Sajek Valley',
        landmark: 'Konglak Para Viewpoint',
      },
      basePrice: '8500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 30,
      maxGuests: 30,
      amenities: ['Mountain Trekking', 'Tribal Village Visit', 'Scenic Views'],
      inclusions: ['Transportation from Dhaka', '1-night cottage stay', 'Meals', 'Guide'],
      exclusions: ['Tips for guides', 'Extra activities'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 15, discountPercentage: 12, pricePerPerson: 7480 },
        { minParticipants: 16, maxParticipants: 30, discountPercentage: 18, pricePerPerson: 6970 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          storageKey: 'tour-3',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Ratargul Swamp Forest Adventure',
      description:
        "Explore Bangladesh's only freshwater swamp forest by boat. Perfect during monsoon season when the forest is submerged.",
      location: {
        city: 'Sylhet',
        district: 'Sylhet',
        address: 'Gowainghat',
        landmark: 'Ratargul Swamp Forest',
      },
      basePrice: '3500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 25,
      maxGuests: 25,
      amenities: ['Boat Ride', 'Nature Guide', 'Photography'],
      inclusions: ['Boat rental', 'Guide', 'Entry fees', 'Lunch'],
      exclusions: ['Transportation from Sylhet city'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 6, maxParticipants: 12, discountPercentage: 10, pricePerPerson: 3150 },
        { minParticipants: 13, maxParticipants: 25, discountPercentage: 18, pricePerPerson: 2870 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab',
          storageKey: 'tour-4',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Dhaka City Heritage Walk',
      description:
        'Full-day guided walking tour of Old Dhaka. Visit 400-year-old monuments, bustling bazaars, and traditional food streets.',
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Old Dhaka',
        landmark: 'Lalbagh Fort',
      },
      basePrice: '1500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 15,
      maxGuests: 15,
      amenities: ['Walking Tour', 'Heritage Sites', 'Food Tasting'],
      inclusions: ['Expert guide', 'Monument entry fees', 'Traditional lunch', 'Rickshaw rides'],
      exclusions: ['Personal purchases'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 5, maxParticipants: 10, discountPercentage: 15, pricePerPerson: 1275 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24',
          storageKey: 'tour-5',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Nilgiri Hills Trek - Bandarban',
      description:
        'Trek to the highest peak accessible by road in Bangladesh. Watch clouds pass beneath you at 2200 feet elevation.',
      location: {
        city: 'Bandarban',
        district: 'Bandarban',
        address: 'Thanchi Road',
        landmark: 'Nilgiri Tourist Spot',
      },
      basePrice: '6500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 20,
      maxGuests: 20,
      amenities: ['Mountain Trekking', 'Sunrise View', 'Photography'],
      inclusions: ['Transportation from Bandarban', 'Guide', 'Entry fees', 'Breakfast'],
      exclusions: ['Accommodation', 'Lunch and dinner'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 15, discountPercentage: 12, pricePerPerson: 5720 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
          storageKey: 'tour-6',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Puthia Temple Complex Tour',
      description:
        'Visit the largest concentration of historic Hindu temples in Bangladesh. Architecture dating back to the 16th century.',
      location: {
        city: 'Rajshahi',
        district: 'Rajshahi',
        address: 'Puthia',
        landmark: 'Govinda Temple',
      },
      basePrice: '2500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 30,
      maxGuests: 30,
      amenities: ['Historical Tour', 'Photography', 'Cultural Experience'],
      inclusions: ['Transportation from Rajshahi', 'Guide', 'Entry fees', 'Lunch'],
      exclusions: ['Personal expenses'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 10, maxParticipants: 20, discountPercentage: 20, pricePerPerson: 2000 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1548013146-72479768bada',
          storageKey: 'tour-7',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Boga Lake Expedition - Remote Bandarban',
      description:
        '2-day trek to the mysterious Boga Lake at 1,246m elevation. Natural crater lake surrounded by mountains.',
      location: {
        city: 'Bandarban',
        district: 'Bandarban',
        address: 'Ruma Upazila',
        landmark: 'Boga Lake',
      },
      basePrice: '9500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 16,
      maxGuests: 16,
      amenities: ['Mountain Trekking', 'Camping', 'Tribal Village Visit'],
      inclusions: ['Guide', 'Camping equipment', 'All meals', 'Porter service'],
      exclusions: ['Personal gear', 'Travel insurance'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 16, discountPercentage: 18, pricePerPerson: 7790 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          storageKey: 'tour-8',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Mahasthangarh Archaeological Tour',
      description:
        'Discover one of the earliest urban archaeological sites in Bangladesh. 3rd century BCE fortified city.',
      location: {
        city: 'Bogra',
        district: 'Rajshahi',
        address: 'Shibganj',
        landmark: 'Mahasthangarh Museum',
      },
      basePrice: '3000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 25,
      maxGuests: 25,
      amenities: ['Historical Tour', 'Museum Visit', 'Expert Guide'],
      inclusions: ['Transportation from Bogra', 'Guide', 'Museum entry', 'Lunch'],
      exclusions: ['Accommodation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 15, discountPercentage: 15, pricePerPerson: 2550 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f',
          storageKey: 'tour-9',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Chittagong Hill Tracts Cultural Tour',
      description:
        '3-day journey through tribal villages. Meet the Chakma, Marma, and Tripura communities. Authentic cultural immersion.',
      location: {
        city: 'Rangamati',
        district: 'Chittagong',
        address: 'Kaptai Lake area',
        landmark: 'Hanging Bridge',
      },
      basePrice: '11000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 12,
      maxGuests: 12,
      amenities: ['Cultural Tours', 'Tribal Villages', 'Lake Cruise', 'Handicrafts'],
      inclusions: ['2 nights accommodation', 'All meals', 'Boat rides', 'Guide', 'Village visits'],
      exclusions: ['Personal purchases'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 6, maxParticipants: 12, discountPercentage: 20, pricePerPerson: 8800 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
          storageKey: 'tour-10',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Sixty Dome Mosque & Bagerhat Heritage',
      description:
        'UNESCO World Heritage Site visit. 15th-century mosque city built by Khan Jahan Ali.',
      location: {
        city: 'Bagerhat',
        district: 'Khulna',
        address: 'Bagerhat Sadar',
        landmark: 'Sixty Dome Mosque',
      },
      basePrice: '2000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 40,
      maxGuests: 40,
      amenities: ['UNESCO Site', 'Historical Tour', 'Photography'],
      inclusions: ['Guide', 'Entry fees', 'Lunch'],
      exclusions: ['Transportation from Khulna'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 15, maxParticipants: 30, discountPercentage: 25, pricePerPerson: 1500 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769',
          storageKey: 'tour-11',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Jaflong & Bichnakandi Waterfall Tour',
      description:
        'Day trip to see cascading waterfalls, stone collection sites, and the border river with India.',
      location: {
        city: 'Sylhet',
        district: 'Sylhet',
        address: 'Jaflong Zero Point',
        landmark: 'Dawki River',
      },
      basePrice: '4000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 20,
      maxGuests: 20,
      amenities: ['Waterfall Visit', 'Boat Ride', 'Border View'],
      inclusions: ['Transportation from Sylhet', 'Boat rides', 'Guide', 'Lunch'],
      exclusions: ['Personal purchases'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 15, discountPercentage: 15, pricePerPerson: 3400 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
          storageKey: 'tour-12',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Haor Basin Monsoon Adventure',
      description:
        'Experience the "bowl of water" during monsoon. Boat through endless wetlands, visit floating villages.',
      location: {
        city: 'Sunamganj',
        district: 'Sylhet',
        address: 'Tanguar Haor',
        landmark: 'Wetland Sanctuary',
      },
      basePrice: '7500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 18,
      maxGuests: 18,
      amenities: ['Boat Safari', 'Bird Watching', 'Fishing Villages'],
      inclusions: ['2 days boat accommodation', 'All meals', 'Guide', 'Entry permits'],
      exclusions: ['Transportation to Sunamganj'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 10, maxParticipants: 18, discountPercentage: 22, pricePerPerson: 5850 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
          storageKey: 'tour-13',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Liberation War Trail - Dhaka to Meherpur',
      description:
        "Historical tour following Bangladesh's 1971 Independence War. Visit Mujibnagar Memorial, war museums.",
      location: {
        city: 'Meherpur',
        district: 'Khulna',
        address: 'Mujibnagar',
        landmark: 'Independence Memorial',
      },
      basePrice: '5500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 25,
      maxGuests: 25,
      amenities: ['Historical Tour', 'Museums', 'Memorial Sites'],
      inclusions: ['Transportation', 'Guide', 'Entry fees', 'Lunch'],
      exclusions: ['Accommodation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 12, maxParticipants: 25, discountPercentage: 18, pricePerPerson: 4510 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
          storageKey: 'tour-14',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Rocket Steamer River Cruise',
      description:
        'Vintage paddlewheel steamer journey on the Padma River. Colonial-era luxury travel experience.',
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Sadarghat River Port',
        landmark: 'Rocket Steamer Terminal',
      },
      basePrice: '4500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 50,
      maxGuests: 50,
      amenities: ['Paddle Steamer', 'River Cruise', 'Colonial Experience'],
      inclusions: ['Steamer cabin', 'Meals on board', 'Guided commentary'],
      exclusions: ['Transportation to port'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 20, maxParticipants: 40, discountPercentage: 20, pricePerPerson: 3600 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          storageKey: 'tour-15',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
  ];

  const tourSellers = sellers.filter(
    (s) => s.category === 'tour-operator' || s.category === 'agency'
  );
  let sellerIndex = 0;

  for (const tour of tours) {
    try {
      const sellerId = tourSellers[sellerIndex % tourSellers.length].id;

      await db.insert(listing).values({
        id: `listing-${nanoid()}`,
        sellerId,
        title: tour.title,
        slug: generateSlug(tour.title),
        description: tour.description,
        category: LISTING_CATEGORIES.TOUR_PACKAGE,
        location: tour.location,
        basePrice: tour.basePrice,
        currency: 'BDT',
        priceUnit: tour.priceUnit,
        capacity: tour.capacity,
        minGuests: 1,
        maxGuests: tour.maxGuests,
        groupEligible: tour.groupEligible,
        groupPricingTiers: tour.groupPricingTiers,
        amenities: tour.amenities,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        cancellationPolicy: tour.cancellationPolicy,
        images: tour.images,
        status: tour.status,
        viewCount: Math.floor(Math.random() * 800),
        bookingCount: Math.floor(Math.random() * 80),
        rating: (Math.random() * 1.5 + 3.5).toFixed(2),
        reviewCount: Math.floor(Math.random() * 150),
        isFeatured: Math.random() > 0.6,
        isTrending: Math.random() > 0.7,
        publishedAt: tour.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Created tour package: ${tour.title}`);
      sellerIndex++;
    } catch (error) {
      console.error(`Error creating tour ${tour.title}:`, error);
    }
  }
}

async function createExperiences(sellers: any[]) {
  console.log('Creating experience listings...');

  const experiences = [
    {
      title: 'Traditional Pottery Making Workshop',
      description:
        'Learn ancient pottery techniques from master artisans. Create your own terracotta piece to take home.',
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Dhamrai',
        landmark: 'Pottery Village',
      },
      basePrice: '1200',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 12,
      maxGuests: 12,
      amenities: ['Hands-on Workshop', 'Expert Instruction', 'Materials Included'],
      inclusions: ['Workshop', 'Materials', 'Refreshments', 'Your finished pottery'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 6, maxParticipants: 12, discountPercentage: 15, pricePerPerson: 1020 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
          storageKey: 'exp-1',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'River Fishing with Local Fishermen',
      description:
        'Dawn fishing expedition on the Padma River. Traditional net fishing techniques, fresh catch breakfast.',
      location: {
        city: 'Manikganj',
        district: 'Dhaka',
        address: 'Padma River Bank',
        landmark: 'Fishing Village',
      },
      basePrice: '2500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 8,
      maxGuests: 8,
      amenities: ['Fishing', 'Traditional Techniques', 'Breakfast'],
      inclusions: ['Boat rental', 'Fishing gear', 'Guide', 'Fresh fish breakfast'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
          storageKey: 'exp-2',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Bengali Cooking Class with Home Chef',
      description:
        'Master authentic Bengali dishes in a local home. Market tour, hands-on cooking, family-style dining.',
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Dhanmondi',
        landmark: 'Local Residence',
      },
      basePrice: '1800',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 8,
      maxGuests: 8,
      amenities: ['Cooking Class', 'Market Tour', 'Recipe Book'],
      inclusions: ['Market visit', 'Cooking instruction', 'Meal', 'Recipe cards'],
      exclusions: [],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 4, maxParticipants: 8, discountPercentage: 12, pricePerPerson: 1584 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
          storageKey: 'exp-3',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Rickshaw Art Painting Workshop',
      description:
        "Discover Bangladesh's vibrant rickshaw art tradition. Paint your own miniature rickshaw panel.",
      location: { city: 'Dhaka', district: 'Dhaka', address: 'Mirpur', landmark: 'Art Workshop' },
      basePrice: '1500',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 10,
      maxGuests: 10,
      amenities: ['Art Workshop', 'Materials Provided', 'Cultural Experience'],
      inclusions: ['All materials', 'Instruction', 'Your artwork', 'Tea and snacks'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 5, maxParticipants: 10, discountPercentage: 10, pricePerPerson: 1350 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
          storageKey: 'exp-4',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Sunset Boat Ride on Kaptai Lake',
      description:
        "Peaceful evening cruise on Bangladesh's largest lake. Watch tribal villages light up as sun sets.",
      location: {
        city: 'Rangamati',
        district: 'Chittagong',
        address: 'Kaptai Lake',
        landmark: 'Hanging Bridge',
      },
      basePrice: '800',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 20,
      maxGuests: 20,
      amenities: ['Boat Cruise', 'Sunset Views', 'Photography'],
      inclusions: ['Boat ride', 'Guide', 'Refreshments'],
      exclusions: [],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 10, maxParticipants: 20, discountPercentage: 20, pricePerPerson: 640 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          storageKey: 'exp-5',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Traditional Weaving Experience',
      description:
        'Learn handloom weaving from skilled artisans. Create your own woven scarf or napkin.',
      location: {
        city: 'Tangail',
        district: 'Dhaka',
        address: 'Weaver Village',
        landmark: 'Handloom Center',
      },
      basePrice: '1600',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 6,
      maxGuests: 6,
      amenities: ['Weaving Workshop', 'Artisan Teaching', 'Cultural Immersion'],
      inclusions: ['Weaving lesson', 'Materials', 'Your woven item', 'Lunch'],
      exclusions: ['Transportation'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1610992015762-45b2d7c60c0d',
          storageKey: 'exp-6',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Street Photography Walk - Old Dhaka',
      description:
        'Capture the essence of Old Dhaka with a professional photographer. Learn composition and storytelling.',
      location: { city: 'Dhaka', district: 'Dhaka', address: 'Puran Dhaka', landmark: 'Sadarghat' },
      basePrice: '2000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 6,
      maxGuests: 6,
      amenities: ['Photography Tour', 'Professional Guidance', 'Photo Critique'],
      inclusions: ['Professional photographer guide', 'Photo locations', 'Post-processing tips'],
      exclusions: ['Camera equipment'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
          storageKey: 'exp-7',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Yoga Retreat by the Beach',
      description:
        "Morning yoga session on Cox's Bazar beach. Meditation, pranayama, and seaside relaxation.",
      location: {
        city: "Cox's Bazar",
        district: "Cox's Bazar",
        address: 'Sugandha Beach',
        landmark: 'Meditation Point',
      },
      basePrice: '1000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 15,
      maxGuests: 15,
      amenities: ['Yoga Class', 'Meditation', 'Beach Setting'],
      inclusions: ['Yoga instructor', 'Mat rental', 'Healthy breakfast'],
      exclusions: [],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 15, discountPercentage: 15, pricePerPerson: 850 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
          storageKey: 'exp-8',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Tea Garden Tasting Tour',
      description:
        'Visit a working tea estate. Walk through tea plantations, observe processing, taste 7 varieties.',
      location: {
        city: 'Sylhet',
        district: 'Sylhet',
        address: 'Srimongal',
        landmark: 'Finlay Tea Estate',
      },
      basePrice: '2200',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 12,
      maxGuests: 12,
      amenities: ['Tea Tasting', 'Plantation Walk', 'Factory Visit'],
      inclusions: ['Estate tour', 'Tea tasting', 'Lunch', 'Tea gift pack'],
      exclusions: ['Transportation from Sylhet'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 6, maxParticipants: 12, discountPercentage: 18, pricePerPerson: 1804 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e',
          storageKey: 'exp-9',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: "Paragliding Adventure - Cox's Bazar",
      description:
        "Tandem paragliding over the world's longest beach. Professional pilot, safety equipment included.",
      location: {
        city: "Cox's Bazar",
        district: "Cox's Bazar",
        address: 'Kolatoli Beach',
        landmark: 'Adventure Sports Center',
      },
      basePrice: '6000',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 8,
      maxGuests: 8,
      amenities: ['Paragliding', 'Professional Pilot', 'Safety Gear'],
      inclusions: ['Tandem flight', 'Safety equipment', 'Photo package', 'Insurance'],
      exclusions: [],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1529672337062-e3915a3b8f05',
          storageKey: 'exp-10',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
  ];

  const experienceSellers = sellers.filter(
    (s) => s.category === 'tour-operator' || s.category === 'agency'
  );
  let sellerIndex = 0;

  for (const exp of experiences) {
    try {
      const sellerId = experienceSellers[sellerIndex % experienceSellers.length].id;

      await db.insert(listing).values({
        id: `listing-${nanoid()}`,
        sellerId,
        title: exp.title,
        slug: generateSlug(exp.title),
        description: exp.description,
        category: LISTING_CATEGORIES.EXPERIENCE,
        location: exp.location,
        basePrice: exp.basePrice,
        currency: 'BDT',
        priceUnit: exp.priceUnit,
        capacity: exp.capacity,
        minGuests: 1,
        maxGuests: exp.maxGuests,
        groupEligible: exp.groupEligible,
        groupPricingTiers: exp.groupPricingTiers,
        amenities: exp.amenities,
        inclusions: exp.inclusions,
        exclusions: exp.exclusions,
        cancellationPolicy: exp.cancellationPolicy,
        images: exp.images,
        status: exp.status,
        viewCount: Math.floor(Math.random() * 300),
        bookingCount: Math.floor(Math.random() * 40),
        rating: (Math.random() * 1.5 + 3.5).toFixed(2),
        reviewCount: Math.floor(Math.random() * 80),
        isFeatured: Math.random() > 0.75,
        isTrending: Math.random() > 0.8,
        publishedAt: exp.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Created experience: ${exp.title}`);
      sellerIndex++;
    } catch (error) {
      console.error(`Error creating experience ${exp.title}:`, error);
    }
  }
}

async function createTransportOptions(sellers: any[]) {
  console.log('Creating transport listings...');

  const transports = [
    {
      title: 'Airport Transfer - Dhaka Luxury Sedan',
      description:
        'Comfortable airport pickup/drop-off service. Professional driver, AC vehicle, meet and greet service.',
      location: {
        city: 'Dhaka',
        district: 'Dhaka',
        address: 'Hazrat Shahjalal International Airport',
        landmark: 'Airport Terminal',
      },
      basePrice: '1500',
      priceUnit: PRICE_UNITS.PER_BOOKING,
      capacity: 4,
      maxGuests: 4,
      amenities: ['AC Vehicle', 'Professional Driver', 'WiFi', 'Water Bottles'],
      inclusions: ['Airport pickup', 'Meet and greet', 'Waiting time (1 hour)', 'Toll charges'],
      exclusions: ['Waiting beyond 1 hour'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2',
          storageKey: 'transport-1',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: "Cox's Bazar to Dhaka AC Bus Service",
      description:
        'Overnight AC sleeper coach. Comfortable seats, onboard entertainment, refreshments included.',
      location: {
        city: "Cox's Bazar",
        district: "Cox's Bazar",
        address: 'Bus Terminal',
        landmark: 'Central Bus Stand',
      },
      basePrice: '1200',
      priceUnit: PRICE_UNITS.PER_PERSON,
      capacity: 40,
      maxGuests: 40,
      amenities: ['AC Bus', 'Reclining Seats', 'Entertainment', 'Restroom'],
      inclusions: ['Snacks', 'Water', 'Blanket'],
      exclusions: ['Meals'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 10, maxParticipants: 20, discountPercentage: 10, pricePerPerson: 1080 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
          storageKey: 'transport-2',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Private Car Rental - Full Day Dhaka',
      description:
        '8-hour car rental with driver. Visit multiple destinations in Dhaka at your own pace.',
      location: { city: 'Dhaka', district: 'Dhaka', address: 'Gulshan', landmark: 'Rental Office' },
      basePrice: '4500',
      priceUnit: PRICE_UNITS.PER_BOOKING,
      capacity: 5,
      maxGuests: 5,
      amenities: ['AC Vehicle', 'Professional Driver', 'Fuel Included', 'Parking'],
      inclusions: ['8 hours service', 'Driver allowance', 'Fuel (within Dhaka)', 'Parking fees'],
      exclusions: ['Extra hours', 'Outside Dhaka travel'],
      cancellationPolicy: CANCELLATION_POLICIES.FLEXIBLE,
      groupEligible: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
          storageKey: 'transport-3',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Microbus Rental - Sylhet Sightseeing',
      description:
        '12-seater AC microbus for Sylhet tours. Visit Jaflong, Ratargul, tea gardens comfortably.',
      location: {
        city: 'Sylhet',
        district: 'Sylhet',
        address: 'Sylhet Sadar',
        landmark: 'City Center',
      },
      basePrice: '8000',
      priceUnit: PRICE_UNITS.PER_BOOKING,
      capacity: 12,
      maxGuests: 12,
      amenities: ['AC Microbus', 'Experienced Driver', 'Luggage Space'],
      inclusions: ['Full day rental', 'Driver', 'Fuel (within district)', 'Parking'],
      exclusions: ['Entry fees', 'Meals'],
      cancellationPolicy: CANCELLATION_POLICIES.MODERATE,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 8, maxParticipants: 12, discountPercentage: 15, pricePerPerson: 680 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
          storageKey: 'transport-4',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Boat Rental - Sundarbans Exploration',
      description:
        'Private boat for Sundarbans safari. Experienced crew, safety equipment, comfortable seating.',
      location: {
        city: 'Khulna',
        district: 'Khulna',
        address: 'Mongla Port',
        landmark: 'Sundarbans Entry',
      },
      basePrice: '25000',
      priceUnit: PRICE_UNITS.PER_BOOKING,
      capacity: 20,
      maxGuests: 20,
      amenities: ['Private Boat', 'Crew', 'Safety Equipment', 'Sleeping Quarters'],
      inclusions: ['Boat rental', 'Crew', 'Fuel', 'Safety gear', 'Cooking facilities'],
      exclusions: ['Food supplies', 'Park fees', 'Guide'],
      cancellationPolicy: CANCELLATION_POLICIES.STRICT,
      groupEligible: true,
      groupPricingTiers: [
        { minParticipants: 15, maxParticipants: 20, discountPercentage: 20, pricePerPerson: 1000 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1606122017369-d782bbb78f32',
          storageKey: 'transport-5',
          isPrimary: true,
        },
      ],
      status: LISTING_STATUSES.ACTIVE,
      publishedAt: new Date(),
    },
  ];

  const transportSellers = sellers;
  let sellerIndex = 0;

  for (const transport of transports) {
    try {
      const sellerId = transportSellers[sellerIndex % transportSellers.length].id;

      await db.insert(listing).values({
        id: `listing-${nanoid()}`,
        sellerId,
        title: transport.title,
        slug: generateSlug(transport.title),
        description: transport.description,
        category: LISTING_CATEGORIES.TRANSPORT,
        location: transport.location,
        basePrice: transport.basePrice,
        currency: 'BDT',
        priceUnit: transport.priceUnit,
        capacity: transport.capacity,
        minGuests: 1,
        maxGuests: transport.maxGuests,
        groupEligible: transport.groupEligible,
        groupPricingTiers: transport.groupPricingTiers,
        amenities: transport.amenities,
        inclusions: transport.inclusions,
        exclusions: transport.exclusions,
        cancellationPolicy: transport.cancellationPolicy,
        images: transport.images,
        status: transport.status,
        viewCount: Math.floor(Math.random() * 200),
        bookingCount: Math.floor(Math.random() * 30),
        rating: (Math.random() * 1.5 + 3.5).toFixed(2),
        reviewCount: Math.floor(Math.random() * 60),
        isFeatured: Math.random() > 0.8,
        isTrending: Math.random() > 0.85,
        publishedAt: transport.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Created transport: ${transport.title}`);
      sellerIndex++;
    } catch (error) {
      console.error(`Error creating transport ${transport.title}:`, error);
    }
  }
}

async function main() {
  console.log('🌱 Starting DeshGhuri Seed Script...\n');

  try {
    // Create sellers first
    const sellers = await createTestSellers();
    console.log(`\n✅ Created/found ${sellers.length} sellers\n`);

    // Create listings by category
    await createHotelListings(sellers);
    await createTourPackages(sellers);
    await createExperiences(sellers);
    await createTransportOptions(sellers);

    console.log('\n✅ Seed script completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Sellers: 5 verified sellers across different categories');
    console.log('- Hotels: 15 listings (13 active, 1 pending review, 1 draft)');
    console.log('- Tour Packages: 15 active listings');
    console.log('- Experiences: 10 active listings');
    console.log('- Transport: 5 active listings');
    console.log('- TOTAL: 45 listings (43 active + 2 non-active)');
    console.log('\n💡 Test the public API:');
    console.log('   GET  http://localhost:3000/api/listings');
    console.log('   GET  http://localhost:3000/api/listings/featured');
    console.log('   GET  http://localhost:3000/api/listings/trending');
    console.log('\n🌐 Browse on frontend:');
    console.log('   http://localhost:3001/search');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  }
}

main();
