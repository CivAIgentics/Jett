#!/bin/bash

echo "🚀 Jett Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "🔧 IMPORTANT: Please edit the .env file with your API keys:"
    echo "   - ELEVENLABS_API_KEY"
    echo "   - ELEVENLABS_AGENT_ID"
    echo "   - ANAM_API_KEY"
    echo "   - ANAM_PERSONA_ID"
    echo ""
    echo "   Run: nano .env"
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your API keys in the .env file"
echo "2. Run 'npm run dev' for development mode"
echo "3. Run 'npm start' for production mode"
echo ""
echo "📚 For more information, see README.md"
