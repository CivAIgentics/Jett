#!/bin/bash

# Quick Test Script for Jacky 2.0 with ANAM + ElevenLabs

echo "==========================================="
echo "  Jacky 2.0 - Quick Test Script"
echo "  ANAM AI + ElevenLabs Integration"
echo "==========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your API keys:"
    echo ""
    echo "   Required keys:"
    echo "   - ELEVENLABS_API_KEY"
    echo "   - ELEVENLABS_AGENT_ID"
    echo "   - ANAM_API_KEY"
    echo "   - ANAM_PERSONA_ID"
    echo ""
    echo "   Then run this script again."
    exit 1
fi

# Check if API keys are configured
if grep -q "your_elevenlabs_api_key_here" .env || grep -q "your_anam_api_key_here" .env; then
    echo "⚠️  Warning: Default API keys detected in .env file"
    echo "📝 Please update the following in your .env file:"
    echo ""
    echo "   - ELEVENLABS_API_KEY=your_actual_key"
    echo "   - ELEVENLABS_AGENT_ID=your_actual_agent_id"
    echo "   - ANAM_API_KEY=your_actual_key"
    echo "   - ANAM_PERSONA_ID=your_actual_persona_id"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo ""
fi

# Start the server
echo "🚀 Starting Jacky 2.0 server..."
echo ""
echo "   📍 Server will run on: http://localhost:3000"
echo "   🎯 Press Ctrl+C to stop"
echo ""
echo "   📖 See ANAM_INTEGRATION_GUIDE.md for detailed setup"
echo ""
echo "==========================================="
echo ""

npm start
