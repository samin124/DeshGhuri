import { http, HttpResponse, delay } from 'msw';
import { mockSeller, mockDocuments, mockBankAccount, mockTimeline } from '../data/seller-data';

const API_BASE_URL = 'http://localhost:3000';

export const sellerHandlers = [
  // POST /api/seller/register
  http.post(`${API_BASE_URL}/api/seller/register`, async ({ request }) => {
    await delay(500); // Simulate network delay

    const body = await request.json() as { userId: string };

    if (!body.userId) {
      return HttpResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      { sellerId: mockSeller.id },
      { status: 201 }
    );
  }),

  // GET /api/seller/by-user/:userId
  http.get(`${API_BASE_URL}/api/seller/by-user/:userId`, async ({ params }) => {
    await delay(300);

    const { userId } = params;

    // Simulate seller not found for certain userIds
    if (userId === 'nonexistent') {
      return HttpResponse.json({ seller: null }, { status: 200 });
    }

    return HttpResponse.json(
      { seller: mockSeller },
      { status: 200 }
    );
  }),

  // POST /api/seller/onboarding/complete
  http.post(`${API_BASE_URL}/api/seller/onboarding/complete`, async ({ request }) => {
    await delay(800);

    const body = await request.json() as any;

    if (!body.sellerId || !body.businessInfo || !body.bankAccount) {
      return HttpResponse.json(
        { error: 'Validation error', details: 'Missing required fields' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        sellerId: body.sellerId,
        status: 'pending',
        message: 'Onboarding completed successfully',
      },
      { status: 200 }
    );
  }),

  // GET /api/seller/verification-status/:sellerId
  http.get(`${API_BASE_URL}/api/seller/verification-status/:sellerId`, async ({ params }) => {
    await delay(400);

    const { sellerId } = params;

    if (sellerId !== mockSeller.id) {
      return HttpResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        seller: mockSeller,
        documents: mockDocuments,
        timeline: mockTimeline,
        bankAccount: mockBankAccount,
      },
      { status: 200 }
    );
  }),

  // POST /api/seller/documents/upload
  http.post(`${API_BASE_URL}/api/seller/documents/upload`, async ({ request }) => {
    await delay(1000); // Longer delay for file upload simulation

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sellerId = formData.get('sellerId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !sellerId || !documentType) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate file size validation
    if (file.size > 25 * 1024 * 1024) {
      return HttpResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    const mockDocument = {
      documentId: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      url: `https://via.placeholder.com/400x300/6366f1/ffffff?text=${documentType}`,
      fileName: file.name,
      fileSize: file.size,
    };

    return HttpResponse.json(mockDocument, { status: 201 });
  }),

  // PATCH /api/seller/documents/:documentId
  http.patch(`${API_BASE_URL}/api/seller/documents/:documentId`, async ({ request, params }) => {
    await delay(1000);

    const { documentId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return HttpResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        documentId,
        url: `https://via.placeholder.com/400x300/6366f1/ffffff?text=Updated`,
        status: 'pending',
      },
      { status: 200 }
    );
  }),

  // GET /api/seller/test-cloudinary
  http.get(`${API_BASE_URL}/api/seller/test-cloudinary`, async () => {
    await delay(200);

    return HttpResponse.json(
      {
        configured: true,
        message: 'Cloudinary is configured and ready (mocked)',
      },
      { status: 200 }
    );
  }),
];
