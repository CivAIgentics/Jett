# Deployment Checklist - Jett

Use this checklist when deploying Jett to production.

## Pre-Deployment

### API Keys & Accounts
- [ ] ElevenLabs account created
- [ ] ElevenLabs agent configured with City of Odessa knowledge base
- [ ] ElevenLabs API key obtained
- [ ] ElevenLabs Agent ID obtained
- [ ] ANAM AI account created
- [ ] ANAM AI persona created and customized
- [ ] ANAM AI Persona ID obtained

### Development Environment
- [ ] Application tested locally
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file configured with all required keys
- [ ] Test conversation completed successfully
- [ ] Microphone permissions working
- [ ] WebSocket connection stable

### Server Setup
- [ ] Production server provisioned (VPS/Cloud)
- [ ] Node.js 18+ installed on server
- [ ] Domain/subdomain configured (e.g., Jett.Odessatexas.gov)
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Firewall configured (ports 80, 443, 3000)
- [ ] Reverse proxy configured (Nginx/Apache)

## Deployment Steps

### 1. Server Preparation
- [ ] SSH access to server verified
- [ ] Git installed on server
- [ ] PM2 or process manager installed
- [ ] Environment variables set on server

### 2. Application Deployment
- [ ] Code pushed to Git repository
- [ ] Repository cloned on server
- [ ] Production dependencies installed (`npm install --production`)
- [ ] `.env` file created on server with production values
- [ ] Application started with PM2

### 3. Configuration
```bash
# Environment variables to set
- [ ] NODE_ENV=production
- [ ] PORT=3000
- [ ] ELEVENLABS_API_KEY=<production_key>
- [ ] ELEVENLABS_AGENT_ID=<production_agent_id>
- [ ] ANAM_API_KEY=<production_key>
- [ ] ANAM_PERSONA_ID=<production_persona_id>
- [ ] ALLOWED_ORIGINS=https://Odessatexas.gov,https://www.Odessatexas.gov
```

### 4. Security
- [ ] HTTPS enabled and enforced
- [ ] SSL certificate valid and auto-renewing
- [ ] CORS configured with only Odessatexas.gov domains
- [ ] Firewall rules applied
- [ ] Rate limiting configured (optional but recommended)
- [ ] Security headers verified (Helmet.js)

### 5. Testing Production
- [ ] Application accessible via production URL
- [ ] Health check endpoint responding: `https://Jett.Odessatexas.gov/api/health`
- [ ] WebSocket connection working
- [ ] ANAM avatar loads correctly
- [ ] Conversation starts successfully
- [ ] Audio input/output working
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## CivicPlus Integration

### iframe Embedding
- [ ] Login to CivicPlus admin panel
- [ ] Create new page or edit existing page
- [ ] Add HTML/iframe embed code
- [ ] Set iframe attributes: `allow="microphone; camera; autoplay"`
- [ ] Test iframe loads correctly
- [ ] Verify no CORS errors
- [ ] Test on multiple devices

### Embed Code Options
Choose one:

**Option A: Full Page Embed**
```html
<iframe 
    src="https://Jett.Odessatexas.gov" 
    width="100%" 
    height="700px"
    allow="microphone; camera; autoplay"
    style="border: none;">
</iframe>
```

**Option B: Modal/Popup** (see README.md Method 3)

### Testing iframe
- [ ] iframe loads without errors
- [ ] Microphone permissions requested properly
- [ ] Conversation flows work end-to-end
- [ ] UI elements display correctly
- [ ] Mobile view tested

## Monitoring & Maintenance

### Health Checks
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot, etc.)
- [ ] Configure health check URL: `/api/health`
- [ ] Set up alerts for downtime

### Logging
- [ ] Application logs accessible
- [ ] Error tracking configured (optional: Sentry)
- [ ] Performance monitoring (optional: New Relic, DataDog)

### Backups
- [ ] Environment variables backed up securely
- [ ] Configuration files backed up
- [ ] Database backup schedule (if applicable)

### Updates
- [ ] Process for updating ElevenLabs agent knowledge base
- [ ] Process for updating ANAM persona
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented

## Post-Deployment

### Documentation
- [ ] Internal documentation updated
- [ ] IT team briefed on architecture
- [ ] Support team trained on troubleshooting
- [ ] Contact information documented

### User Communication
- [ ] Announce Jett to citizens
- [ ] Add help/FAQ section
- [ ] Provide feedback mechanism
- [ ] Monitor initial user feedback

### Analytics (Optional)
- [ ] Google Analytics integrated
- [ ] Usage metrics dashboard created
- [ ] Conversation quality monitoring
- [ ] User satisfaction tracking

## Troubleshooting Guide

### Common Issues

**Issue**: iframe not loading
- Check CORS settings in `.env`
- Verify SSL certificate
- Check browser console for errors

**Issue**: Microphone not working
- Ensure HTTPS is used
- Check browser permissions
- Verify `allow="microphone"` in iframe

**Issue**: Conversation not starting
- Verify ElevenLabs API key is valid
- Check ElevenLabs agent status
- Review server logs for errors

**Issue**: Avatar not displaying
- Verify ANAM Persona ID
- Check ANAM account status
- Test ANAM URL directly

## Emergency Contacts

- **ElevenLabs Support**: support@elevenlabs.io
- **ANAM AI Support**: support@anam.ai
- **Internal IT**: itsupport@Odessatexas.gov
- **Developer**: [Add contact info]

## Rollback Procedure

If issues occur:

```bash
# Stop the application
pm2 stop Jett-2.0

# Revert to previous version
git checkout <previous-commit-hash>

# Reinstall dependencies
npm install --production

# Restart application
pm2 start Jett-2.0
pm2 save
```

## Sign-off

- [ ] Deployment lead: _________________ Date: _______
- [ ] IT manager: _____________________ Date: _______
- [ ] Project sponsor: ________________ Date: _______

---

**Deployment Date**: ______________
**Production URL**: https://Jett.Odessatexas.gov
**Status**: ☐ Testing  ☐ Staging  ☐ Production
