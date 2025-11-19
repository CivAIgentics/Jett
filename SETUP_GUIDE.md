# Complete Setup Guide - Jacky 2.0

## Quick Start

This guide will walk you through setting up the fully custom ANAM AI + ElevenLabs integration.

## Prerequisites

1. **Node.js 18+** - Check with `node --version`
2. **ANAM AI Account** - Get your API key and Persona ID from [ANAM AI Dashboard](https://app.anam.ai)
3. **ElevenLabs Account** - Get your API key and Agent ID from [ElevenLabs](https://elevenlabs.io)

## Step 1: Get Your API Credentials

### ANAM AI Setup

1. Go to [https://app.anam.ai](https://app.anam.ai)
2. Sign up or log in
3. Create a new Persona (or use an existing one)
4. Note your **Persona ID** (found in the persona settings)
5. Go to **Settings > API Keys**
6. Create a new API key and copy it

### ElevenLabs Setup

1. Go to [https://elevenlabs.io](https://elevenlabs.io)
2. Sign up or log in
3. Navigate to **Conversational AI** section
4. Create a new agent (or use an existing one)
5. Note your **Agent ID**
6. Go to **Profile > API Keys**
7. Copy your API key

## Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/n-sheriff/COM-ANAM-ElevenLabs-Project.git
cd COM-ANAM-ElevenLabs-Project

# Install dependencies
npm install
```

## Step 3: Configure Environment Variables

```bash
# Copy the example .env file
cp .env.example .env
```

Edit the `.env` file with your credentials:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# ElevenLabs API Configuration
ELEVENLABS_API_KEY=sk_your_elevenlabs_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here

# ANAM AI Configuration
ANAM_API_KEY=your_anam_api_key_here
ANAM_PERSONA_ID=your_persona_id_here

# Application Configuration
ALLOWED_ORIGINS=https://midlandtexas.gov,http://localhost:3000
APP_NAME=Jacky 2.0
CITY_NAME=City of Midland, Texas

# Session Configuration
SESSION_TIMEOUT=1800000

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_LOGGING=true
```

## Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## Step 5: Test the Integration

### 1. Check Server Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Jacky 2.0",
  "timestamp": "2025-11-06T..."
}
```

### 2. Test Configuration Endpoint

```bash
curl http://localhost:3000/api/config
```

Expected response:
```json
{
  "appName": "Jacky 2.0",
  "cityName": "City of Midland, Texas",
  "anamPersonaId": "your_persona_id",
  "features": {
    "analytics": false,
    "logging": true
  }
}
```

### 3. Test ElevenLabs Session Creation

```bash
curl -X POST http://localhost:3000/api/conversation/start \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "signedUrl": "wss://...",
  "conversationId": "..."
}
```

### 4. Test ANAM Session Creation

```bash
curl -X POST http://localhost:3000/api/anam/session \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "sessionId": "...",
  "expiresAt": "..."
}
```

### 5. Test the Full UI

1. Open your browser to `http://localhost:3000`
2. Click **"Start Conversation"**
3. Allow microphone access when prompted
4. The ANAM avatar should appear in the video element
5. Start speaking - Jacky should respond

## Troubleshooting

### Issue: "Failed to create ANAM session"

**Solution:**
- Verify your `ANAM_API_KEY` is correct
- Check that your `ANAM_PERSONA_ID` exists and is active
- Check server logs for detailed error messages

### Issue: "Failed to start ElevenLabs session"

**Solution:**
- Verify your `ELEVENLABS_API_KEY` is correct
- Check that your `ELEVENLABS_AGENT_ID` exists
- Ensure your ElevenLabs account has active credits

### Issue: Video element shows black screen

**Solution:**
- Check browser console for errors
- Ensure you allowed microphone permissions
- Verify WebRTC is supported in your browser
- Check that both ANAM and ElevenLabs sessions were created successfully

### Issue: CORS errors in browser

**Solution:**
- Add your domain to `ALLOWED_ORIGINS` in `.env`
- Restart the server after changing `.env`

## Browser Compatibility

The application requires:
- **WebRTC support** (all modern browsers)
- **ES6 modules support**
- **getUserMedia API** for microphone access

Tested browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Production Deployment

### Environment Variables

Ensure all production values are set:
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Using Docker

```bash
# Build the image
docker build -t jacky-2.0 .

# Run the container
docker run -d \
  --name jacky-2.0 \
  -p 3000:3000 \
  --env-file .env \
  jacky-2.0
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Security Considerations

1. **Never commit `.env` to git** - It's in `.gitignore` by default
2. **API keys are server-side only** - Frontend never sees them
3. **CORS is configured** - Only allowed origins can access the API
4. **CSP headers** - Content Security Policy prevents XSS attacks
5. **Helmet.js** - Additional security headers enabled

## Next Steps

- Customize the avatar appearance in ANAM AI dashboard
- Configure your ElevenLabs agent's knowledge base and personality
- Embed the application in your website using an iframe
- Set up analytics and monitoring
- Configure SSL/TLS for production

## Support

For issues or questions:
- ANAM AI Documentation: [https://docs.anam.ai](https://docs.anam.ai)
- ElevenLabs Documentation: [https://elevenlabs.io/docs](https://elevenlabs.io/docs)
- Project Repository: [https://github.com/n-sheriff/COM-ANAM-ElevenLabs-Project](https://github.com/n-sheriff/COM-ANAM-ElevenLabs-Project)
