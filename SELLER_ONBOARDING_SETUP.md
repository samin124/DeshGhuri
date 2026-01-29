# Seller Onboarding Setup Guide

## Quick Start

### Access the Seller Pages

1. **Seller Registration Page**
   - URL: `http://localhost:3001/seller/register`
   - Description: Landing page for potential sellers with category selection

2. **Seller Onboarding Form**
   - URL: `http://localhost:3001/seller/onboarding`
   - With category: `http://localhost:3001/seller/onboarding?category=agency`
   - Description: Multi-step onboarding wizard

3. **Verification Status Page**
   - URL: `http://localhost:3001/seller/verification-status`
   - Description: Track verification progress and document status

### Navigation

The seller registration is accessible from:
- **Navbar**: "Become a Seller" button (desktop) / menu item (mobile)
- **Footer**: "For Sellers" section → "Become a Seller" link

## Testing the Flow

### Complete Onboarding Flow

1. Start at homepage: `http://localhost:3001`
2. Click "Become a Seller" in navbar or footer
3. Choose business category (Agency, Hotel, or Tour Operator)
4. Complete 4-step onboarding:
   - **Step 1**: Fill business information
   - **Step 2**: Upload documents (simulated)
   - **Step 3**: Add bank account details
   - **Step 4**: Review and submit
5. After submission, you'll be redirected to verification status page

### Test Different Categories

Each category has different document requirements:

- **Travel Agency**: Trade License, NID/Passport, TIN (optional)
- **Hotel/Resort**: Trade License, NID/Passport, TIN (optional), Property Docs (required)
- **Tour Operator**: Trade License, NID/Passport, TIN (optional), Tour License (required)

## Features to Test

### Responsive Design

Test on different screen sizes:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

Check:
- [ ] Form layouts adapt properly
- [ ] Navigation is usable
- [ ] Buttons are touch-friendly
- [ ] Cards stack correctly
- [ ] Progress indicator is visible

### Dark Mode

Toggle dark mode using the theme toggle in navbar:
- [ ] All pages render correctly
- [ ] Text is readable
- [ ] Colors are appropriate
- [ ] Badges and status indicators work
- [ ] Form inputs are styled correctly

### Form Validation

Test validation on Step 1:
- [ ] Empty required fields show errors
- [ ] Email format validation works
- [ ] Phone number validation works

Test file upload on Step 2:
- [ ] Drag and drop works
- [ ] File picker works
- [ ] File size validation (try >25MB file)
- [ ] File type validation (try .txt or .exe)
- [ ] File preview shows for images
- [ ] Remove file works

### Navigation

Test multi-step form:
- [ ] Next button advances step
- [ ] Previous button goes back
- [ ] Progress indicator updates
- [ ] Form data persists across steps
- [ ] Can edit previous steps

## Backend Integration Checklist

When you're ready to connect to backend:

### API Endpoints to Create

```typescript
// Seller Registration
POST /api/seller/register
Body: {
  businessInfo: BusinessInfo,
  userId: string
}
Response: { sellerId: string }

// Document Upload
POST /api/seller/documents/upload
Body: FormData with file
Response: { documentId: string, url: string }

// Complete Onboarding
POST /api/seller/onboarding/complete
Body: OnboardingFormData
Response: { sellerId: string, status: 'pending' }

// Get Verification Status
GET /api/seller/verification-status/:sellerId
Response: {
  status: VerificationStatus,
  documents: SellerDocument[],
  timeline: VerificationTimeline[]
}

// Update Document
PATCH /api/seller/documents/:documentId
Body: { file: File }
Response: { documentId: string, status: 'pending' }
```

### Environment Variables

Add to `.env`:
```bash
# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Or AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Notification Email
ADMIN_EMAIL=admin@deshghuri.com
```

### Database Tables

Create tables for:

1. **sellers**
   ```sql
   CREATE TABLE sellers (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     business_name VARCHAR(255),
     category VARCHAR(50),
     registration_number VARCHAR(100),
     address JSONB,
     contact_phone VARCHAR(20),
     contact_email VARCHAR(255),
     business_description TEXT,
     verification_status VARCHAR(20),
     verified_at TIMESTAMP,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

2. **seller_documents**
   ```sql
   CREATE TABLE seller_documents (
     id UUID PRIMARY KEY,
     seller_id UUID REFERENCES sellers(id),
     document_type VARCHAR(50),
     file_name VARCHAR(255),
     file_url TEXT,
     file_size INTEGER,
     status VARCHAR(20),
     rejection_reason TEXT,
     uploaded_at TIMESTAMP,
     reviewed_at TIMESTAMP,
     reviewed_by UUID REFERENCES users(id)
   );
   ```

3. **seller_bank_accounts**
   ```sql
   CREATE TABLE seller_bank_accounts (
     id UUID PRIMARY KEY,
     seller_id UUID REFERENCES sellers(id),
     bank_name VARCHAR(100),
     branch_name VARCHAR(100),
     account_holder_name VARCHAR(255),
     account_number VARCHAR(50),
     routing_number VARCHAR(20),
     account_type VARCHAR(20),
     verified BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

4. **verification_timeline**
   ```sql
   CREATE TABLE verification_timeline (
     id UUID PRIMARY KEY,
     seller_id UUID REFERENCES sellers(id),
     status VARCHAR(20),
     message TEXT,
     performed_by UUID REFERENCES users(id),
     created_at TIMESTAMP
   );
   ```

### File Upload Implementation

Example using Cloudinary:

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadDocument(file: File, documentType: string) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'seller-documents',
    resource_type: 'auto',
    format: file.type.includes('pdf') ? 'pdf' : undefined
  });

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}
```

### Email Notifications

Create email templates for:
- Welcome email on registration
- Verification started notification
- Document approved/rejected
- Verification complete
- Action required (missing documents)

## Common Issues & Solutions

### Issue: Routes not found
**Solution**: Make sure TanStack Router has generated the route tree. Run:
```bash
cd apps/web
bun run dev
```

### Issue: TypeScript errors
**Solution**: Check that all imports are correct and types are properly defined

### Issue: Dark mode not working
**Solution**: Verify ThemeProvider is wrapping the app in `__root.tsx`

### Issue: File upload not working
**Solution**: Currently simulated - needs backend integration for actual upload

### Issue: Form data not persisting
**Solution**: Check useState initialization in onboarding.tsx

## Next Development Steps

1. **Epic 13: Seller Dashboard** (24 SP)
   - Dashboard overview
   - Listings management
   - Bookings management
   - Earnings & payouts
   - Analytics

2. **Epic 14: Admin Panel** (51 SP)
   - Seller verification queue
   - Document review interface
   - Approve/reject workflow
   - Seller management

3. **Integration Work**
   - Connect forms to backend API
   - Implement file upload
   - Add email notifications
   - Set up database

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify environment variables are set
4. Ensure database migrations are run

---

Happy coding! 🚀
