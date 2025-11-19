# ANAM AI + ElevenLabs Integration Guide

## Overview

This project now uses a **fully custom UI** that integrates ANAM AI avatar with ElevenLabs conversational AI. The implementation follows the ANAM AI full-app example pattern using the official `@anam-ai/js-sdk`.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Your Custom Web App                     │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  Frontend (public/js/app.js)                │   │
│  │  - Uses @anam-ai/js-sdk                      │   │
│  │  - Renders avatar in <video> element         │   │
│  │  - Manages UI controls                       │   │
│  └─────────────────────────────────────────────┘   │
│                    ↕                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │  Backend (server/index.js)                   │   │
│  │  - Creates ANAM sessions (secure)            │   │
│  │  - Creates ElevenLabs sessions               │   │
│  │  - Proxies API keys (security)               │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
              ↕                    ↕
    ┌─────────────────┐  ┌─────────────────┐
    │   ANAM AI API   │  │ ElevenLabs API  │
    │   (Avatar)      │  │ (Conversation)  │
    └─────────────────┘  └─────────────────┘
```

## What's New

### 1. Custom Video Rendering
- The ANAM avatar now renders directly in your custom UI using a `<video>` element
- No more iframe or external windows
- Full control over the UI/UX

### 2. ANAM AI SDK Integration
- Uses official `@anam-ai/js-sdk` (v1.1.1)
- Proper session management
- Event-driven architecture

### 3. Secure Backend Proxy
- API keys never exposed to frontend
- Server creates sessions on behalf of the client
- Better security and control

## Setup Instructions

### Step 1: Get Your API Keys

#### ANAM AI
1. Go to [ANAM AI Platform](https://app.anam.ai)
2. Create an account or log in
3. Create a new Persona (avatar)
4. Copy your:
   - **API Key** (from Settings)
   - **Persona ID** (from your persona details)

#### ElevenLabs
1. Go to [ElevenLabs](https://elevenlabs.io)
2. Create an account or log in
3. Navigate to Conversational AI
4. Create a new Agent
5. Copy your:
   - **API Key** (from profile settings)
   - **Agent ID** (from your agent details)

### Step 2: Configure Environment Variables

Edit the `.env` file in the project root:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# ElevenLabs API Configuration
ELEVENLABS_API_KEY=sk_your_actual_elevenlabs_key_here
ELEVENLABS_AGENT_ID=your_actual_agent_id_here

# ANAM AI Configuration
ANAM_API_KEY=your_actual_anam_api_key_here
ANAM_PERSONA_ID=your_actual_persona_id_here

# Application Configuration
ALLOWED_ORIGINS=https://Odessatexas.gov,http://localhost:3000
APP_NAME=Jett
CITY_NAME=City of Odessa, Texas

# Session Configuration
SESSION_TIMEOUT=1800000

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_LOGGING=true
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `@anam-ai/js-sdk` - Official ANAM AI JavaScript SDK
- `express` - Web server framework
- `axios` - HTTP client for API calls
- `ws` - WebSocket support
- Other dependencies

### Step 4: Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The app will be available at `http://localhost:3000`

### Step 5: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Click "Start Conversation"
3. Allow microphone access when prompted
4. You should see:
   - ANAM avatar rendering in the video element
   - Status indicator showing "Connected"
   - Mute and End Conversation buttons appear
5. Start speaking - the avatar should respond!

## Code Structure

### Frontend (`public/js/app.js`)

The frontend uses ES6 modules and the ANAM AI SDK:

```javascript
import { AnamClient } from 'https://cdn.jsdelivr.net/npm/@anam-ai/js-sdk@1/dist/index.js';

// Initialize client with session ID from backend
const anamClient = new AnamClient(sessionId, {
    personaId: config.anamPersonaId,
    audioProcessing: {
        provider: 'elevenlabs',
        signedUrl: elevenLabsSignedUrl
    }
});

// Stream to video element
await anamClient.streamToVideoElement(videoElement, {
    enableMicrophone: true,
    enableCamera: false
});
```

### Backend Endpoints

#### `POST /api/anam/session`
Creates a new ANAM session securely on the backend.

**Response:**
```json
{
  "sessionId": "anam_session_xxx",
  "expiresAt": "2025-11-06T20:00:00Z"
}
```

#### `POST /api/conversation/start`
Creates a new ElevenLabs conversation and returns signed URL.

**Response:**
```json
{
  "success": true,
  "signedUrl": "wss://api.elevenlabs.io/v1/convai/conversation?signed_url=...",
  "conversationId": "conv_xxx"
}
```

## Event Handling

The ANAM SDK provides rich event handling:

```javascript
// Connection events
anamClient.addListener('connectionEstablished', () => {});
anamClient.addListener('connectionClosed', () => {});

// Stream events
anamClient.addListener('streamStarted', () => {});
anamClient.addListener('streamStopped', () => {});

// Speaking events
anamClient.addListener('userStartedSpeaking', () => {});
anamClient.addListener('userStoppedSpeaking', () => {});
anamClient.addListener('botStartedSpeaking', () => {});
anamClient.addListener('botStoppedSpeaking', () => {});

// Error handling
anamClient.addListener('error', (error) => {});
```

## Troubleshooting

### Video doesn't appear
- Check browser console for errors
- Ensure microphone permissions are granted
- Verify ANAM_API_KEY and ANAM_PERSONA_ID are correct
- Check that the persona is active in ANAM dashboard

### Audio issues
- Verify ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID
- Check browser microphone settings
- Test microphone with other applications
- Look for CORS errors in console

### Session creation fails
- Verify all API keys are valid and have proper permissions
- Check server logs for detailed error messages
- Ensure your ANAM account has available quota
- Verify ElevenLabs agent is configured and active

### CORS errors
- Check ALLOWED_ORIGINS in .env includes your domain
- For localhost testing, use `http://localhost:3000` (not 127.0.0.1)
- Clear browser cache and try again

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Required browser features:**
- WebRTC support
- Microphone access
- ES6 modules
- Async/await

## Security Notes

1. **Never commit .env file** - It contains your API keys
2. **Use environment variables** - API keys are only on the server
3. **Validate session timeouts** - Sessions expire for security
4. **HTTPS in production** - Always use HTTPS for production deployments
5. **CORS configuration** - Limit ALLOWED_ORIGINS to your actual domains

## Deployment

### Docker

```bash
# Build the image
docker build -t Jett-2.0 .

# Run the container
docker run -p 3000:3000 --env-file .env Jett-2.0
```

### Docker Compose

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use valid SSL certificate (HTTPS)
- [ ] Update ALLOWED_ORIGINS with your domain
- [ ] Set up proper logging and monitoring
- [ ] Configure session timeouts appropriately
- [ ] Test all API endpoints
- [ ] Load test the application
- [ ] Set up backup/recovery procedures

## Resources

- [ANAM AI Documentation](https://docs.anam.ai)
- [ANAM AI Full App Example](https://docs.anam.ai/examples/full-app)
- [ANAM AI JS SDK](https://www.npmjs.com/package/@anam-ai/js-sdk)
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference)

## Support

For issues specific to:
- **ANAM AI**: Contact ANAM support or check their Discord
- **ElevenLabs**: Contact ElevenLabs support
- **This project**: Open an issue in the GitHub repository

## License

MIT License - See LICENSE file for details
