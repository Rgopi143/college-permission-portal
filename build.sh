#!/bin/bash

# Render Build Script for CollegeFlow

echo "🚀 Starting CollegeFlow build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build successful! Files in dist:"
    ls -la dist/
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Check for critical files
if [ -f "dist/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html not found"
    exit 1
fi

echo "🎉 Build completed successfully!"
