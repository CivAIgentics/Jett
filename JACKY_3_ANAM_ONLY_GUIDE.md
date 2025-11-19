# Jacky 3.0 - ANAM-Only Integration Guide

## Overview

Jacky 3.0 is the City of Midland's AI Assistant, now powered **exclusively by ANAM AI**. This version removes the ElevenLabs integration and uses ANAM's built-in conversational AI capabilities for both the visual avatar and intelligent conversation.

## Key Changes from Jacky 2.0

### ✅ What's New
- **ANAM-Only Architecture**: Single platform for both avatar and conversation
- **Simplified Integration**: No need for WebSocket management with ElevenLabs
- **Native Conversation**: ANAM handles speech recognition, NLU, and response generation
- **Persona ID**: `ef1b0530-5288-4505-bde1-8cc72fb09904`

### ❌ What's Removed
- ElevenLabs Conversational AI integration
- ElevenLabs WebSocket connection
- Dual-platform audio streaming
- ElevenLabs agent configuration

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Jacky 3.0 Web Application                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Custom UI (React-like Components)                 │ │
│  │  - Service Cards                                   │ │
│  │  - Transcript Display                              │ │
│  │  - Star Ratings & Feedback                         │ │
│  │  - Multi-language Support (EN/ES)                  │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────────┐ │
│  │   ANAM JavaScript SDK (@anam-ai/js-sdk)           │ │
│  │   - Avatar Video Stream                            │ │
│  │   - Speech Recognition (STT)                       │ │
│  │   - Conversational AI (NLU)                        │ │
│  │   - Text-to-Speech (TTS) with Lip Sync            │ │
│  └─────────────────┬──────────────────────────────────┘ │
└────────────────────┼───────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Node.js Server     │
         │  - Session Token API │
         │  - Analytics         │
         │  - Static Assets     │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │   ANAM AI API        │
         │  - Session Management│
         │  - Persona Config    │
         │  - AI Processing     │
         └──────────────────────┘
```

## Setup Instructions

### Prerequisites

1. **ANAM AI Account**
   - Sign up at [https://app.anam.ai](https://app.anam.ai)
   - Create or select a Persona
   - Get your API Key from Settings > API Keys

### Environment Configuration

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Set your ANAM credentials in `.env`**:
   ```env
   # ANAM AI Configuration
   ANAM_API_KEY=your_anam_api_key_here
   ANAM_PERSONA_ID=ef1b0530-5288-4505-bde1-8cc72fb09904
   ```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## API Endpoints

### Session Token Creation
```http
POST /api/anam/session
Content-Type: application/json

Response:
{
  "sessionToken": "eyJ...",
  "personaId": "ef1b0530-5288-4505-bde1-8cc72fb09904"
}
```

### Feedback Submission
```http
POST /api/feedback
Content-Type: application/json

Body:
{
  "messageIndex": 0,
  "feedbackType": "positive" | "negative",
  "messageContent": "...",
  "timestamp": "2025-11-17T..."
}
```

### Rating Submission
```http
POST /api/rating
Content-Type: application/json

Body:
{
  "rating": 1-5,
  "totalMessages": 10,
  "conversationTranscript": [...],
  "timestamp": "2025-11-17T..."
}
```

## Client-Side Integration

### Initialization

```javascript
// Create ANAM client with session token
const anamClient = window.anam.createClient(
    sessionToken,
    { personaId: 'ef1b0530-5288-4505-bde1-8cc72fb09904' }
);

// Start streaming to video element
await anamClient.streamToVideoAndAudioElements(
    'anam-video',  // video element ID
    'anam-video'   // audio element ID (same element)
);
```

### Event Listeners

```javascript
// User speech events
anamClient.addListener('userStartedSpeaking', () => {
    console.log('User started speaking');
});

anamClient.addListener('userStoppedSpeaking', () => {
    console.log('User stopped speaking');
});

anamClient.addListener('userTranscript', (transcript) => {
    console.log('User said:', transcript);
});

// Agent speech events
anamClient.addListener('agentStartedSpeaking', () => {
    console.log('Agent started speaking');
});

anamClient.addListener('agentStoppedSpeaking', () => {
    console.log('Agent stopped speaking');
});

anamClient.addListener('message', (message) => {
    if (message.type === 'agent' && message.text) {
        console.log('Agent said:', message.text);
    }
});
```

### Audio Controls

```javascript
// Mute/unmute microphone
anamClient.muteMicrophone();
anamClient.unmuteMicrophone();

// Stop streaming
anamClient.stopStreaming();
```

## Features

### Voice Navigation
Users can say commands like:
- "Open water account"
- "Show me permits"
- "Take me to trash service"
- "Abrir permisos" (Spanish)

The system automatically detects these commands and opens the relevant service card or link.

### Star Rating (Voice Command)
Users can rate their experience by saying:
- "I rate this 5 stars"
- "Give you four stars"
- "Excellent service" (auto-rates 5 stars)
- "Califico cinco estrellas" (Spanish)

### Multi-Language Support
- Auto-detects English and Spanish based on user speech
- Switches UI automatically
- Maintains language preference in localStorage

### Service Card Detection
The system intelligently shows relevant service cards based on conversation context:
- Analyzes user questions and agent responses
- Scores cards based on keyword matches
- Shows top 2 most relevant cards with each message

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - ANAM_API_KEY
# - ANAM_PERSONA_ID
```

### Docker

```bash
# Build image
docker build -t jacky-3.0 .

# Run container
docker run -p 3000:3000 \
  -e ANAM_API_KEY=your_key \
  -e ANAM_PERSONA_ID=ef1b0530-5288-4505-bde1-8cc72fb09904 \
  jacky-3.0
```

## Troubleshooting

### ANAM Session Token Errors

**Error**: "Failed to create ANAM session token"

**Solutions**:
1. Verify `ANAM_API_KEY` is correct and active
2. Check API key hasn't expired
3. Ensure `ANAM_PERSONA_ID` exists and is accessible
4. Check network connectivity to `api.anam.ai`

### Avatar Not Appearing

**Error**: Video element remains blank

**Solutions**:
1. Check browser console for CSP errors
2. Verify ANAM SDK is loaded (`window.anam` exists)
3. Ensure microphone permission was granted
4. Check `personaId` is correctly set

### Audio Issues

**Problem**: Can't hear agent or agent can't hear user

**Solutions**:
1. Check browser microphone permissions
2. Verify video element is not muted
3. Test with `anamClient.muteMicrophone()` / `unmuteMicrophone()`
4. Check audio output device in browser settings

## Performance Optimization

### Reduce Initial Load Time
```html
<!-- Preconnect to ANAM servers -->
<link rel="preconnect" href="https://api.anam.ai">
<link rel="dns-prefetch" href="https://api.anam.ai">
```

### Lazy Load Service Cards
```javascript
// Load cards only when conversation starts
await startConversation();
loadServiceCards();
```

## Security Best Practices

1. **Never expose ANAM_API_KEY in client-side code**
   - Always create session tokens server-side
   - Use short-lived session tokens

2. **Implement rate limiting**
   ```javascript
   app.use('/api/anam/session', rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100
   }));
   ```

3. **Validate session tokens**
   ```javascript
   // Add token expiration tracking
   const tokenCache = new Map();
   ```

## Support

- **ANAM Documentation**: [https://docs.anam.ai](https://docs.anam.ai)
- **ANAM Support**: support@anam.ai
- **Jacky 3.0 Issues**: https://github.com/CivAIgentics/Jacky-3.0/issues

## License

Copyright © 2025 Dr. Steven Sierra Alcabes & CivAIgentics
