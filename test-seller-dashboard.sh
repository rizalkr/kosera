#!/bin/bash

# Kosera API Test Script - Seller Dashboard
# Usage: bash test-seller-dashboard.sh

BASE_URL="http://localhost:3000"

echo "🚀 Testing Seller Dashboard API"
echo "==============================="

# 1. Register user sebagai seller
echo "1. Registering seller user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Seller Dashboard",
    "username": "testsellerdash_'$(date +%s)'",
    "contact": "sellerdash_'$(date +%s)'@test.com",
    "password": "testpassword123",
    "role": "SELLER"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from registration response"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:50}..."

# 2. Test seller dashboard endpoint
echo ""
echo "2. Testing seller dashboard endpoint..."
DASHBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/api/seller/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Dashboard Response: $DASHBOARD_RESPONSE"

# 3. Check response structure
echo ""
echo "3. Analyzing response structure..."
if echo "$DASHBOARD_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Dashboard API returned success=true"
else
  echo "❌ Dashboard API did not return success=true"
fi

if echo "$DASHBOARD_RESPONSE" | grep -q '"kos":\['; then
  echo "✅ Dashboard API returned kos array"
else
  echo "❌ Dashboard API did not return kos array"
fi

if echo "$DASHBOARD_RESPONSE" | grep -q '"overallStats":{'; then
  echo "✅ Dashboard API returned overallStats object"
else
  echo "❌ Dashboard API did not return overallStats object"
fi

# 4. Test without authentication
echo ""
echo "4. Testing dashboard without authentication..."
UNAUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/seller/dashboard" \
  -H "Content-Type: application/json")

if echo "$UNAUTH_RESPONSE" | grep -q '"error"'; then
  echo "✅ Dashboard properly requires authentication"
else
  echo "❌ Dashboard should require authentication"
fi

echo ""
echo "🎉 Seller Dashboard API test completed!"
echo "======================================"

# 5. Test with invalid token
echo ""
echo "5. Testing dashboard with invalid token..."
INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/seller/dashboard" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json")

if echo "$INVALID_TOKEN_RESPONSE" | grep -q '"error"'; then
  echo "✅ Dashboard properly rejects invalid tokens"
else
  echo "❌ Dashboard should reject invalid tokens"
fi

echo ""
echo "📊 Summary:"
echo "- Registration: $(if [ ! -z "$TOKEN" ]; then echo "✅ Success"; else echo "❌ Failed"; fi)"
echo "- Dashboard Access: $(if echo "$DASHBOARD_RESPONSE" | grep -q '"success":true'; then echo "✅ Success"; else echo "❌ Failed"; fi)"
echo "- Authentication Check: $(if echo "$UNAUTH_RESPONSE" | grep -q '"error"'; then echo "✅ Protected"; else echo "❌ Vulnerable"; fi)"
echo "- Token Validation: $(if echo "$INVALID_TOKEN_RESPONSE" | grep -q '"error"'; then echo "✅ Secure"; else echo "❌ Insecure"; fi)"
