import { db } from '../../../../packages/db/src/index.js';
import { listing } from '../../../../packages/db/src/schema/marketplace.js';
import { seller } from '../../../../packages/db/src/schema/seller.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Create a test listing for Shadman Travel Agency
const sellerEmail = 'shadmanyaser959@gmail.com';

console.log(`Creating test listing for ${sellerEmail}...`);

// Find the seller
const sellerRecord = await db.query.seller.findFirst({
  where: eq(seller.email, sellerEmail),
});

if (!sellerRecord) {
  console.error('Seller not found!');
  process.exit(1);
}

console.log(`Found seller: ${sellerRecord.businessName}`);

// Create a complete listing
const listingId = `listing_${nanoid()}`;
const newListing = await db.insert(listing).values({
  id: listingId,
  sellerId: sellerRecord.id,
  title: 'Cox\'s Bazar Beach Resort - 3 Days 2 Nights Package',
  slug: 'coxs-bazar-beach-resort-3-days-2-nights-package',
  description: 'Experience the world\'s longest natural sea beach with our exclusive package. Includes accommodation in a 4-star beach resort, daily breakfast, guided beach tours, and visit to Himchari National Park. Perfect for families and couples looking for a relaxing beach getaway.',
  category: 'tour-package',
  location: {
    city: 'Cox\'s Bazar',
    district: 'Cox\'s Bazar',
    address: 'Beach Road, Kolatoli, Cox\'s Bazar 4700',
    landmark: 'Near Sugandha Beach Point',
    coordinates: { lat: 21.4272, lng: 92.0058 }
  },
  basePrice: 8500,
  priceUnit: 'per-person',
  capacity: 20,
  minGuests: 2,
  maxGuests: 6,
  groupEligible: true,
  groupPricingTiers: [
    {
      minParticipants: 2,
      maxParticipants: 3,
      discountPercentage: 0,
      pricePerPerson: 8500
    },
    {
      minParticipants: 4,
      maxParticipants: 6,
      discountPercentage: 10,
      pricePerPerson: 7650
    }
  ],
  images: [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
  ],
  amenities: ['WiFi', 'AC', 'Swimming Pool', 'Restaurant', 'Beach Access'],
  inclusions: [
    '2 nights accommodation in beach-view room',
    'Daily breakfast',
    'Guided beach tour',
    'Visit to Himchari National Park',
    'Airport pickup and drop'
  ],
  exclusions: [
    'Lunch and dinner',
    'Personal expenses',
    'Travel insurance'
  ],
  cancellationPolicy: 'moderate',
  houseRules: 'No smoking in rooms. Check-in after 2 PM, Check-out before 12 PM.',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  status: 'pending-review',
  isActive: true,
  isFeatured: false,
  isTrending: false,
  viewCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}).returning();

console.log('✅ Listing created successfully!');
console.log(`Listing ID: ${newListing[0].id}`);
console.log(`Title: ${newListing[0].title}`);
console.log(`Status: ${newListing[0].status}`);
console.log(`Price: ৳${newListing[0].basePrice}`);

process.exit(0);
