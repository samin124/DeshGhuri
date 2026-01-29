# 🐛 Debug: Upload 500 Error

## Issue
Getting "500 Internal Server Error" when uploading documents in seller onboarding.

## ✅ Fixes Applied

I've added detailed logging throughout the upload process to help identify exactly where the error occurs.

---

## 🔧 Steps to Debug

### Step 1: Restart Backend Server

**IMPORTANT**: You MUST restart the backend for the new logging to work!

```bash
# Stop the backend (Ctrl+C in terminal)
cd apps/server
bun run dev
```

You should see:
```
✅ Cloudinary configured successfully
Started development server: http://localhost:3000
```

### Step 2: Test Cloudinary Configuration

Open this URL in your browser:
```
http://localhost:3000/api/seller/test-cloudinary
```

Should return:
```json
{
  "configured": true,
  "message": "Cloudinary is configured and ready"
}
```

If it says `"configured": false`, your Cloudinary credentials are missing or invalid.

### Step 3: Try Upload Again

1. Go to seller onboarding: http://localhost:3001/seller/onboarding
2. Try to upload a file
3. **Watch the backend terminal carefully**

You should see logs like this:

```
📤 Upload request received
📋 Upload details: { fileName: 'test.pdf', fileSize: 123456, ... }
⏳ Converting file to ArrayBuffer...
✅ ArrayBuffer created, size: 123456
☁️ Uploading to Cloudinary...
📦 Converting ArrayBuffer to base64, size: 123456
🔍 Detected MIME type: application/pdf
⬆️ Uploading to Cloudinary...
✅ Cloudinary upload successful
   URL: https://res.cloudinary.com/...
💾 Saving to database...
✅ Database save successful, documentId: doc_...
```

### Step 4: Find the Error

If it fails, you'll see something like:
```
❌ Cloudinary upload error: [ERROR MESSAGE HERE]
```

**Copy the entire error message** and share it with me.

---

## 🔍 Common Issues & Solutions

### Issue 1: "sellerId not found" or Database Error

**Symptom**: Error mentions "seller", "database", or "foreign key"

**Cause**: The seller record doesn't exist in the database yet.

**Solution**:
1. Clear localStorage: Open browser console (F12) and type:
   ```javascript
   localStorage.clear()
   ```
2. Go back to: http://localhost:3001/seller/register
3. Start the onboarding flow from the beginning

### Issue 2: "Authentication failed" or "Invalid credentials"

**Symptom**: Error mentions "auth", "credentials", or "API key"

**Cause**: Cloudinary credentials are wrong or expired.

**Solution**:
1. Go to your Cloudinary dashboard: https://cloudinary.com
2. Copy the credentials again (Cloud Name, API Key, API Secret)
3. Update `apps/server/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart backend server

### Issue 3: "resource_type" or "upload" error

**Symptom**: Error mentions "resource_type", "upload failed", or "invalid"

**Cause**: File might be corrupted or Cloudinary upload settings wrong.

**Solution**:
1. Try a different file (smaller PDF or JPG)
2. Make sure file is under 25MB
3. Try a simple test image first

### Issue 4: Network or Timeout Error

**Symptom**: "timeout", "network", "ECONNREFUSED"

**Cause**: Can't reach Cloudinary servers or slow upload.

**Solution**:
1. Check your internet connection
2. Try a smaller file first
3. Check if Cloudinary is down: https://status.cloudinary.com/

---

## 🧪 Quick Tests

### Test 1: Verify Backend is Running
```bash
curl http://localhost:3000
# Should return: "OK"
```

### Test 2: Verify Cloudinary Config
```bash
curl http://localhost:3000/api/seller/test-cloudinary
# Should return: {"configured":true,...}
```

### Test 3: Check Seller Exists
After registering and before uploading, check the backend terminal for:
```
✅ Seller registered: sel_...
```

---

## 📊 What the Logs Mean

| Log | Meaning |
|-----|---------|
| 📤 Upload request received | Endpoint was called successfully |
| 📋 Upload details | Shows file info (name, size, type) |
| ⏳ Converting file | Reading file into memory |
| ☁️ Uploading to Cloudinary | Sending file to Cloudinary |
| 💾 Saving to database | Creating database record |
| ✅ Success | That step completed |
| ❌ Error | That step failed (error details follow) |

---

## 🚨 Emergency Fallback

If you can't figure out the issue, try this complete reset:

```bash
# 1. Clear browser data
# In browser (F12 > Application > Storage > Clear site data)

# 2. Restart backend
cd apps/server
# Ctrl+C to stop
bun run dev

# 3. Restart frontend
cd apps/web
# Ctrl+C to stop
bun run dev

# 4. Start fresh
# Go to http://localhost:3001/seller/register
# Complete the entire flow again
```

---

## 📝 What to Share

If the issue persists, share:

1. **Backend terminal output** after uploading (copy the entire error)
2. **Browser console errors** (F12 > Console tab)
3. **File details**: What type of file? How large?
4. **Result of**: http://localhost:3000/api/seller/test-cloudinary

---

## ✅ Next Steps

1. ✅ Restart backend server
2. ✅ Check http://localhost:3000/api/seller/test-cloudinary
3. ✅ Try uploading a file
4. ✅ Share the backend terminal error message

The detailed logs will show us exactly where it's failing!
