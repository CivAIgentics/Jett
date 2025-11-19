#!/bin/bash

# Jacky 2.0 - Quick Start Script
# This script helps you set up the project quickly

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Jacky 2.0 - ANAM AI + ElevenLabs Integration Setup        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. You have: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API credentials:"
    echo "   - ANAM_API_KEY"
    echo "   - ANAM_PERSONA_ID"
    echo "   - ELEVENLABS_API_KEY"
    echo "   - ELEVENLABS_AGENT_ID"
    echo ""
    read -p "Press Enter when you've updated .env, or Ctrl+C to exit..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! 🎉                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the server:"
echo "   npm start"
echo ""
echo "2. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "3. Click 'Start Conversation' and allow microphone access"
echo ""
echo "For more information, see:"
echo "  - SETUP_GUIDE.md"
echo "  - INTEGRATION_COMPLETE.md"
echo ""
