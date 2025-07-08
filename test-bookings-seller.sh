#!/bin/bash

# Kosera API Test Script - Bookings untuk Seller
# Usage: bash test-bookings-seller.sh

BASE_URL="http://localhost:3000"

echo "🚀 Testing Bookings API for Seller Role"
echo "=================================="

# 1. Register user sebagai seller
echo "1. Registering seller user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Seller User",
    "username": "testseller_'$(date +%s)'",
    "contact": "seller_'$(date +%s)'@test.com",
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

# 2. Test access to bookings endpoint
echo ""
echo "2. Testing GET /api/bookings with seller token..."
BOOKINGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Bookings Response: $BOOKINGS_RESPONSE"

# 3. Test dengan query parameters
echo ""
echo "3. Testing GET /api/bookings with pagination..."
BOOKINGS_PAGINATED=$(curl -s -X GET "$BASE_URL/api/bookings?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Paginated Bookings Response: $BOOKINGS_PAGINATED"

# 4. Test dengan status filter
echo ""
echo "4. Testing GET /api/bookings with status filter..."
BOOKINGS_FILTERED=$(curl -s -X GET "$BASE_URL/api/bookings?status=pending" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Filtered Bookings Response: $BOOKINGS_FILTERED"

# 5. Verify token
echo ""
echo "5. Verifying token..."
TOKEN_VERIFY=$(curl -s -X GET "$BASE_URL/api/auth/verify" \
  -H "Authorization: Bearer $TOKEN")

echo "Token Verify Response: $TOKEN_VERIFY"

echo ""
echo "✅ Test completed!"
