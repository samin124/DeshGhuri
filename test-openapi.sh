#!/bin/bash
# Test script to verify OpenAPI integration

echo "🔍 Testing OpenAPI Integration..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/ > /dev/null 2>&1; then
  echo "❌ Server is not running on port 3000"
  echo "   Start the server with: cd apps/server && bun run dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Test root endpoint
echo "📋 Testing Endpoints:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test health check
HEALTH=$(curl -s http://localhost:3000/)
if [ "$HEALTH" = "OK" ]; then
  echo "✅ GET / - Health check working"
else
  echo "❌ GET / - Health check failed"
fi

# Test OpenAPI JSON endpoint
OPENAPI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/openapi.json)
if [ "$OPENAPI_STATUS" = "200" ]; then
  echo "✅ GET /openapi.json - OpenAPI schema endpoint working"

  # Check if it's valid JSON
  if curl -s http://localhost:3000/openapi.json | jq . > /dev/null 2>&1; then
    echo "   ✓ Valid JSON response"

    # Check OpenAPI version
    VERSION=$(curl -s http://localhost:3000/openapi.json | jq -r '.openapi')
    echo "   ✓ OpenAPI Version: $VERSION"

    # Count paths
    PATHS=$(curl -s http://localhost:3000/openapi.json | jq '.paths | length')
    echo "   ✓ Documented endpoints: $PATHS"

    # List paths
    echo "   ✓ Paths:"
    curl -s http://localhost:3000/openapi.json | jq -r '.paths | keys[]' | while read path; do
      echo "      - $path"
    done
  else
    echo "   ❌ Invalid JSON response"
  fi
else
  echo "❌ GET /openapi.json - Failed (HTTP $OPENAPI_STATUS)"
fi

# Test documentation UI endpoint
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/docs)
if [ "$DOCS_STATUS" = "200" ]; then
  echo "✅ GET /docs - Documentation UI endpoint working"

  # Check if response contains HTML
  if curl -s http://localhost:3000/docs | grep -q "<!DOCTYPE html>"; then
    echo "   ✓ HTML page returned"
  fi
else
  echo "❌ GET /docs - Failed (HTTP $DOCS_STATUS)"
fi

# Test existing seller endpoint still works
SELLER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/seller/test-cloudinary)
if [ "$SELLER_STATUS" = "200" ]; then
  echo "✅ GET /api/seller/test-cloudinary - Existing endpoint still working"
else
  echo "❌ GET /api/seller/test-cloudinary - Failed (HTTP $SELLER_STATUS)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Access Documentation:"
echo "   🌐 Interactive Docs: http://localhost:3000/docs"
echo "   📄 OpenAPI Schema:   http://localhost:3000/openapi.json"
echo ""
echo "✅ OpenAPI integration test complete!"
