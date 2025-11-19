#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Jett - Vercel Deployment Script
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error

echo "🚀 Starting Vercel Deployment for Jett"
echo "════════════════════════════════════════════"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    # Source the .env file safely
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        # Remove quotes if present and export
        value="${value%\"}"
        value="${value#\"}"
        export "$key=$value"
    done < .env
    echo "✅ Environment variables loaded"
else
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your API keys"
    exit 1
fi

# Verify required variables
echo ""
echo "🔍 Verifying required environment variables..."
MISSING_VARS=()

if [ -z "$ANAM_API_KEY" ]; then
    MISSING_VARS+=("ANAM_API_KEY")
fi

if [ -z "$ANAM_PERSONA_ID" ]; then
    MISSING_VARS+=("ANAM_PERSONA_ID")
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
    MISSING_VARS+=("ELEVENLABS_API_KEY")
fi

if [ -z "$ELEVENLABS_AGENT_ID" ]; then
    MISSING_VARS+=("ELEVENLABS_AGENT_ID")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo "✅ All required environment variables present:"
echo "   - ANAM_API_KEY: ${ANAM_API_KEY:0:10}..."
echo "   - ANAM_PERSONA_ID: $ANAM_PERSONA_ID"
echo "   - ELEVENLABS_API_KEY: ${ELEVENLABS_API_KEY:0:10}..."
echo "   - ELEVENLABS_AGENT_ID: $ELEVENLABS_AGENT_ID"

# Deploy to Vercel with environment variables
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

vercel deploy --prod \
  -e ANAM_API_KEY="$ANAM_API_KEY" \
  -e ANAM_PERSONA_ID="$ANAM_PERSONA_ID" \
  -e ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY" \
  -e ELEVENLABS_AGENT_ID="$ELEVENLABS_AGENT_ID" \
  -e NODE_ENV="production" \
  -e ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-https://Odessatexas.gov}" \
  -e APP_NAME="${APP_NAME:-Jett}" \
  -e CITY_NAME="${CITY_NAME:-City of Odessa, Texas}" \
  -e SESSION_TIMEOUT="${SESSION_TIMEOUT:-1800000}" \
  -e ENABLE_ANALYTICS="${ENABLE_ANALYTICS:-false}" \
  -e ENABLE_LOGGING="${ENABLE_LOGGING:-true}"

echo ""
echo "════════════════════════════════════════════"
echo "✅ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Visit your deployment URL shown above"
echo "   2. Test the health endpoint: /api/health"
echo "   3. Test the config endpoint: /api/config"
echo "   4. Start a conversation to verify ANAM and ElevenLabs integration"
echo ""
echo "🔧 If you need to update environment variables later:"
echo "   vercel env add VARIABLE_NAME"
echo ""
