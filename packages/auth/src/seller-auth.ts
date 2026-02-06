import { db } from "@DeshGhuri/db";
import { seller, sellerPaymentMethod } from "@DeshGhuri/db/schema/seller";
import { user, account, userRole } from "@DeshGhuri/db/schema/auth";
import { eq, and } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { hash, verify } from "@node-rs/argon2";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 16);

function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}

export interface SellerSignupData {
  email: string;
  password: string;
  businessName: string;
  category: string;
  registrationNumber: string;
  address: {
    street: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  contactPhone: string;
  contactEmail: string;
  businessDescription?: string;
  paymentMethods: Array<{
    type: 'bkash' | 'nagad';
    accountNumber: string;
    accountName: string;
  }>;
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber?: string;
    accountType: 'savings' | 'current';
  };
  documents?: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    storageKey?: string;
  }>;
}

export interface SellerSigninData {
  email: string;
  password: string;
}

/**
 * Seller signup - creates both user account and seller profile
 */
export async function sellerSignup(data: SellerSignupData) {
  // Validate at least one payment method
  if (!data.paymentMethods || data.paymentMethods.length === 0) {
    throw new Error('At least one payment method (Bkash or Nagad) is required');
  }

  // Check if seller with this email already exists
  const existingSeller = await db.query.seller.findFirst({
    where: eq(seller.email, data.email),
  });

  if (existingSeller) {
    throw new Error('A seller account with this email already exists');
  }

  // Check if user with this email exists
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, data.email),
  });

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await hash(data.password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Create user account
  const userId = generateId('user');
  await db.insert(user).values({
    id: userId,
    name: data.businessName,
    email: data.email,
    emailVerified: false, // Will need to verify email
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create account record with password
  await db.insert(account).values({
    id: generateId('account'),
    accountId: userId,
    providerId: 'credential',
    userId: userId,
    password: passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Assign ONLY seller role (not customer) to prevent confusion with regular users
  await db.insert(userRole).values({
    id: generateId('role'),
    userId: userId,
    role: 'seller',
    createdAt: new Date(),
    createdBy: null,
  });

  // Create seller profile
  const sellerId = generateId('seller');
  await db.insert(seller).values({
    id: sellerId,
    userId: userId,
    email: data.email,
    businessName: data.businessName,
    category: data.category,
    registrationNumber: data.registrationNumber,
    address: data.address,
    contactPhone: data.contactPhone,
    contactEmail: data.contactEmail,
    businessDescription: data.businessDescription,
    verificationStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Add payment methods
  for (const pm of data.paymentMethods) {
    await db.insert(sellerPaymentMethod).values({
      id: generateId('payment'),
      sellerId: sellerId,
      paymentType: pm.type,
      accountNumber: pm.accountNumber,
      accountName: pm.accountName,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return {
    success: true,
    sellerId,
    userId,
    message: 'Seller account created successfully. Please verify your email.',
  };
}

/**
 * Seller signin - validates credentials and checks approval status
 */
export async function sellerSignin(data: SellerSigninData) {
  // Find seller by email
  const sellerAccount = await db.query.seller.findFirst({
    where: eq(seller.email, data.email),
    with: {
      user: true,
    },
  });

  if (!sellerAccount) {
    throw new Error('Invalid email or password');
  }

  // Check if seller is approved
  if (sellerAccount.verificationStatus !== 'approved') {
    return {
      success: false,
      status: sellerAccount.verificationStatus,
      message: getStatusMessage(sellerAccount.verificationStatus),
    };
  }

  // Get account with password
  const userAccount = await db.query.account.findFirst({
    where: and(
      eq(account.userId, sellerAccount.userId!),
      eq(account.providerId, 'credential')
    ),
  });

  if (!userAccount || !userAccount.password) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const validPassword = await verify(userAccount.password, data.password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  // Check email verification
  if (!sellerAccount.user?.emailVerified) {
    return {
      success: false,
      status: 'email-not-verified',
      message: 'Please verify your email before signing in',
      email: data.email,
    };
  }

  return {
    success: true,
    sellerId: sellerAccount.id,
    userId: sellerAccount.userId,
    email: sellerAccount.email,
    businessName: sellerAccount.businessName,
    message: 'Signin successful',
  };
}

/**
 * Get seller by email
 */
export async function getSellerByEmail(email: string) {
  return await db.query.seller.findFirst({
    where: eq(seller.email, email),
    with: {
      paymentMethods: true,
      bankAccount: true,
    },
  });
}

/**
 * Get status message based on verification status
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Your seller application is under review. We will notify you once it is approved.';
    case 'in-review':
      return 'Your application is currently being reviewed by our team.';
    case 'rejected':
      return 'Your seller application has been rejected. Please contact support for more information.';
    case 'incomplete':
      return 'Your seller application is incomplete. Please complete all required information.';
    default:
      return 'Your application is being processed.';
  }
}
