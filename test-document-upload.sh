#!/bin/bash

# Test Document Upload Fix
# This script helps verify that the document upload bug is fixed

echo "🧪 Testing Seller Document Upload Fixes"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Server is not running on port 3000"
  echo "Please start the server with: cd apps/server && bun run dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Check Cloudinary configuration
echo "📋 Checking Cloudinary Configuration..."
CLOUDINARY_RESPONSE=$(curl -s http://localhost:3000/api/seller/test-cloudinary)
echo "Response: $CLOUDINARY_RESPONSE"
echo ""

# Instructions for manual testing
echo "📝 Manual Testing Steps:"
echo "========================"
echo ""
echo "1. Open your browser and go to:"
echo "   http://localhost:3001/seller/onboarding"
echo ""
echo "2. Complete Step 1 (Business Information)"
echo ""
echo "3. In Step 2, upload these documents:"
echo "   - Trade License (any PDF or image)"
echo "   - National ID/Passport (any image)"
echo "   - TIN Certificate (any PDF)"
echo "   - (Optional) Property Docs or Tour License based on category"
echo ""
echo "4. Watch the server logs for upload messages"
echo ""
echo "5. After uploading, verify in database:"
echo ""
echo "   Run this SQL query to check your documents:"
echo "   --------------------------------------------"
echo "   SELECT id, seller_id, document_type, file_name, status, uploaded_at"
echo "   FROM seller_document"
echo "   WHERE seller_id = 'YOUR_SELLER_ID';"
echo ""
echo "   Expected: You should see separate records for each document type"
echo "   ✅ PASS: 3-4 separate document records"
echo "   ❌ FAIL: Only 1 document record (bug still present)"
echo ""
echo "6. Verify in Cloudinary:"
echo "   - Go to https://cloudinary.com/console"
echo "   - Check Media Library > seller-documents/{sellerId}"
echo "   - Verify all uploaded files are present"
echo ""
echo "7. Check Verification Status Page:"
echo "   - Submit the onboarding form"
echo "   - Go to /seller/verification-status?sellerId={your_seller_id}"
echo "   - Verify ALL uploaded documents are displayed"
echo ""

# Offer to connect to database
echo "🗄️  Database Connection Info:"
echo "============================="
echo "Host: 127.0.0.1"
echo "Port: 54322"
echo "Database: postgres"
echo "User: postgres"
echo "Password: postgres"
echo ""

# Check if psql is available
if command -v psql &> /dev/null; then
  echo "💡 Quick database check command:"
  echo "PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c \"SELECT id, user_id, business_name, verification_status FROM seller ORDER BY created_at DESC LIMIT 5;\""
  echo ""

  read -p "Would you like to run this query now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
      SELECT
        s.id as seller_id,
        s.business_name,
        s.verification_status,
        COUNT(sd.id) as document_count
      FROM seller s
      LEFT JOIN seller_document sd ON s.id = sd.seller_id
      GROUP BY s.id, s.business_name, s.verification_status
      ORDER BY s.created_at DESC
      LIMIT 5;
    "
    echo ""
    echo "Document details for latest seller:"
    PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
      SELECT
        id,
        document_type,
        file_name,
        status,
        uploaded_at
      FROM seller_document
      WHERE seller_id = (SELECT id FROM seller ORDER BY created_at DESC LIMIT 1)
      ORDER BY uploaded_at DESC;
    "
  fi
else
  echo "⚠️  psql not found. You can use any PostgreSQL client to connect."
fi

echo ""
echo "✅ Test script complete!"
echo "Follow the manual steps above to verify the fixes."
