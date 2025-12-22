#!/bin/bash

echo "🚀 Starting Deployment Process..."
echo ""

# Check if MongoDB Atlas URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  Warning: MONGODB_URI not set"
    echo "   Set it as: export MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/polling_app'"
    echo ""
fi

# Build frontend
echo "📦 Building frontend..."
cd backend/client
npm run build
cd ../..

echo ""
echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy backend to Railway/Render/Heroku"
echo "   2. Deploy frontend to Vercel/Netlify"
echo "   3. Set environment variables"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"

