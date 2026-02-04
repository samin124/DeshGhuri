import { createRoute, z } from '@hono/zod-openapi';

// ============================================
// SCHEMAS (converted from existing Zod schemas)
// ============================================

const AddressSchema = z.object({
  street: z.string().min(1).openapi({ example: '123 Main St, Gulshan' }),
  city: z.string().min(1).openapi({ example: 'Dhaka' }),
  district: z.string().min(1).openapi({ example: 'Dhaka' }),
  postalCode: z.string().optional().openapi({ example: '1212' }),
}).openapi('Address');

const BusinessInfoSchema = z.object({
  businessName: z.string().min(1).openapi({
    example: 'Dhaka Tours & Travels',
    description: 'Name of the business or agency'
  }),
  category: z.enum(['agency', 'hotel', 'tour-operator']).openapi({
    example: 'agency',
    description: 'Type of business: travel agency, hotel, or tour operator'
  }),
  registrationNumber: z.string().min(1).openapi({
    example: 'REG-2024-001',
    description: 'Business registration or trade license number'
  }),
  address: AddressSchema,
  contactPhone: z.string().min(1).openapi({
    example: '+880-1712-345678',
    description: 'Business contact phone number'
  }),
  contactEmail: z.string().email().openapi({
    example: 'info@dhakatours.com',
    description: 'Business contact email address'
  }),
  businessDescription: z.string().optional().openapi({
    example: 'Leading tour operator specializing in cultural and heritage tours across Bangladesh',
    description: 'Brief description of the business'
  }),
}).openapi('BusinessInfo');

const BankAccountSchema = z.object({
  bankName: z.string().min(1).openapi({
    example: 'Dutch-Bangla Bank',
    description: 'Name of the bank'
  }),
  branchName: z.string().min(1).openapi({
    example: 'Gulshan Branch',
    description: 'Bank branch name'
  }),
  accountHolderName: z.string().min(1).openapi({
    example: 'Dhaka Tours & Travels',
    description: 'Account holder name (usually business name)'
  }),
  accountNumber: z.string().min(1).openapi({
    example: '1234567890123',
    description: 'Bank account number'
  }),
  routingNumber: z.string().optional().openapi({
    example: '090270101',
    description: 'Bank routing number (9 digits)'
  }),
  accountType: z.enum(['savings', 'current']).openapi({
    example: 'current',
    description: 'Type of bank account'
  }),
}).openapi('BankAccount');

const SellerSchema = z.object({
  id: z.string().openapi({
    example: 'sel_1738367890_abc123',
    description: 'Unique seller ID'
  }),
  userId: z.string().openapi({
    example: 'user_1738367890_xyz456',
    description: 'Associated user ID from auth system'
  }),
  businessName: z.string(),
  category: z.enum(['agency', 'hotel', 'tour-operator']),
  registrationNumber: z.string(),
  address: AddressSchema,
  contactPhone: z.string(),
  contactEmail: z.string().email(),
  businessDescription: z.string().nullable(),
  verificationStatus: z.enum(['pending', 'in-review', 'approved', 'rejected', 'incomplete']).openapi({
    description: 'Current verification status of the seller'
  }),
  verifiedAt: z.string().datetime().nullable().openapi({
    description: 'Timestamp when seller was verified (ISO 8601)'
  }),
  rating: z.number().nullable().openapi({
    description: 'Average rating (0-5)',
    example: 4.5
  }),
  reviewCount: z.number().openapi({
    description: 'Total number of reviews',
    example: 127
  }),
  totalBookings: z.number().openapi({
    description: 'Total number of bookings completed',
    example: 450
  }),
  totalRevenue: z.number().openapi({
    description: 'Total revenue in BDT',
    example: 2500000
  }),
  createdAt: z.string().datetime().openapi({
    description: 'Account creation timestamp (ISO 8601)'
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'Last update timestamp (ISO 8601)'
  }),
}).openapi('Seller');

const DocumentSchema = z.object({
  id: z.string().openapi({
    example: 'doc_1738367890_def789',
    description: 'Unique document ID'
  }),
  sellerId: z.string().openapi({
    description: 'Associated seller ID'
  }),
  documentType: z.enum([
    'trade-license',
    'nid',
    'passport',
    'tin-certificate',
    'property-docs',
    'tour-license'
  ]).openapi({
    description: 'Type of uploaded document',
    example: 'trade-license'
  }),
  fileName: z.string().openapi({
    example: 'trade_license.pdf',
    description: 'Original filename'
  }),
  fileUrl: z.string().url().openapi({
    example: 'http://127.0.0.1:54321/storage/v1/object/sign/seller-documents/sel_abc/doc.pdf?token=xyz&exp=1738746000',
    description: 'Signed URL to access the document from Supabase Storage'
  }),
  fileSize: z.number().openapi({
    example: 1048576,
    description: 'File size in bytes'
  }),
  storageKey: z.string().openapi({
    description: 'Supabase Storage key for file management (e.g., sellerId/documentType_timestamp.ext)'
  }),
  status: z.enum(['pending', 'approved', 'rejected']).openapi({
    description: 'Document verification status',
    example: 'pending'
  }),
  rejectionReason: z.string().nullable().openapi({
    description: 'Reason for rejection if status is rejected',
    example: 'Document is not clear, please reupload'
  }),
  uploadedAt: z.string().datetime().openapi({
    description: 'Upload timestamp (ISO 8601)'
  }),
  reviewedAt: z.string().datetime().nullable().openapi({
    description: 'Review timestamp (ISO 8601)'
  }),
  reviewedBy: z.string().nullable().openapi({
    description: 'User ID of admin who reviewed the document'
  }),
}).openapi('Document');

const TimelineEventSchema = z.object({
  id: z.string().openapi({
    example: 'timeline_1738367890_ghi012',
    description: 'Unique timeline event ID'
  }),
  sellerId: z.string(),
  status: z.enum(['pending', 'in-review', 'approved', 'rejected', 'incomplete']),
  message: z.string().openapi({
    example: 'Application submitted successfully',
    description: 'Timeline event message'
  }),
  performedBy: z.string().nullable().openapi({
    description: 'User ID of admin who performed the action (null for system events)'
  }),
  createdAt: z.string().datetime().openapi({
    description: 'Event timestamp (ISO 8601)'
  }),
}).openapi('TimelineEvent');

const ErrorSchema = z.object({
  error: z.string().openapi({
    example: 'Validation error',
    description: 'Error message'
  }),
  details: z.any().optional().openapi({
    description: 'Additional error details (validation issues, stack trace in dev, etc.)'
  }),
}).openapi('Error');

// ============================================
// ROUTES
// ============================================

export const registerSellerRoute = createRoute({
  method: 'post',
  path: '/api/seller/register',
  tags: ['Seller Registration'],
  summary: 'Register a new seller',
  description: 'Creates an initial seller record for a user. This is the first step in the seller onboarding process. Returns an error if a seller account already exists for the given user ID.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            userId: z.string().min(1).openapi({
              example: 'user_1738367890_xyz456',
              description: 'User ID from the authentication system. Must be a valid authenticated user.'
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Seller registered successfully. A new seller account has been created with pending status.',
      content: {
        'application/json': {
          schema: z.object({
            sellerId: z.string().openapi({
              example: 'sel_1738367890_abc123',
              description: 'Newly created seller ID. Use this ID for subsequent operations.'
            }),
          }),
        },
      },
    },
    400: {
      description: 'Bad request. Either user ID is missing or a seller account already exists for this user.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Internal server error. Failed to create seller account.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getSellerByUserRoute = createRoute({
  method: 'get',
  path: '/api/seller/by-user/{userId}',
  tags: ['Seller Information'],
  summary: 'Get seller by user ID',
  description: 'Retrieves seller information associated with a given user ID. Returns null in the seller field if no seller account exists for this user.',
  request: {
    params: z.object({
      userId: z.string().min(1).openapi({
        param: {
          name: 'userId',
          in: 'path',
        },
        example: 'user_1738367890_xyz456',
        description: 'User ID to search for'
      }),
    }),
  },
  responses: {
    200: {
      description: 'Request successful. Returns seller data if exists, or null if no seller account found.',
      content: {
        'application/json': {
          schema: z.object({
            seller: SellerSchema.nullable().openapi({
              description: 'Seller information or null if not found'
            }),
          }),
        },
      },
    },
    500: {
      description: 'Internal server error. Failed to retrieve seller information.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const completeOnboardingRoute = createRoute({
  method: 'post',
  path: '/api/seller/onboarding/complete',
  tags: ['Seller Onboarding'],
  summary: 'Complete seller onboarding',
  description: 'Submits complete seller information including business details and bank account. This is the final step in the seller onboarding process. Updates the seller verification status to pending and creates a bank account record and timeline event.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            sellerId: z.string().min(1).openapi({
              example: 'sel_1738367890_abc123',
              description: 'Seller ID obtained from registration endpoint'
            }),
            businessInfo: BusinessInfoSchema,
            bankAccount: BankAccountSchema,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Onboarding completed successfully. Seller information has been saved and verification process has started.',
      content: {
        'application/json': {
          schema: z.object({
            sellerId: z.string().openapi({
              description: 'Seller ID'
            }),
            status: z.literal('pending').openapi({
              description: 'Verification status after onboarding completion'
            }),
            message: z.string().openapi({
              example: 'Onboarding completed successfully',
              description: 'Success message'
            }),
          }),
        },
      },
    },
    400: {
      description: 'Validation error. One or more fields are invalid or missing.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Internal server error. Failed to complete onboarding.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getVerificationStatusRoute = createRoute({
  method: 'get',
  path: '/api/seller/verification-status/{sellerId}',
  tags: ['Seller Verification'],
  summary: 'Get verification status',
  description: 'Retrieves complete verification status for a seller including seller information, uploaded documents, verification timeline events, and bank account details. This endpoint provides a comprehensive view of the seller\'s verification progress.',
  request: {
    params: z.object({
      sellerId: z.string().min(1).openapi({
        param: {
          name: 'sellerId',
          in: 'path',
        },
        example: 'sel_1738367890_abc123',
        description: 'Seller ID to get verification status for'
      }),
    }),
  },
  responses: {
    200: {
      description: 'Verification status retrieved successfully.',
      content: {
        'application/json': {
          schema: z.object({
            seller: SellerSchema.openapi({
              description: 'Complete seller information'
            }),
            documents: z.array(DocumentSchema).openapi({
              description: 'List of uploaded documents ordered by upload date (newest first)'
            }),
            timeline: z.array(TimelineEventSchema).openapi({
              description: 'Verification timeline events ordered by date (newest first)'
            }),
            bankAccount: BankAccountSchema.nullable().openapi({
              description: 'Bank account information or null if not provided yet'
            }),
          }),
        },
      },
    },
    404: {
      description: 'Seller not found. The specified seller ID does not exist.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Internal server error. Failed to retrieve verification status.',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

