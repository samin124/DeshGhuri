#!/bin/bash
# Verification script for Hono RPC integration

echo "🔍 Verifying Hono RPC Integration..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the project root"
  exit 1
fi

echo "1️⃣ Checking Hono versions..."
SERVER_VERSION=$(grep '"hono"' apps/server/package.json | cut -d'"' -f4)
WEB_VERSION=$(grep '"hono"' apps/web/package.json | cut -d'"' -f4)

echo "   Server: $SERVER_VERSION"
echo "   Web: $WEB_VERSION"

if [ "$SERVER_VERSION" = "$WEB_VERSION" ]; then
  echo "   ✅ Versions match!"
else
  echo "   ❌ Versions don't match!"
  exit 1
fi

echo ""
echo "2️⃣ Checking server AppType export..."
if grep -q "export type AppType" apps/server/src/index.ts; then
  echo "   ✅ AppType exported from server"
else
  echo "   ❌ AppType not found in server/src/index.ts"
  exit 1
fi

echo ""
echo "3️⃣ Checking TypeScript project reference..."
if grep -q '"path": "../server"' apps/web/tsconfig.json; then
  echo "   ✅ Project reference configured"
else
  echo "   ❌ Project reference not found in web/tsconfig.json"
  exit 1
fi

echo ""
echo "4️⃣ Checking RPC files..."
RPC_FILES=(
  "apps/web/src/lib/api/rpc-client.ts"
  "apps/web/src/lib/api/seller-rpc.ts"
  "apps/web/src/hooks/use-seller.ts"
)

for file in "${RPC_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file exists"
  else
    echo "   ❌ $file not found"
    exit 1
  fi
done

echo ""
echo "5️⃣ Building web app..."
cd apps/web
if bun run build --mode development > /dev/null 2>&1; then
  echo "   ✅ Web app builds successfully"
else
  echo "   ❌ Build failed"
  exit 1
fi
cd ../..

echo ""
echo "✅ All checks passed!"
echo ""
echo "📚 Next steps:"
echo "   1. Read HONO_RPC_GUIDE.md for complete documentation"
echo "   2. Read apps/web/src/lib/api/USAGE_EXAMPLE.md for examples"
echo "   3. Start using RPC hooks in your components"
echo "   4. Run 'bun run dev' in both apps/server and apps/web to test"
echo ""
echo "🎉 Hono RPC integration complete!"
