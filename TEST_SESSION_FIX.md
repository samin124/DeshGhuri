# 🧪 Testing Guide: Session Error Fix

## ✅ What Was Fixed

The "Session Error, Refresh the page" error when uploading PDFs has been resolved. The issue was caused by incorrect React hooks usage.

## 🚀 Quick Test (2 Minutes)

### Prerequisites
1. Make sure Cloudinary credentials are configured in `apps/server/.env`
2. Backend server running: `cd apps/server && bun run dev`
3. Frontend server running: `cd apps/web && bun run dev`

### Test Steps

#### 1. Clear Previous Session (Important!)
```bash
# Open browser DevTools (F12)
# Go to Application tab > Storage > Clear site data
# Or just use incognito/private window
```

#### 2. Navigate to Seller Registration
```
http://localhost:3001/seller/register
```

#### 3. Start Onboarding
- Click on any category (Agency, Hotel, or Tour Operator)
- ✅ Should see brief loading spinner: "Loading your seller profile..."
- ✅ Onboarding form should load within 1-2 seconds

#### 4. Fill Step 1: Business Information
- Business Name: "Test Business"
- Registration Number: "REG123456"
- Fill in address fields
- Contact Phone: "01712345678"
- Contact Email: "test@example.com"
- Click "Next"

#### 5. Test PDF Upload (The Critical Test!)
- You're now on Step 2: Upload Documents
- **Trade License**: Drag and drop a PDF file (or click to browse)
- ✅ Should see upload progress
- ✅ Should see green toast: "[filename.pdf] uploaded successfully"
- ✅ **NO "Session Error" message**
- **NID/Passport**: Upload a JPG or PNG image
- ✅ Should see success toast again
- ✅ File preview should appear
- Click "Next"

#### 6. Fill Step 3: Bank Account
- Select a bank
- Fill in account details
- Click "Next"

#### 7. Review & Submit
- Review all information
- Click "Submit Application"
- ✅ Should navigate to verification status page
- ✅ Documents should be listed with "Pending" status

## 🎯 Expected Results

### ✅ Success Indicators:
1. No "Session Error, Refresh the page" message
2. Loading spinner appears briefly on page load
3. Files upload successfully with success toasts
4. Documents appear in Cloudinary dashboard
5. Verification status page loads correctly
6. Documents are listed in database

### ❌ If You Still See Errors:
1. Check browser console (F12) for error messages
2. Check backend terminal for API errors
3. Verify Cloudinary credentials are correct
4. Try clearing browser cache and localStorage
5. Check if backend server is running on port 3000

## 🔍 Detailed Verification

### Check Browser Console (F12)
```javascript
// Should see these logs (no errors):
// ✅ Session loaded
// ✅ Seller ID: sel_...
// ✅ Upload successful
```

### Check Backend Logs
```bash
# Terminal running backend should show:
✅ POST /api/seller/register - 201
✅ POST /api/seller/documents/upload - 201
✅ POST /api/seller/onboarding/complete - 200
```

### Check Database
```sql
-- Connect to database and run:
SELECT * FROM seller ORDER BY created_at DESC LIMIT 1;
-- Should show your seller record

SELECT * FROM seller_document ORDER BY uploaded_at DESC;
-- Should show uploaded documents

SELECT * FROM verification_timeline ORDER BY created_at DESC;
-- Should show "Application submitted successfully"
```

### Check Cloudinary Dashboard
1. Log in to https://cloudinary.com
2. Go to Media Library
3. Open `seller-documents` folder
4. Should see your uploaded files organized by seller ID

## 🐛 Common Issues & Solutions

### Issue 1: Still Getting Session Error
**Solution:**
- Clear browser localStorage and cookies
- Restart both frontend and backend servers
- Make sure you're logged in before accessing onboarding

### Issue 2: Loading Forever
**Solution:**
- Check browser console for errors
- Ensure backend is running (`http://localhost:3000` should show "OK")
- Check if user is logged in

### Issue 3: Upload Fails
**Solution:**
- Verify Cloudinary credentials in `apps/server/.env`
- Restart backend server after updating `.env`
- Check file size (max 25MB)
- Check file type (PDF, JPG, PNG only)

### Issue 4: Page Crashes
**Solution:**
- Check for TypeScript errors in terminal
- Clear node_modules and reinstall: `bun install`
- Check React version compatibility

## 📊 Technical Validation

### Check Session Flow
```typescript
// In browser console (F12):
localStorage.getItem('sellerId')
// Should return: "sel_1738175..." (not null)

// Session should be available:
// Check in React DevTools
```

### Check Network Requests
```
# Open DevTools > Network tab
# Should see successful requests:
✅ POST /api/seller/register → 201
✅ POST /api/seller/documents/upload → 201
✅ POST /api/seller/onboarding/complete → 200
```

## ✅ Validation Checklist

Complete this checklist to confirm everything works:

- [ ] Can access seller registration page
- [ ] Loading spinner appears on onboarding page
- [ ] Can fill Step 1 (Business Info) without errors
- [ ] Can advance to Step 2
- [ ] Can upload PDF in Trade License field
- [ ] Success toast appears after PDF upload
- [ ] Can upload image in NID/Passport field
- [ ] No "Session Error" message at any point
- [ ] Can advance to Step 3
- [ ] Can fill bank account details
- [ ] Can advance to Step 4
- [ ] Can submit complete application
- [ ] Redirected to verification status page
- [ ] Documents listed on verification page
- [ ] Timeline shows submission event
- [ ] Files visible in Cloudinary dashboard
- [ ] Database records created correctly

## 🎉 Success Criteria

All these should be TRUE:
1. ✅ PDF uploads work without session error
2. ✅ Image uploads work without session error
3. ✅ Multiple file uploads work in sequence
4. ✅ Loading states display correctly
5. ✅ Success toasts appear after uploads
6. ✅ Complete onboarding flow works end-to-end
7. ✅ Data persists in database
8. ✅ Files stored in Cloudinary
9. ✅ Verification status page loads correctly
10. ✅ No console errors

## 📝 Test Report Template

After testing, you can report results like this:

```
✅ PASSED - Session error fixed
- PDF upload: ✅ Working
- Image upload: ✅ Working
- Complete flow: ✅ Working
- Files in Cloudinary: ✅ Verified
- Database records: ✅ Verified

OR

❌ FAILED - Issue found
- Step: [which step failed]
- Error: [error message]
- Console log: [paste error from console]
- Expected: [what should happen]
- Actual: [what actually happened]
```

## 🔧 Files That Were Fixed

1. `/apps/web/src/routes/seller/onboarding.tsx`
   - Fixed React hooks usage
   - Added loading state
   - Proper session handling

2. `/apps/web/src/routes/seller/verification-status.tsx`
   - Fixed React hooks usage
   - Consistent pattern

3. `/apps/web/src/types/seller.ts`
   - Fixed type mismatches
   - documentType field corrected
   - postalCode made optional

## 📚 Documentation

- **Fix Details**: See `SESSION_ERROR_FIX.md`
- **Setup Guide**: See `QUICK_START_GUIDE.md`
- **Backend Integration**: See `BACKEND_INTEGRATION_COMPLETE.md`

---

**Ready to test?** Follow the Quick Test section above and report any issues you find!
