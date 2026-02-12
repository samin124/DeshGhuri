import { OpenAPIHono } from '@hono/zod-openapi';
import {
  db,
  seller,
  sellerDocument,
  sellerBankAccount,
  verificationTimeline,
  eq,
  desc,
} from '@DeshGhuri/db';
import {
  registerSellerRoute,
  getSellerByUserRoute,
  completeOnboardingRoute,
  getVerificationStatusRoute,
} from './seller.openapi';

// Create OpenAPIHono app for documented routes
const app = new OpenAPIHono();

// Generate unique ID helper
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Register seller endpoint
app.openapi(registerSellerRoute, async (c) => {
  try {
    const { userId } = c.req.valid('json');

    const existingSeller = await db.query.seller.findFirst({
      where: eq(seller.userId, userId),
    });

    if (existingSeller) {
      return c.json({ error: 'Seller account already exists for this user' }, 400);
    }

    const sellerId = generateId('sel');

    await db.insert(seller).values({
      id: sellerId,
      userId,
      businessName: 'Pending',
      category: 'agency',
      registrationNumber: 'Pending',
      address: { street: '', city: '', district: '', postalCode: '' },
      contactPhone: '',
      contactEmail: '',
      verificationStatus: 'pending',
    });

    return c.json({ sellerId }, 201);
  } catch (error) {
    console.error('Register seller error:', error);
    return c.json({ error: 'Failed to register seller' }, 500);
  }
});

// Get seller by user ID endpoint
app.openapi(getSellerByUserRoute, async (c) => {
  try {
    const { userId } = c.req.valid('param');

    const sellerData = await db.query.seller.findFirst({
      where: eq(seller.userId, userId),
    });

    return c.json({ seller: sellerData || null }, 200);
  } catch (error) {
    console.error('Get seller by user error:', error);
    return c.json({ error: 'Failed to get seller' }, 500);
  }
});

// Complete onboarding endpoint
app.openapi(completeOnboardingRoute, async (c) => {
  try {
    const { sellerId, businessInfo, bankAccount: bankAccountData } = c.req.valid('json');

    // Update seller record
    await db
      .update(seller)
      .set({
        businessName: businessInfo.businessName,
        category: businessInfo.category,
        registrationNumber: businessInfo.registrationNumber,
        address: businessInfo.address,
        contactPhone: businessInfo.contactPhone,
        contactEmail: businessInfo.contactEmail,
        businessDescription: businessInfo.businessDescription,
        verificationStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(seller.id, sellerId));

    // Insert bank account
    const bankAccountId = generateId('bank');
    await db.insert(sellerBankAccount).values({
      id: bankAccountId,
      sellerId,
      ...bankAccountData,
    });

    // Add timeline event
    const timelineId = generateId('timeline');
    await db.insert(verificationTimeline).values({
      id: timelineId,
      sellerId,
      status: 'pending',
      message: 'Application submitted successfully',
    });

    return c.json(
      {
        sellerId,
        status: 'pending' as const,
        message: 'Onboarding completed successfully',
      },
      200
    );
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return c.json({ error: 'Failed to complete onboarding' }, 500);
  }
});

// Get verification status endpoint
app.openapi(getVerificationStatusRoute, async (c) => {
  try {
    const { sellerId } = c.req.valid('param');

    const sellerData = await db.query.seller.findFirst({
      where: eq(seller.id, sellerId),
    });

    if (!sellerData) {
      return c.json({ error: 'Seller not found' }, 404);
    }

    const documents = await db.query.sellerDocument.findMany({
      where: eq(sellerDocument.sellerId, sellerId),
      orderBy: [desc(sellerDocument.uploadedAt)],
    });

    const timeline = await db.query.verificationTimeline.findMany({
      where: eq(verificationTimeline.sellerId, sellerId),
      orderBy: [desc(verificationTimeline.createdAt)],
    });

    const bankAccount = await db.query.sellerBankAccount.findFirst({
      where: eq(sellerBankAccount.sellerId, sellerId),
    });

    return c.json(
      {
        seller: sellerData,
        documents,
        timeline,
        bankAccount,
      },
      200
    );
  } catch (error) {
    console.error('Get verification status error:', error);
    return c.json({ error: 'Failed to get verification status' }, 500);
  }
});

// Generate OpenAPI documentation
app.doc31('/openapi.json', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'DeshGhuri API',
    description:
      'REST API for DeshGhuri - Bangladesh Tourism & Travel Platform. This API provides endpoints for seller registration, onboarding, verification, and document management.',
    contact: {
      name: 'API Support',
      email: 'support@deshghuri.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Seller Registration',
      description: 'Endpoints for creating seller accounts',
    },
    {
      name: 'Seller Onboarding',
      description: 'Endpoints for completing seller onboarding process',
    },
    {
      name: 'Seller Information',
      description: 'Endpoints for retrieving seller data',
    },
    {
      name: 'Seller Verification',
      description: 'Endpoints for verification status and document management',
    },
    {
      name: 'System Health',
      description: 'Health check and system status endpoints',
    },
  ],
});

export default app;
