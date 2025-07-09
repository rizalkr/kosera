#!/bin/bash

# Script untuk membuat foto sample tambahan
# Jalankan dari root directory project

cd public/images/rooms

# Copy room1.jpg dan room2.jpg menjadi variasi lain
if [ -f "room1.jpg" ]; then
    cp room1.jpg room3.jpg
    cp room1.jpg room4.jpg  
    cp room1.jpg room5.jpg
    echo "✅ Created room3.jpg, room4.jpg, room5.jpg"
fi

if [ -f "room2.jpg" ]; then
    cp room2.jpg room6.jpg
    cp room2.jpg room7.jpg
    echo "✅ Created room6.jpg, room7.jpg"
fi

echo "🎉 Sample photos created successfully!"
echo "📁 Photos in /public/images/rooms/:"
ls -la
