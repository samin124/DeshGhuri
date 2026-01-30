import { env } from "@DeshGhuri/env/web";

const API_BASE_URL = `${env.VITE_SERVER_URL}/api`;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

// Register seller
export async function registerSeller(userId: string): Promise<ApiResponse<{ sellerId: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to register seller' };
    }

    return { data };
  } catch (error) {
    console.error('Register seller error:', error);
    return { error: 'Network error. Please check your connection.' };
  }
}

// Upload document
export async function uploadDocument(
  file: File,
  sellerId: string,
  documentType: string
): Promise<ApiResponse<{ documentId: string; url: string; fileName: string; fileSize: number }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sellerId', sellerId);
    formData.append('documentType', documentType);

    const response = await fetch(`${API_BASE_URL}/seller/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.details
        ? `${data.error}: ${data.details}`
        : (data.error || 'Failed to upload document');
      return { error: errorMessage };
    }

    return { data };
  } catch (error) {
    console.error('Upload document error:', error);
    return { error: 'Failed to upload file. Please try again.' };
  }
}

// Complete onboarding
export async function completeOnboarding(data: {
  sellerId: string;
  userId: string;
  businessInfo: any;
  bankAccount: any;
}): Promise<ApiResponse<{ sellerId: string; status: string; message: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { error: responseData.error || 'Failed to complete onboarding', details: responseData.details };
    }

    return { data: responseData };
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

// Get verification status
export async function getVerificationStatus(sellerId: string): Promise<
  ApiResponse<{
    seller: any;
    documents: any[];
    timeline: any[];
    bankAccount: any;
  }>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/verification-status/${sellerId}`);

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get verification status' };
    }

    return { data };
  } catch (error) {
    console.error('Get verification status error:', error);
    return { error: 'Failed to load verification status.' };
  }
}

// Get seller by user ID
export async function getSellerByUserId(userId: string): Promise<ApiResponse<{ seller: any | null }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/by-user/${userId}`);

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get seller' };
    }

    return { data };
  } catch (error) {
    console.error('Get seller by user error:', error);
    return { error: 'Failed to load seller information.' };
  }
}

// Update document
export async function updateDocument(
  documentId: string,
  file: File
): Promise<ApiResponse<{ documentId: string; url: string; status: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/seller/documents/${documentId}`, {
      method: 'PATCH',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update document' };
    }

    return { data };
  } catch (error) {
    console.error('Update document error:', error);
    return { error: 'Failed to update document. Please try again.' };
  }
}
