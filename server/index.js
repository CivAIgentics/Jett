import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { ElevenLabsClient } from './services/elevenlabs.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for iframe embedding - allow all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Security headers - configured for iframe embedding
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://lab.anam.ai", "https://web.anam.ai", "https://*.anam.ai"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://*.anam.ai", "https://r2cdn.perplexity.ai"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https://r2cdn.perplexity.ai", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
      connectSrc: ["'self'", "https://api.elevenlabs.io", "wss://api.elevenlabs.io", "https://lab.anam.ai", "wss://lab.anam.ai", "https://web.anam.ai", "wss://web.anam.ai", "https://*.anam.ai", "wss://*.anam.ai"],
      frameSrc: ["'self'", "https://lab.anam.ai", "https://web.anam.ai", "https://*.anam.ai"],
      frameAncestors: ["'self'", "https://midlandtexas.gov", "https://*.midlandtexas.gov"],
      mediaSrc: ["'self'", "blob:", "https:", "data:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:", "https://*.anam.ai"],
    },
  },
  // Allow the app to be embedded in iframes from allowed origins
  frameguard: false
}));

// Set X-Frame-Options to allow embedding in specific domains
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://midlandtexas.gov');
  next();
});

// Set correct MIME type for JavaScript modules
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Jacky 2.0',
    timestamp: new Date().toISOString() 
  });
});

// Configuration endpoint for frontend
// Configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasElevenLabsAgentId: !!process.env.ELEVENLABS_AGENT_ID,
    hasAnamKey: !!process.env.ANAM_API_KEY,
    hasAnamPersonaId: !!process.env.ANAM_PERSONA_ID,
    agentId: process.env.ELEVENLABS_AGENT_ID
  });
});

// Environment check endpoint (for debugging)
app.get('/api/env-check', (req, res) => {
  res.json({
    hasAnamKey: !!process.env.ANAM_API_KEY,
    hasAnamPersonaId: !!process.env.ANAM_PERSONA_ID,
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasElevenLabsAgentId: !!process.env.ELEVENLABS_AGENT_ID,
    nodeEnv: process.env.NODE_ENV || 'not set',
    anamPersonaId: process.env.ANAM_PERSONA_ID || 'not set'
  });
});

// ElevenLabs conversation session endpoint
app.post('/api/conversation/start', async (req, res) => {
  try {
    console.log('=== Starting conversation request ===');
    
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    console.log('Using agent ID:', agentId);
    
    const elevenLabsClient = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY);
    const session = await elevenLabsClient.createConversation(agentId);
    
    console.log('Session created successfully');
    
    res.json({
      success: true,
      signedUrl: session.signed_url,
      conversationId: session.conversation_id
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation',
      message: error.message
    });
  }
});

// ANAM session token creation endpoint
app.post('/api/anam/session', async (req, res) => {
  try {
    console.log('=== Creating ANAM session token ===');
    
    // Create a session token with ANAM API
    const anamApiKey = process.env.ANAM_API_KEY;
    const anamPersonaId = process.env.ANAM_PERSONA_ID;
    
    if (!anamApiKey) {
      const error = new Error('ANAM_API_KEY not configured. Please set this environment variable.');
      error.code = 'MISSING_CONFIG';
      throw error;
    }
    
    if (!anamPersonaId) {
      const error = new Error('ANAM_PERSONA_ID not configured. Please set this environment variable.');
      error.code = 'MISSING_CONFIG';
      throw error;
    }
    
    console.log('Using Persona ID:', anamPersonaId);
    console.log('API Key (first 10 chars):', anamApiKey.substring(0, 10) + '...');
    
    // Helper function to make ANAM API request with timeout
    const makeAnamRequest = async (retryCount = 0) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch('https://api.anam.ai/v1/auth/session-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anamApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientLabel: 'jacky-2.0-web-client'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('ANAM API Response Status:', response.status);
        
        const responseText = await response.text();
        console.log('ANAM API Response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        
        if (!response.ok) {
          let errorMessage = 'Failed to create ANAM session token';
          let errorDetail = '';
          
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
            errorDetail = errorData.detail || errorData.error_description || '';
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
          
          const error = new Error(errorMessage);
          error.code = 'ANAM_API_ERROR';
          error.status = response.status;
          error.detail = errorDetail;
          throw error;
        }
        
        return JSON.parse(responseText);
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle timeout
        if (error.name === 'AbortError') {
          const timeoutError = new Error('ANAM API request timed out after 10 seconds');
          timeoutError.code = 'TIMEOUT';
          throw timeoutError;
        }
        
        // Handle network errors with retry
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          if (retryCount < 1) {
            console.log(`⚠️ Network error, retrying... (attempt ${retryCount + 1}/1)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            return makeAnamRequest(retryCount + 1);
          }
          const networkError = new Error('Unable to reach ANAM API. Please check network connection.');
          networkError.code = 'NETWORK_ERROR';
          networkError.originalError = error.message;
          throw networkError;
        }
        
        throw error;
      }
    };
    
    // Request session token from ANAM API with retry
    const sessionData = await makeAnamRequest();
    
    console.log('✅ ANAM session token created');
    
    res.json({
      sessionToken: sessionData.sessionToken || sessionData.session_token,
      personaId: anamPersonaId
    });
    
  } catch (error) {
    console.error('❌ Error creating ANAM session token:', error.message);
    console.error('Error code:', error.code);
    if (error.detail) {
      console.error('Error detail:', error.detail);
    }
    console.error('Error stack:', error.stack);
    console.error('Environment check:', {
      hasAnamKey: !!process.env.ANAM_API_KEY,
      hasPersonaId: !!process.env.ANAM_PERSONA_ID,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Determine appropriate HTTP status code
    let statusCode = 500;
    if (error.code === 'MISSING_CONFIG') {
      statusCode = 503; // Service Unavailable
    } else if (error.code === 'ANAM_API_ERROR' && error.status) {
      // Use the same status code as the ANAM API returned for auth errors
      statusCode = error.status === 401 || error.status === 403 ? 502 : 500;
    }
    
    res.status(statusCode).json({
      success: false,
      error: 'Failed to create ANAM session token',
      message: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        detail: error.detail
      } : undefined
    });
  }
});

// Feedback endpoint - Log user feedback for individual messages
app.post('/api/feedback', async (req, res) => {
  try {
    const feedbackData = req.body;
    
    console.log('📊 Message Feedback Received:', {
      messageIndex: feedbackData.messageIndex,
      feedbackType: feedbackData.feedbackType,
      messageType: feedbackData.messageType,
      timestamp: feedbackData.timestamp,
      conversationLength: feedbackData.conversationLength
    });
    
    // Log detailed feedback to console (in production, you'd save to database)
    console.log('📝 Full Feedback Data:', JSON.stringify(feedbackData, null, 2));
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send to analytics platform
    // 3. Trigger notifications for negative feedback
    
    res.json({
      success: true,
      message: 'Feedback received successfully'
    });
    
  } catch (error) {
    console.error('❌ Error processing feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process feedback',
      message: error.message
    });
  }
});

// Rating endpoint - Log overall conversation rating
app.post('/api/rating', async (req, res) => {
  try {
    const ratingData = req.body;
    
    console.log('⭐ Star Rating Received:', {
      rating: ratingData.rating,
      totalMessages: ratingData.totalMessages,
      agentMessages: ratingData.agentMessages,
      userMessages: ratingData.userMessages,
      sessionDuration: ratingData.sessionDuration,
      timestamp: ratingData.timestamp
    });
    
    // Log full conversation transcript for context
    console.log('💬 Conversation Transcript:', JSON.stringify(ratingData.conversationTranscript, null, 2));
    
    // Here you would typically:
    // 1. Save to database
    // 2. Calculate average ratings
    // 3. Trigger alerts for low ratings
    // 4. Use for AI model improvement
    
    res.json({
      success: true,
      message: 'Rating received successfully',
      averageRating: ratingData.rating // In production, calculate from database
    });
    
  } catch (error) {
    console.error('❌ Error processing rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process rating',
      message: error.message
    });
  }
});

// Proxy endpoint for midlandtexas.gov pages
app.get('/api/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing url parameter'
      });
    }
    
    // Security: Only allow specific domains
    const allowedDomains = [
      'midlandtexas.gov',
      'flymaf.com',
      'civicplus.com'
    ];
    
    const url = new URL(targetUrl);
    const isAllowed = allowedDomains.some(domain => url.hostname.endsWith(domain));
    
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: 'Domain not allowed. Only midlandtexas.gov, flymaf.com, and civicplus.com URLs are allowed'
      });
    }
    
    console.log('🔄 Proxying request to:', targetUrl);
    
    // Fetch the page with better headers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': url.origin,
        'Origin': url.origin
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let html = await response.text();
    
    // Rewrite URLs to use proxy for same-origin resources
    const baseUrl = `${url.protocol}//${url.hostname}`;
    
    // Fix relative URLs
    html = html.replace(/(href|src|action)="\/([^"]*)"/g, `$1="${baseUrl}/$2"`);
    
    // Fix protocol-relative URLs
    html = html.replace(/(href|src|action)="\/\/([^"]*)"/g, `$1="${url.protocol}//$2"`);
    
    // Inject base tag for proper relative URL resolution
    html = html.replace('<head>', `<head>\n  <base href="${targetUrl}">`);
    
    // Add custom styling to indicate this is proxied content
    const customStyles = `
    <style>
      body::before {
        content: "Viewing via Jacky Assistant";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px;
        text-align: center;
        font-size: 12px;
        z-index: 999999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      body {
        padding-top: 32px !important;
      }
    </style>
    `;
    
    html = html.replace('</head>', `${customStyles}\n</head>`);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    
    res.send(html);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to proxy request',
      message: error.message
    });
  }
});

// WebSocket connection handler for real-time communication
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'conversation_event':
          // Handle conversation events from ANAM/ElevenLabs
          console.log('Conversation event:', data);
          // Forward to analytics or logging service if needed
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Catch-all route - serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Jacky 2.0 server running on port ${PORT}`);
  console.log(`📍 City of Midland, Texas AI Agent`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
