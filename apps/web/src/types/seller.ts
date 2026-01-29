export type SellerCategory = 'agency' | 'hotel' | 'tour-operator';

export type VerificationStatus = 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete';

export type DocumentType =
  | 'trade-license'
  | 'nid'
  | 'passport'
  | 'tin-certificate'
  | 'bank-statement'
  | 'property-docs'
  | 'tour-license';

export interface SellerDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface BankAccount {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  branchName: string;
  accountType: 'savings' | 'current';
}

export interface BusinessInfo {
  businessName: string;
  category: SellerCategory;
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
}

export interface SellerProfile {
  id: string;
  userId: string;
  businessInfo: BusinessInfo;
  documents: SellerDocument[];
  bankAccount?: BankAccount;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
  totalBookings?: number;
  totalRevenue?: number;
}

export interface VerificationTimeline {
  id: string;
  status: VerificationStatus;
  message: string;
  timestamp: string;
  performedBy?: string;
}

export interface OnboardingFormData {
  step: number;
  businessInfo: Partial<BusinessInfo>;
  documents: {
    tradeLicense?: File;
    nidOrPassport?: File;
    tinCertificate?: File;
    propertyDocs?: File;
    tourLicense?: File;
  };
  bankAccount: Partial<BankAccount>;
}
