import { db, booking, and, eq, sql } from '@DeshGhuri/db';

interface ListingWithCapacity {
  id: string;
  capacity: number;
}

export interface ListingInventoryState {
  bookedPackages: number;
  availablePackages: number;
  isBookingClosed: boolean;
}

/**
 * A package unit is considered reserved when:
 * - booking is confirmed/completed/disputed, or
 * - booking is on hold and either payment was submitted or hold is still active.
 */
export function getInventoryReservationCondition(now = new Date()) {
  return sql`(
    (
      ${booking.status} = 'hold'
      AND (
        ${booking.paymentMethod} IS NOT NULL
        OR ${booking.holdExpiresAt} IS NULL
        OR ${booking.holdExpiresAt} >= ${now}
      )
    )
    OR ${booking.status} IN ('confirmed', 'completed', 'disputed')
  )`;
}

export function getListingInventoryState(
  capacity: number,
  bookedPackages: number
): ListingInventoryState {
  const normalizedCapacity = Math.max(capacity || 0, 0);
  const normalizedBooked = Math.max(bookedPackages || 0, 0);
  const availablePackages = Math.max(normalizedCapacity - normalizedBooked, 0);

  return {
    bookedPackages: normalizedBooked,
    availablePackages,
    isBookingClosed: availablePackages === 0,
  };
}

export async function getReservedPackageCountForListing(
  listingId: string,
  options?: { now?: Date; excludeBookingId?: string }
): Promise<number> {
  const now = options?.now ?? new Date();
  const conditions = [eq(booking.listingId, listingId), getInventoryReservationCondition(now)];

  if (options?.excludeBookingId) {
    conditions.push(sql`${booking.id} <> ${options.excludeBookingId}`);
  }

  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(booking)
    .where(and(...conditions));

  return Number(result?.count || 0);
}

export async function getReservedPackageCountsForListings(
  listingIds: string[],
  now = new Date()
): Promise<Map<string, number>> {
  if (listingIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      listingId: booking.listingId,
      count: sql<number>`count(*)`,
    })
    .from(booking)
    .where(
      and(
        sql`${booking.listingId} IN (${sql.join(
          listingIds.map((listingId) => sql`${listingId}`),
          sql`, `
        )})`,
        getInventoryReservationCondition(now)
      )
    )
    .groupBy(booking.listingId);

  return new Map(rows.map((row) => [row.listingId, Number(row.count || 0)]));
}

export function addInventoryToListing<T extends ListingWithCapacity>(
  listingData: T,
  bookedPackages: number
): T & ListingInventoryState {
  return {
    ...listingData,
    ...getListingInventoryState(listingData.capacity, bookedPackages),
  };
}

export function addInventoryToListings<T extends ListingWithCapacity>(
  listings: T[],
  bookedCounts: Map<string, number>
): Array<T & ListingInventoryState> {
  return listings.map((item) => addInventoryToListing(item, bookedCounts.get(item.id) || 0));
}
