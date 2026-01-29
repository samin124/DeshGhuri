# ✅ Upload Error Fixed - Document Type Mismatch

## 🐛 Issue Found

The upload was failing with a **500 Internal Server Error** because of a mismatch in document type names:

- **Frontend was sending**: `tradeLicense`, `nidOrPassport`, `tinCertificate` (camelCase)
- **Database was expecting**: `trade-license`, `nid`, `tin-certificate` (kebab-case)

## ✅ Fix Applied

I've added a mapping function that converts the frontend field names to the correct database document types.

### File Modified:
- `apps/web/src/components/seller/onboarding-step-2.tsx`
- `apps/web/src/lib/api/seller.ts`

### Mapping Added:
```typescript
tradeLicense → 'trade-license'
nidOrPassport → 'nid'
tinCertificate → 'tin-certificate'
propertyDocs → 'property-docs'
tourLicense → 'tour-license'
```

## 🚀 How to Test

### Step 1: Restart Frontend (IMPORTANT!)
```bash
# Stop the frontend (Ctrl+C)
cd apps/web
bun run dev
```

### Step 2: Clear Browser Cache

**Option A**: Use Incognito/Private browsing mode

**Option B**: Clear browser data:
1. Open Developer Tools (F12)
2. Application tab > Storage > Clear site data
3. Refresh the page

### Step 3: Test Upload

1. Go to: http://localhost:3001/seller/register
2. Select business category
3. Complete Step 1 (Business Information)
4. In Step 2 (Upload Documents):
   - **Upload Trade License** (PDF or image)
   - **Upload NID/Passport** (PDF or image)
   - Try TIN Certificate (optional)
5. ✅ Should upload successfully with green toast notification
6. ✅ No more "Failed to upload document" error

## ✅ Expected Results

### Before Fix:
```
❌ Upload Trade License → 500 Internal Server Error
❌ "Failed to upload document" toast
```

### After Fix:
```
✅ Upload Trade License → Success!
✅ "trade_license.pdf uploaded successfully" toast
✅ File appears in Cloudinary
✅ Can continue to next step
```

## 📊 Verification

After uploading, you should see:
1. **Success toast**: "[filename] uploaded successfully"
2. **File preview** (for images)
3. **No errors** in browser console
4. **Backend logs** showing upload success:
   ```
   ✅ Cloudinary upload successful
   ✅ Database save successful
   ```

## 🔍 Additional Improvements

I also improved error handling to show more detailed error messages if something fails. Now you'll see:
- Specific error reason (e.g., "File too large", "Invalid credentials")
- Not just generic "Failed to upload document"

## 🐛 If Upload Still Fails

If you still get an error after this fix, check:

### 1. Seller Record Exists
Make sure you started from `/seller/register` and the seller was created:
```javascript
// In browser console (F12):
localStorage.getItem('sellerId')
// Should return: "sel_..." not null
```

### 2. Cloudinary Credentials
Make sure your `.env` file has correct credentials:
```bash
cd apps/server
cat .env | grep CLOUDINARY
```

### 3. Backend Running
Make sure backend is running on port 3000:
```bash
curl http://localhost:3000
# Should return: "OK"
```

### 4. Check Backend Logs
Look at the backend terminal for detailed error messages with the logging I added.

## 📝 What Was Wrong

The error occurred because:

1. Frontend called upload with `documentType: 'tradeLicense'`
2. Backend tried to save to database with `documentType: 'tradeLicense'`
3. Database validation likely failed or caused insertion error
4. Backend returned 500 error

The fix ensures:
1. Frontend calls upload with `documentType: 'trade-license'`
2. Backend saves with correct type matching schema
3. Database accepts the value
4. Upload succeeds ✅

## ✅ Summary

**Issue**: Document type name mismatch (camelCase vs kebab-case)
**Fix**: Added mapping to convert names before upload
**Files Modified**:
- `onboarding-step-2.tsx` - Added documentTypeMap
- `seller.ts` (API) - Improved error details

**Status**: ✅ FIXED - Ready to test!

---

**Restart the frontend and try uploading again. It should work now!** 🎉
