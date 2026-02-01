export const mockSeller = {
  id: 'sel_1234567890_abc123',
  userId: 'user_1234567890_xyz456',
  businessName: 'Dhaka Tours & Travels',
  category: 'agency' as const,
  registrationNumber: 'REG-2024-001',
  address: {
    street: '123 Gulshan Avenue',
    city: 'Dhaka',
    district: 'Dhaka',
    postalCode: '1212',
  },
  contactPhone: '+880-1712-345678',
  contactEmail: 'info@dhakatours.com',
  businessDescription: 'Leading tour operator specializing in cultural and heritage tours',
  verificationStatus: 'pending' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  verifiedAt: null,
  rating: null,
  reviewCount: 0,
  totalBookings: 0,
  totalRevenue: 0,
};

export const mockDocuments = [
  {
    id: 'doc_1234567890_def789',
    sellerId: 'sel_1234567890_abc123',
    documentType: 'trade-license',
    fileName: 'trade_license.pdf',
    fileUrl: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Trade+License',
    fileSize: 1048576,
    cloudinaryPublicId: 'seller-documents/doc_1234567890',
    status: 'pending' as const,
    rejectionReason: null,
    uploadedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  },
];

export const mockBankAccount = {
  bankName: 'Dutch-Bangla Bank',
  branchName: 'Gulshan Branch',
  accountHolderName: 'Dhaka Tours & Travels',
  accountNumber: '1234567890123',
  routingNumber: '090270101',
  accountType: 'current' as const,
};

export const mockTimeline = [
  {
    id: 'timeline_1234567890_ghi012',
    sellerId: 'sel_1234567890_abc123',
    status: 'pending' as const,
    message: 'Application submitted successfully',
    performedBy: null,
    createdAt: new Date().toISOString(),
  },
];
