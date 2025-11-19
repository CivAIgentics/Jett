# Vercel Deployment Setup

## Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

### Required Variables
```
ANAM_API_KEY=your_anam_api_key
ANAM_PERSONA_ID=your_persona_id
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_AGENT_ID=your_agent_id
```

### Optional Variables
```
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app
APP_NAME=Jacky 2.0
CITY_NAME=City of Midland, Texas
```

## Quick Setup Steps

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `Jacky-2.0-ANAM-ElevenLabs-`
3. **Go to Settings** → **Environment Variables**
4. **Add each variable** from above
5. **Redeploy** your project

## Testing After Deployment

Visit: `https://your-domain.vercel.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "service": "Jacky 2.0",
  "timestamp": "..."
}
```

## Troubleshooting

If you see "500 Internal Server Error":
- Check that all required environment variables are set
- Check Vercel function logs for specific error messages
- Verify API keys are valid and not expired
