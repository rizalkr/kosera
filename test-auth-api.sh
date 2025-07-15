#!/bin/bash

# Script untuk test koneksi API dan auth dengan field room baru
echo "=== TESTING API CONNECTION & AUTH WITH NEW ROOM FIELDS ==="

# Check if server is running
echo "1. Checking if server is running..."
curl -f http://localhost:3000/api/kos 2>/dev/null > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running or not responding"
    exit 1
fi

# Test login endpoint
echo ""
echo "2. Testing login with seller account..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "username": "seller2",
        "password": "seller123"
    }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Login successful, token received"
    echo "Token: $TOKEN"
    
    # Test create kos with new room fields
    echo ""
    echo "3. Testing create kos with new room fields..."
    CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/kos \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "title": "Test Kos with Room Fields",
            "description": "Test kos dengan field total kamar dan kamar terisi",
            "price": 750000,
            "name": "Kos Test Room Fields",
            "address": "Jl. Test Room No. 123",
            "city": "Jakarta",
            "facilities": "WiFi, AC, Kamar Mandi Dalam",
            "totalRooms": 15,
            "occupiedRooms": 8
        }')
    
    echo "Create kos response: $CREATE_RESPONSE"
    
    if echo $CREATE_RESPONSE | grep -q "created successfully"; then
        echo "✅ Kos creation with room fields successful"
    else
        echo "❌ Kos creation failed"
    fi
else
    echo "❌ Login failed or no token received"
fi
