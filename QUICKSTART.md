# 🚀 Quick Start Guide - Jacky 2.0

This is a quick reference guide to get Jacky 2.0 up and running as fast as possible.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] ElevenLabs account with API key
- [ ] ANAM AI account with Persona ID
- [ ] Text editor (VS Code, nano, etc.)

## 5-Minute Setup

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Configure Environment (2 minutes)

```bash
# Copy the environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Required values:**
```
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
ANAM_PERSONA_ID=persona_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Start Development Server (30 seconds)

```bash
npm run dev
```

### 4. Test It! (30 seconds)

1. Open: http://localhost:3000
2. Click "Start Conversation"
3. Allow microphone access
4. Say "Hello"

## Common Commands

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Run setup script
./setup.sh

# Docker deployment
docker-compose up -d
```

## Getting API Keys

### ElevenLabs (2-3 minutes)
1. Go to https://elevenlabs.io/sign-up
2. Navigate to Conversational AI
3. Create new agent → Copy Agent ID
4. Profile → API Keys → Copy API Key

### ANAM AI (2-3 minutes)
1. Go to https://anam.ai
2. Sign up for account
3. Create new persona
4. Copy Persona ID from dashboard

## Troubleshooting

**Port already in use?**
```bash
# Change PORT in .env file
PORT=8080
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Can't access microphone?**
- Use HTTPS in production
- Check browser permissions
- Try Chrome/Edge (best support)

## Embedding in Website

**Simple iframe:**
```html
<iframe 
    src="http://localhost:3000" 
    width="100%" 
    height="700px"
    allow="microphone">
</iframe>
```

## Next Steps

1. ✅ Configure `.env` with real API keys
2. ✅ Test locally at http://localhost:3000
3. ✅ Customize ElevenLabs agent with city information
4. ✅ Deploy to production server
5. ✅ Embed in midlandtexas.gov

## Need Help?

- 📖 Full docs: See [README.md](./README.md)
- 🐛 Issues: Check browser console (F12)
- 📧 Support: itsupport@midlandtexas.gov

---

**Remember:** Never commit your `.env` file to Git! It contains sensitive API keys.
