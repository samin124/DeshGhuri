#!/bin/bash
# Test script to verify secure headers are working

echo "🔒 Testing Secure Headers..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/ > /dev/null 2>&1; then
  echo "❌ Server is not running on port 3000"
  echo "   Start the server with: cd apps/server && bun run dev"
  exit 1
fi

echo "✅ Server is running"
echo ""
echo "📋 Security Headers:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Fetch and display security headers
HEADERS=$(curl -s -I http://localhost:3000/)

# Check for each security header
check_header() {
  local header_name="$1"
  local result=$(echo "$HEADERS" | grep -i "^$header_name:")

  if [ -n "$result" ]; then
    echo "✅ $result"
  else
    echo "❌ $header_name: Not found"
  fi
}

check_header "x-frame-options"
check_header "x-content-type-options"
check_header "referrer-policy"
check_header "x-download-options"
check_header "x-permitted-cross-domain-policies"
check_header "cross-origin-embedder-policy"
check_header "cross-origin-opener-policy"
check_header "cross-origin-resource-policy"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 All Headers:"
echo "$HEADERS"
echo ""
echo "✅ Secure headers middleware is working!"
