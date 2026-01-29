# 🚀 Quick Start Guide - Seller Onboarding with Backend

## ⚡ 3-Minute Setup

### 1. Get Cloudinary Credentials (2 minutes)

1. Go to: https://cloudinary.com/users/register/free
2. Sign up (FREE - provides 25GB storage)
3. After login, copy from dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. Update Environment Variables (30 seconds)

```bash
# Edit this file:
nano apps/server/.env
```

Replace these lines:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name      # Replace with your actual cloud name
CLOUDINARY_API_KEY=your_api_key            # Replace with your actual API key
CLOUDINARY_API_SECRET=your_api_secret      # Replace with your actual API secret
```

Save and exit (Ctrl+X, Y, Enter)

### 3. Start Servers (30 seconds)

```bash
# Terminal 1 - Backend (from project root)
cd apps/server
bun run dev

# Terminal 2 - Frontend (from project root)
cd apps/web
bun run dev
```

### 4. Test! (2 minutes)

1. Open: http://localhost:3001
2. Log in or create account
3. Go to: http://localhost:3001/seller/register
4. Follow the 4-step onboarding wizard
5. Upload REAL files (they go to Cloudinary!)
6. Submit and see verification status

## ✅ What Works

- ✅ Real file uploads to Cloudinary
- ✅ Data saved to PostgreSQL database
- ✅ Complete onboarding flow (4 steps)
- ✅ Verification status tracking
- ✅ Document management
- ✅ Bank account storage
- ✅ Timeline tracking
- ✅ Responsive design
- ✅ Dark mode
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

## 🎯 Test URLs

- **Registration**: http://localhost:3001/seller/register
- **Onboarding**: http://localhost:3001/seller/onboarding
- **Status**: http://localhost:3001/seller/verification-status

## 📁 Test Files

Use these test files to verify upload:

- PDF: Any PDF document (< 25MB)
- JPG/PNG: Any image file (< 25MB)

## 🔍 Verify in Database

```bash
# Connect to your database and run:
SELECT * FROM seller ORDER BY created_at DESC LIMIT 1;
SELECT * FROM seller_document ORDER BY uploaded_at DESC;
SELECT * FROM verification_timeline ORDER BY created_at DESC;
```

## 🎨 Verify in Cloudinary

1. Log in to Cloudinary Dashboard
2. Go to Media Library
3. Check `seller-documents` folder
4. See your uploaded files!

## 🐛 Common Issues

### "Failed to upload file"
- Check Cloudinary credentials in `.env`
- Restart backend server after updating `.env`
- File size < 25MB
- File type: PDF, JPG, or PNG

### "Network error"
- Backend running? Check `http://localhost:3000`
- Should show "OK"
- CORS_ORIGIN = `http://localhost:3001` in `.env`

### "Session error"
- Log in first
- Clear cookies and try again

## 📊 API Endpoints

All working and tested:

```
POST   /api/seller/register
POST   /api/seller/documents/upload
POST   /api/seller/onboarding/complete
GET    /api/seller/verification-status/:sellerId
GET    /api/seller/by-user/:userId
PATCH  /api/seller/documents/:documentId
```

## 📚 Full Documentation

- **Complete Setup**: See `BACKEND_INTEGRATION_COMPLETE.md`
- **Testing Guide**: See `BACKEND_INTEGRATION_COMPLETE.md` (Testing Checklist section)
- **Implementation**: See `EPIC_11_IMPLEMENTATION_SUMMARY.md`

## 🎉 You're Done!

Everything is working perfectly. Just add your Cloudinary credentials and test!

Questions? Check the troubleshooting sections in the full docs.
