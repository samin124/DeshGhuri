import { db, listing, seller, review, user, LISTING_CATEGORIES, LISTING_STATUSES } from '@DeshGhuri/db';
import { eq, and, sql } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { nanoid } from 'nanoid';

/**
 * Comprehensive data seeding script
 * Creates 100+ listings with sellers, reviews, promotions, etc.
 */

// Bangladesh destinations
const DESTINATIONS = [
  { city: 'Cox\'s Bazar', district: 'Cox\'s Bazar', division: 'Chittagong' },
  { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' },
  { city: 'Sylhet', district: 'Sylhet', division: 'Sylhet' },
  { city: 'Chittagong', district: 'Chittagong', division: 'Chittagong' },
  { city: 'Rangamati', district: 'Rangamati', division: 'Chittagong' },
  { city: 'Bandarban', district: 'Bandarban', division: 'Chittagong' },
  { city: 'Khagrachari', district: 'Khagrachari', division: 'Chittagong' },
  { city: 'Sundarbans', district: 'Khulna', division: 'Khulna' },
  { city: 'Kuakata', district: 'Patuakhali', division: 'Barisal' },
  { city: 'Saint Martin\'s Island', district: 'Cox\'s Bazar', division: 'Chittagong' },
  { city: 'Sajek Valley', district: 'Rangamati', division: 'Chittagong' },
  { city: 'Sreemangal', district: 'Moulvibazar', division: 'Sylhet' },
  { city: 'Nilgiri', district: 'Bandarban', division: 'Chittagong' },
  { city: 'Jaflong', district: 'Sylhet', division: 'Sylhet' },
  { city: 'Ratargul', district: 'Sylhet', division: 'Sylhet' },
];

// Listing templates
const HOTEL_NAMES = [
  'Luxury Beach Resort', 'Sea View Hotel', 'Heritage Boutique Hotel', 'Grand Palace Hotel',
  'Eco Resort', 'Hill View Resort', 'Royal Garden Hotel', 'Paradise Resort',
  'Seaside Inn', 'Mountain Lodge', 'Lake View Hotel', 'Green Valley Resort',
  'Ocean Breeze Hotel', 'Sunset Beach Resort', 'Golden Sands Hotel',
  'Premium Suites', 'Comfort Inn', 'Elite Hotel', 'Riverside Resort', 'Palm Beach Hotel'
];

const TOUR_NAMES = [
  'Complete Adventure Tour', 'Heritage & Culture Tour', 'Nature Explorer Package',
  'Beach Paradise Tour', 'Hill Trekking Adventure', 'River Cruise Experience',
  'Wildlife Safari Tour', 'City Discovery Tour', 'Waterfall Trek Package',
  'Historical Sites Tour', 'Photography Expedition', 'Sunset Cruise Tour',
  'Village Life Experience', 'Tea Garden Tour', 'Mangrove Forest Safari',
  'Island Hopping Tour', 'Mountain Climbing Package', 'Cultural Immersion Tour'
];

const EXPERIENCE_NAMES = [
  'Scuba Diving Experience', 'Parasailing Adventure', 'River Rafting', 'Rock Climbing',
  'Zip Lining Thrill', 'ATV Ride', 'Boat Safari', 'Night Safari',
  'Camping Under Stars', 'Fishing Experience', 'Kayaking Adventure', 'Snorkeling Tour',
  'Jungle Trek', 'Bird Watching Tour', 'Photography Workshop', 'Cooking Class',
  'Traditional Dance Show', 'Handicraft Workshop'
];

const TRANSPORT_NAMES = [
  'Private Car Rental', 'Luxury Coach Service', 'Boat Transfer', 'Helicopter Tour',
  'Speedboat Service', 'Minibus Rental', 'SUV Rental', 'Tourist Bus Service',
  'Ferry Service', 'Private Yacht Charter', 'Airport Pickup Service', 'Sightseeing Van'
];

const AMENITIES = [
  'WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service',
  'Air Conditioning', 'Parking', 'Beach Access', 'Garden', 'Conference Room',
  'Kids Play Area', 'Terrace', 'BBQ Area', 'Laundry', '24/7 Security', 'Pet Friendly'
];

const REVIEW_COMMENTS = [
  'Amazing experience! Highly recommended.',
  'Great service and beautiful location.',
  'Perfect for families. Kids loved it!',
  'Value for money. Will come back again.',
  'Excellent facilities and friendly staff.',
  'Breathtaking views and comfortable rooms.',
  'One of the best experiences in Bangladesh!',
  'Professional service and great hospitality.',
  'Clean, comfortable, and well-maintained.',
  'Exceeded our expectations in every way.',
];

// Seller company names
const SELLER_COMPANIES = [
  'Paradise Resorts Ltd', 'Heritage Hospitality', 'Green Valley Tours', 'Ocean View Hotels',
  'Mountain Adventures', 'Eco Tourism BD', 'Royal Travels', 'Sunrise Hotels',
  'Dream Destinations', 'Golden Tours', 'Elite Hospitality', 'Nature Explorers',
  'Beach Paradise Ltd', 'Hill Top Resorts', 'River Cruises BD', 'Safari Adventures',
  'City Breaks BD', 'Luxury Stays', 'Adventure Seekers', 'Cultural Tours BD'
];

// Promo codes
const PROMO_CODES = [
  { code: 'SAVE20', discount: 20 },
  { code: 'WINTER25', discount: 25 },
  { code: 'FLASH15', discount: 15 },
  { code: 'SUMMER30', discount: 30 },
  { code: 'HOLIDAY40', discount: 40 },
  { code: 'WEEKEND10', discount: 10 },
  { code: 'FAMILY35', discount: 35 },
  { code: 'EARLY20', discount: 20 },
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + nanoid(8);
}

function generateDescription(category: string, name: string, location: any): string {
  const templates = {
    hotel: `Experience luxury and comfort at ${name} in ${location.city}. Our property offers world-class amenities, stunning views, and exceptional service. Whether you're here for business or leisure, we ensure your stay is memorable. Located in the heart of ${location.city}, we provide easy access to all major attractions.`,
    'tour-package': `Discover the beauty of ${location.city} with our ${name}. This carefully curated package includes guided tours, comfortable transportation, and unforgettable experiences. Perfect for families, couples, and solo travelers. Book now and create memories that last a lifetime!`,
    experience: `Get ready for an adventure with ${name} in ${location.city}! This thrilling experience is perfect for adventure seekers and nature lovers. Our experienced guides ensure your safety while you enjoy the excitement. Suitable for all skill levels.`,
    transport: `Reliable and comfortable ${name} service in ${location.city}. Our well-maintained vehicles and professional drivers ensure a smooth journey. Available for airport transfers, city tours, and inter-city travel. Book in advance for best rates.`,
  };
  return templates[category as keyof typeof templates] || templates.hotel;
}

async function main() {
  console.log('🌟 Starting comprehensive data generation...\n');

  try {
    // Step 1: Create sellers
    console.log('👥 Creating sellers...');
    const createdSellers = [];

    for (let i = 0; i < 20; i++) {
      const company = SELLER_COMPANIES[i];
      // Add unique suffix to avoid duplicate email errors
      const email = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + nanoid(6) + '@example.com';
      const location = randomElement(DESTINATIONS);

      const sellerId = nanoid();
      await db.insert(seller).values({
        id: sellerId,
        email,
        businessName: company,
        category: randomElement(['agency', 'hotel', 'tour-operator']),
        registrationNumber: `REG-${nanoid(10).toUpperCase()}`,
        address: {
          street: 'Main Street',
          city: location.city,
          district: location.district,
          postalCode: String(1000 + Math.floor(Math.random() * 9000)),
        },
        contactPhone: `+880 1${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        contactEmail: email,
        businessDescription: `Leading ${randomElement(['travel', 'hospitality', 'tourism'])} provider in ${location.city}`,
        verificationStatus: randomElement(['approved', 'approved', 'approved', 'pending']),
        verifiedAt: Math.random() < 0.75 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
        rating: Math.floor((4 + Math.random()) * 10), // Store as integer (e.g., 45 = 4.5 stars)
        reviewCount: Math.floor(Math.random() * 200) + 50,
        totalBookings: Math.floor(Math.random() * 500) + 100,
        totalRevenue: Math.floor(Math.random() * 10000000) + 1000000,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      });

      createdSellers.push(sellerId);
      console.log(`  ✓ Created: ${company}`);
    }

    console.log(`\n✅ Created ${createdSellers.length} sellers\n`);

    // Step 2: Generate listings
    console.log('📦 Generating 100 listings...');
    const categories = Object.values(LISTING_CATEGORIES);
    const createdListings = [];

    for (let i = 0; i < 100; i++) {
      const category = randomElement(categories);
      const location = randomElement(DESTINATIONS);
      const sellerId = randomElement(createdSellers);

      let title;
      switch (category) {
        case 'hotel':
          title = `${randomElement(HOTEL_NAMES)} - ${location.city}`;
          break;
        case 'tour-package':
          title = `${randomElement(TOUR_NAMES)} - ${location.city}`;
          break;
        case 'experience':
          title = `${randomElement(EXPERIENCE_NAMES)} - ${location.city}`;
          break;
        case 'transport':
          title = `${randomElement(TRANSPORT_NAMES)} - ${location.city}`;
          break;
      }

      const basePrice = Math.floor(Math.random() * 15000) + 1500;
      const capacity = Math.floor(Math.random() * 40) + 10;
      const maxGuests = Math.floor(capacity * 0.8);
      const minGuests = category === 'tour-package' ? 2 : 1;

      const listingId = nanoid();

      // Determine promotional status (40% get promotions)
      const hasPromotion = Math.random() < 0.4;
      const promotionType = hasPromotion ? randomElement(['flash', 'promo', 'discount', 'none']) : 'none';

      let isFlashDeal = false;
      let flashDealEndsAt = null;
      let discountPercent = null;
      let discountedPrice = null;
      let promoCode = null;
      let promoCodeDiscount = null;
      let promoCodeMaxUses = null;
      let promoCodeUsedCount = 0;
      let promoCodeExpiresAt = null;

      if (promotionType === 'flash') {
        isFlashDeal = true;
        discountPercent = 30 + Math.floor(Math.random() * 30); // 30-60% off
        discountedPrice = (basePrice * (1 - discountPercent / 100)).toFixed(2);
        flashDealEndsAt = new Date(Date.now() + (1 + Math.random() * 6) * 24 * 60 * 60 * 1000); // 1-7 days
      } else if (promotionType === 'promo') {
        const promo = randomElement(PROMO_CODES);
        promoCode = promo.code;
        promoCodeDiscount = promo.discount;
        promoCodeMaxUses = 50 + Math.floor(Math.random() * 150);
        promoCodeUsedCount = Math.floor(Math.random() * 20);
        promoCodeExpiresAt = new Date(Date.now() + (7 + Math.random() * 23) * 24 * 60 * 60 * 1000); // 7-30 days
      } else if (promotionType === 'discount') {
        discountPercent = 10 + Math.floor(Math.random() * 20); // 10-30% off
        discountedPrice = (basePrice * (1 - discountPercent / 100)).toFixed(2);
      }

      await db.insert(listing).values({
        id: listingId,
        sellerId,
        title,
        slug: generateSlug(title),
        description: generateDescription(category, title, location),
        category,
        location: {
          city: location.city,
          district: location.district,
          address: `Main Road, ${location.city}`,
          landmark: `Near ${location.city} Center`,
          coordinates: {
            lat: 23.8103 + (Math.random() - 0.5) * 2,
            lng: 90.4125 + (Math.random() - 0.5) * 2,
          },
        },
        basePrice: basePrice.toString(),
        currency: 'BDT',
        priceUnit: category === 'hotel' ? 'per-night' : category === 'transport' ? 'per-booking' : 'per-person',
        capacity,
        minGuests,
        maxGuests,
        groupEligible: Math.random() < 0.6, // 60% eligible for groups
        groupPricingTiers: [
          { minParticipants: 5, maxParticipants: 10, discountPercentage: 10, pricePerPerson: basePrice * 0.9 },
          { minParticipants: 11, maxParticipants: 20, discountPercentage: 20, pricePerPerson: basePrice * 0.8 },
          { minParticipants: 21, maxParticipants: 50, discountPercentage: 30, pricePerPerson: basePrice * 0.7 },
        ],
        amenities: randomElements(AMENITIES, 5 + Math.floor(Math.random() * 8)),
        inclusions: [
          'Professional Guide',
          'All Entry Fees',
          'Comfortable Transportation',
          'Refreshments',
          'Safety Equipment',
        ],
        exclusions: [
          'Personal Expenses',
          'Tips & Gratuities',
          'Travel Insurance',
        ],
        cancellationPolicy: randomElement(['flexible', 'moderate', 'strict']),
        houseRules: 'No smoking. Respect local customs. Follow guide instructions.',
        checkInTime: category === 'hotel' ? '14:00' : null,
        checkOutTime: category === 'hotel' ? '11:00' : null,
        images: [
          {
            url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
            storageKey: `listing-${listingId}-1.jpg`,
            isPrimary: true,
          },
          {
            url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
            storageKey: `listing-${listingId}-2.jpg`,
            isPrimary: false,
          },
        ],
        status: LISTING_STATUSES.ACTIVE,
        viewCount: Math.floor(Math.random() * 500),
        bookingCount: Math.floor(Math.random() * 100),
        rating: (4 + Math.random() * 1).toFixed(2),
        reviewCount: Math.floor(Math.random() * 50),
        isFeatured: Math.random() < 0.2, // 20% featured
        isTrending: Math.random() < 0.15, // 15% trending
        isFlashDeal,
        flashDealEndsAt,
        discountPercent,
        discountedPrice,
        promoCode,
        promoCodeDiscount,
        promoCodeMaxUses,
        promoCodeUsedCount,
        promoCodeExpiresAt,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Last 6 months
        publishedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      });

      createdListings.push({ id: listingId, title, category });

      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ Created ${i + 1}/100 listings...`);
      }
    }

    console.log(`\n✅ Created ${createdListings.length} listings\n`);

    // Step 3: Generate reviews (SKIPPED - reviews require bookings due to NOT NULL constraint)
    console.log('⭐ Skipping reviews (require bookings first)...');
    const reviewCount = 0;

    // NOTE: To add reviews, we need to:
    // 1. Create bookings first (with proper booking IDs)
    // 2. Then create reviews linked to those bookings
    // This maintains data integrity per the schema requirements.

    console.log(`✅ Reviews skipped (can be added later)\n`);

    // Summary
    console.log('🎉 DATA GENERATION COMPLETE!\n');
    console.log('📊 SUMMARY:');
    console.log(`  👥 Sellers: ${createdSellers.length}`);
    console.log(`  📦 Listings: ${createdListings.length}`);
    console.log(`  ⭐ Reviews: ${reviewCount}`);

    const promotionStats = {
      flashDeals: createdListings.length, // Will be calculated from DB
      promoCodes: createdListings.length,
      discounts: createdListings.length,
    };

    const flashDeals = await db.select().from(listing).where(and(
      eq(listing.isFlashDeal, true),
      sql`${listing.flashDealEndsAt} > NOW()`
    ));
    const promoCodeListings = await db.select().from(listing).where(sql`${listing.promoCode} IS NOT NULL`);
    const discountListings = await db.select().from(listing).where(and(
      sql`${listing.discountPercent} IS NOT NULL`,
      eq(listing.isFlashDeal, false)
    ));

    console.log(`\n  ⚡ Flash Deals: ${flashDeals.length}`);
    console.log(`  🏷️  Promo Codes: ${promoCodeListings.length}`);
    console.log(`  💰 Regular Discounts: ${discountListings.length}`);

    console.log('\n✨ All data inserted successfully!');
    console.log('🌐 Visit your homepage to see the new listings!');

  } catch (error) {
    console.error('❌ Error during data generation:', error);
    throw error;
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
