import { useState, useCallback, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import styles from '../styles/widget.module.css';
import dynamic from 'next/dynamic';
import { searchResources, getAllCategories } from '../data/resources-complete';
import { ResourceGrid } from '../components/ResourceCard';
import { serviceCards, searchCards } from '../data/service-cards';
import ServiceCard, { ServiceCardGroup } from '../components/service-card';

// Dynamically import the Orb component to avoid SSR issues with Three.js
const Orb = dynamic(
  () => import('../components/orb').then(mod => ({ default: mod.Orb })),
  { ssr: false }
);

// Dynamically import the ShimmeringText component
const ShimmeringText = dynamic(
  () => import('../components/shimmering-text').then(mod => ({ default: mod.ShimmeringText })),
  { ssr: false }
);

// Function to parse text and create hyperlinks
const parseMessageWithLinks = (text) => {
  const urlWithProtocolRegex = /(https?:\/\/[^\s]+)/g;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
  const urlWithoutProtocolRegex = /\b([a-zA-Z0-9][-a-zA-Z0-9]*\.(gov|com|org|net|edu|mil|us|ca|uk|info|io|co|ai|app|dev|tech|online|site|website|blog|shop|store|biz|me)(?:\/[^\s]*)?)\b/gi;
  
  let parts = [text];
  
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part;
    const split = part.split(urlWithProtocolRegex);
    return split.map((segment, i) => 
      urlWithProtocolRegex.test(segment) 
        ? <a key={`url-proto-${i}`} href={segment} target="_blank" rel="noopener noreferrer" className={styles.link}>{segment}</a>
        : segment
    );
  });
  
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part;
    const split = part.split(emailRegex);
    return split.map((segment, i) => 
      emailRegex.test(segment)
        ? <a key={`email-${i}`} href={`mailto:${segment}`} className={styles.link}>{segment}</a>
        : segment
    );
  });
  
  parts = parts.flatMap((part, partIdx) => {
    if (typeof part !== 'string') return part;
    
    const matches = [];
    let match;
    const regex = new RegExp(urlWithoutProtocolRegex);
    
    while ((match = regex.exec(part)) !== null) {
      matches.push({
        text: match[0],
        index: match.index
      });
    }
    
    if (matches.length === 0) return part;
    
    const result = [];
    let lastIndex = 0;
    
    matches.forEach((m, i) => {
      if (m.index > lastIndex) {
        result.push(part.substring(lastIndex, m.index));
      }
      
      result.push(
        <a key={`url-${partIdx}-${i}`} href={`https://${m.text}`} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {m.text}
        </a>
      );
      
      lastIndex = m.index + m.text.length;
    });
    
    if (lastIndex < part.length) {
      result.push(part.substring(lastIndex));
    }
    
    return result;
  });
  
  return parts;
};

const AGENT_ID = 'agent_8601k89mc91repq8xd2zg2brmkkq';

// Typing indicator component
const TypingIndicator = ({ type = 'agent' }) => (
  <div className={styles.typingIndicator}>
    <div className={styles.typingDot} style={{ animationDelay: '0ms' }}></div>
    <div className={styles.typingDot} style={{ animationDelay: '150ms' }}></div>
    <div className={styles.typingDot} style={{ animationDelay: '300ms' }}></div>
  </div>
);

// Card orchestration: Detect when to show service cards
const detectRelevantCards = (message, previousMessages = [], messageIndex = 0) => {
  if (!message || !message.content) return [];
  
  const content = message.content.toLowerCase();
  
  // Only process agent messages for card display
  if (message.type !== 'agent') {
    return [];
  }
  
  // CRITICAL: Never show cards in the FIRST AGENT MESSAGE (welcome message)
  // Check if this is the very first agent response (the welcome/disclaimer message)
  // We do this by checking if the message content contains the disclaimer text
  const isWelcomeMessage = content.includes('all calls and text exchanges are recorded') || 
                           content.includes('training and monitoring purposes') ||
                           messageIndex === 0; // Also block if this is literally the first message
  
  if (isWelcomeMessage) {
    console.log('🚫 Blocking cards - this is the first agent message (welcome message)');
    return [];
  }
  
  // CRITICAL: Cards should ONLY be shown when the agent is actively providing contact information
  // Based on ElevenLabs system prompt: "Cards should ONLY be shown when providing contact information"
  
  // Check if message is long enough to be helpful (not just "ok" or "sure")
  if (content.length < 30) {
    console.log('🚫 Message too short for cards:', content.length, 'chars');
    return [];
  }
  
  // Department-specific keywords - HIGHLY SPECIFIC for accurate matching
  const departmentKeywords = {
    utilities: {
      primary: ['water bill', 'utility bill', 'pay water', 'pay bill', 'water service', 'utility billing', 'water payment'],
      secondary: ['water', 'utility', 'sewer', 'billing']
    },
    animalServices: {
      primary: ['animal services', 'adopt', 'adoption', 'lost pet', 'found pet', 'pet adoption', 'animal shelter', 'dog adoption', 'cat adoption'],
      secondary: ['pet', 'dog', 'cat', 'animal']
    },
    development: {
      primary: ['building permit', 'construction permit', 'permit application', 'development services'],
      secondary: ['permit', 'building', 'construction', 'inspection']
    },
    police: {
      primary: ['police report', 'file report', 'police department'],
      secondary: ['police', 'crime', 'theft', 'report']
    },
    parks: {
      primary: ['parks and recreation', 'community center', 'recreation center', 'park facility'],
      secondary: ['park', 'pool', 'recreation']
    },
    court: {
      primary: ['traffic ticket', 'pay ticket', 'municipal court', 'court date'],
      secondary: ['ticket', 'citation', 'court', 'fine']
    },
    health: {
      primary: ['health services', 'immunization', 'health clinic', 'vaccine'],
      secondary: ['health', 'clinic', 'vaccine']
    }
  };
  
  // First, look at the most recent user message to understand context
  let userContext = '';
  for (let i = previousMessages.length - 1; i >= 0; i--) {
    if (previousMessages[i].type === 'user' || previousMessages[i].source === 'user') {
      userContext = (previousMessages[i].message || previousMessages[i].content || '').toLowerCase();
      break;
    }
  }
  
  console.log(`🔍 User context: "${userContext.substring(0, 100)}..."`);
  console.log(`� Agent response: "${content.substring(0, 100)}..."`);
  
  // Determine the primary topic by checking both user context and agent response
  const combinedText = userContext + ' ' + content;
  
  let matchedDept = null;
  let matchScore = 0;
  
  // Score each department based on keyword matches (prioritize primary keywords)
  for (const [dept, keywords] of Object.entries(departmentKeywords)) {
    let score = 0;
    
    // Primary keywords are worth 10 points
    keywords.primary.forEach(kw => {
      if (combinedText.includes(kw)) {
        score += 10;
        console.log(`✅ Primary match "${kw}" for ${dept} (+10)`);
      }
    });
    
    // Secondary keywords are worth 1 point (only counted if primary matches exist)
    if (score > 0) {
      keywords.secondary.forEach(kw => {
        if (combinedText.includes(kw)) {
          score += 1;
        }
      });
    }
    
    if (score > matchScore) {
      matchScore = score;
      matchedDept = dept;
    }
  }
  
  // Require minimum score to show cards (prevents weak matches)
  if (matchScore < 5) {
    console.log(`⚠️ Match score too low: ${matchScore} (need at least 5)`);
    return [];
  }
  
  console.log(`🎯 Best match: ${matchedDept} (score: ${matchScore})`);
  
  // Build targeted search query based on the matched department
  let searchQuery = '';
  if (matchedDept) {
    const primaryKeywords = departmentKeywords[matchedDept].primary;
    searchQuery = primaryKeywords[0]; // Use the most specific keyword
  }
  
  // Search for relevant cards with the targeted query
  const relevantCards = searchCards(searchQuery || combinedText);
  
  console.log(`📦 Found ${relevantCards.length} cards for query: "${searchQuery}"`);
  
  if (relevantCards.length === 0) {
    console.log('⚠️ No cards found by keyword search');
    return [];
  }
  
  // Filter cards to ONLY show ones that match the detected department
  let cardsToShow = relevantCards;
  
  if (matchedDept) {
    const deptKeywords = [
      ...departmentKeywords[matchedDept].primary,
      ...departmentKeywords[matchedDept].secondary
    ];
    
    cardsToShow = relevantCards.filter(card => {
      const cardText = (card.title + ' ' + card.description).toLowerCase();
      // Card must match at least one primary keyword
      return departmentKeywords[matchedDept].primary.some(kw => 
        cardText.includes(kw) || card.title.toLowerCase().includes(kw.split(' ')[0])
      );
    });
    
    console.log(`🎯 Filtered to ${cardsToShow.length} ${matchedDept}-specific cards`);
  }
  
  // Return top 2 most relevant cards
  const finalCards = cardsToShow.slice(0, 2);
  console.log(`📋 Returning ${finalCards.length} cards:`, finalCards.map(c => c.title).join(', '));
  
  return finalCards;
};

// Language translations
const translations = {
  en: {
    title: "Jett - Test",
    subtitle: "City of Odessa, Texas",
    welcome: "Welcome to Jett - Test",
    welcomeMessage: "Hello! I'm Jett, your real-time AI assistant for all things Odessa. I can answer questions and provide information on City of Odessa services.",
    readyForCall: "Ready for Call",
    activelyOnCall: "Actively on Call",
    relatedResources: "📌 Related Resources:",
    copy: "Copy",
    copied: "Copied",
    rateExperience: "Rate your experience:",
    shareFeedback: "Share Feedback",
  poweredBy: "Powered by Dr. Steven Sierra Alcabes",
    placeholderConnected: "Type your message or speak...",
    placeholderDisconnected: "Type a message to start...",
    payWaterBill: "Pay Water Bill",
    reportIssue: "Report an Issue",
    permitOdessa: "Permit Odessa",
    trafficAlerts: "Traffic Alerts",
    greeting: "Hi, I'm Jett - Test 👋!",
    ctaText: "How can I help you?",
    textModeMessage: "Both you and Jett will be muted for text mode.",
    voiceModeHint: "Or click the phone icon for voice chat."
  },
  es: {
    title: "Jett",
    subtitle: "Ciudad de Odessa, Texas",
    welcome: "Bienvenido a Jett - Prueba",
    welcomeMessage: "¡Hola! Soy Jett, tu asistente de IA en tiempo real para todo lo relacionado con Odessa. Aunque no soy humano, puedo responder preguntas y proporcionar información sobre cualquier cosa relacionada con los servicios de la Ciudad de Odessa.",
    readyForCall: "Listo para Llamada",
    activelyOnCall: "En Llamada Activa",
    relatedResources: "📌 Recursos Relacionados:",
    copy: "Copiar",
    copied: "Copiado",
    rateExperience: "Califica tu experiencia:",
    shareFeedback: "Compartir Comentarios",
    poweredBy: "Diseñado y Desarollado por Dr. Steven Sierra Alcabes",
    placeholderConnected: "Escribe tu mensaje o habla...",
    placeholderDisconnected: "Escribe un mensaje para comenzar...",
    payWaterBill: "Pagar Factura de Agua",
    reportIssue: "Reportar un Problema",
    permitOdessa: "Permisos Odessa",
    trafficAlerts: "Alertas de Tráfico",
    greeting: "¡Hola, soy Jett - Prueba 👋!",
    ctaText: "¿Cómo puedo ayudarte?",
    textModeMessage: "Tanto tú como Jett estarán en silencio para el modo de texto.",
    voiceModeHint: "O haz clic en el ícono del teléfono para chat de voz."
  }
};

// Spanish detection function
const detectSpanish = (text) => {
  if (!text) return false;
  const spanishWords = ['hola', 'buenos', 'días', 'gracias', 'por favor', 'ayuda', 'necesito', 'quiero', 'dónde', 'cómo', 'cuándo', 'qué', 'soy', 'estoy', 'español', 'habla', 'hablas'];
  const lowerText = text.toLowerCase();
  return spanishWords.some(word => lowerText.includes(word));
};

export default function WidgetPage() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isJettMuted, setIsJettMuted] = useState(true); // Start with Jett muted by default
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState({}); // Track feedback per message: { messageIndex: 'positive' | 'negative' }
  const [starRating, setStarRating] = useState(0); // Overall star rating (1-5)
  const [hoveredStar, setHoveredStar] = useState(0); // For hover effect
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'es'
  const [mounted, setMounted] = useState(false); // Track client-side mount
  const [currentToolCards, setCurrentToolCards] = useState([]); // Cards currently displayed
  const [conversationHistory, setConversationHistory] = useState([]); // Track topics discussed
  const [showHistory, setShowHistory] = useState(false); // Toggle history panel
  const [currentTopic, setCurrentTopic] = useState(''); // Track the current conversation topic
  const [showSurveyModal, setShowSurveyModal] = useState(false); // Survey modal state
  const messagesEndRef = useRef(null);
  
  const t = translations[language]; // Current translations
  
  // Fix hydration by only rendering language-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const conversation = useConversation({
    micMuted: isMicMuted, // Pass the muted state as a controlled prop
    volume: isJettMuted ? 0 : 1, // Control volume - start at 0 (muted)
    onConnect: () => {
      console.log('✅ Connected to ElevenLabs agent');
      console.log('Input volume:', conversation.getInputVolume?.());
      console.log('Output volume:', conversation.getOutputVolume?.());
      setIsConnected(true);
      // Don't show connection message in chat
    },
    onDisconnect: (disconnectEvent) => {
      console.log('❌ Disconnected from agent');
      console.log('Disconnect event details:', disconnectEvent);
      setIsConnected(false);
      
      // Handle abnormal disconnects (code 1006)
      if (disconnectEvent?.code === 1006) {
        console.error('Abnormal disconnect (1006) - possible causes: API key issue, network problem, or agent configuration');
        addMessage('error', 'Connection failed. Please check your internet connection and try again.');
      }
    },
    onMessage: (message) => {
      console.log('📨 Message received:', message);
      if (message.message) {
        const isUserMessage = message.source === 'user' || message.role === 'user';
        console.log(`Message type: ${isUserMessage ? 'USER' : 'AGENT'}, Content:`, message.message);
        
        // Detect Spanish in messages and auto-switch language
        if (detectSpanish(message.message)) {
          console.log('🌐 Spanish detected, switching UI to Spanish');
          setLanguage('es');
        }
        
        if (isUserMessage) {
          addMessage('user', message.message);
        } else {
          // Agent message - add with resource cards if relevant
          addMessageWithResources('agent', message.message);
        }
      }
      console.log('Full message object:', JSON.stringify(message));
    },
    onAudio: (audio) => {
      console.log('🔊 Audio received:', audio);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      // Only show errors that have meaningful messages
      if (error && error.message && error.message !== 'undefined') {
        addMessage('error', `Error: ${error.message}`);
      }
    },
    onModeChange: (mode) => {
      console.log('🔄 Mode changed to:', mode);
      // Don't show mode changes in the chat
    },
    onStatusChange: (status) => {
      console.log('📊 Status changed:', status);
    },
  });

  const addMessage = useCallback((type, content, resources = null, serviceCards = null) => {
    const messageObj = { type, content, timestamp: Date.now() };
    if (resources) messageObj.resources = resources;
    if (serviceCards) {
      messageObj.serviceCards = serviceCards;
      console.log(`🔐 SAVED serviceCards to message object:`, serviceCards.map(c => c.title).join(', '));
    }
    setMessages(prev => [...prev, messageObj]);
    console.log(`📝 Message added to state (type: ${type}, has cards: ${!!serviceCards})`);
  }, []);

  // HYBRID card detection - Combines department detection + intelligent scoring
  const detectCardsFromContext = useCallback((userMessage, agentResponse) => {
    console.log('🔍 HYBRID DETECTION: Analyzing context...');
    console.log('User said:', userMessage);
    console.log('Agent said:', agentResponse?.substring(0, 100) + '...');
    
    // Use BOTH user message AND agent response for detection
    const userText = (userMessage || '').toLowerCase().trim();
    const agentText = (agentResponse || '').toLowerCase().trim();
    const combinedText = `${userText} ${agentText}`;
    
    // ============================================================
    // LAYER 1: DEPARTMENT DETECTION (from old working code)
    // ============================================================
    const departmentKeywords = {
      utilities: {
        primary: ['water bill', 'utility bill', 'pay water', 'water service', 'utility billing', 'water payment', 'trash', 'garbage', 'recycle'],
        secondary: ['water', 'utility', 'sewer', 'billing', 'waste']
      },
      animalServices: {
        primary: ['animal services', 'adopt', 'adoption', 'lost pet', 'found pet', 'pet adoption', 'animal shelter', 'dog adoption', 'cat adoption', 'puppies', 'puppy', 'kitten'],
        secondary: ['pet', 'dog', 'cat', 'animal', 'stray']
      },
      development: {
        primary: ['building permit', 'construction permit', 'permit application', 'development services', 'permit Odessa'],
        secondary: ['permit', 'building', 'construction', 'inspection', 'contractor']
      },
      police: {
        primary: ['police report', 'file report', 'police department', 'crime', 'theft'],
        secondary: ['police', 'officer', 'report', 'law enforcement']
      },
      fire: {
        primary: ['fire department', 'fire safety', 'smoke alarm', 'fire inspection', 'ems'],
        secondary: ['fire', 'firefighter', 'emergency', 'paramedic']
      },
      parks: {
        primary: ['parks and recreation', 'community center', 'recreation center', 'park facility', 'swimming pool', 'golf'],
        secondary: ['park', 'pool', 'recreation', 'sports', 'playground']
      },
      court: {
        primary: ['traffic ticket', 'pay ticket', 'municipal court', 'court date', 'citation'],
        secondary: ['ticket', 'citation', 'court', 'fine', 'violation']
      },
      health: {
        primary: ['health services', 'immunization', 'health clinic', 'vaccine', 'senior services'],
        secondary: ['health', 'clinic', 'vaccine', 'medical', 'senior']
      },
      transit: {
        primary: ['ez-rider', 'public transit', 'bus', 'bus route', 'bus schedule'],
        secondary: ['transit', 'transportation', 'ride', 'bus']
      },
      employment: {
        primary: ['city jobs', 'employment', 'apply for job', 'city careers', 'hiring'],
        secondary: ['job', 'career', 'work', 'hiring', 'employment']
      }
    };
    
    // Detect which department(s) this conversation is about
    let departmentScores = {};
    for (const [dept, keywords] of Object.entries(departmentKeywords)) {
      let score = 0;
      
      // Primary keywords worth 10 points each
      keywords.primary.forEach(kw => {
        if (combinedText.includes(kw)) {
          score += 10;
          console.log(`✅ Primary match "${kw}" for ${dept} (+10)`);
        }
      });
      
      // Secondary keywords worth 2 points each (only if we have primary matches)
      if (score > 0) {
        keywords.secondary.forEach(kw => {
          if (combinedText.includes(kw)) {
            score += 2;
          }
        });
      }
      
      if (score > 0) {
        departmentScores[dept] = score;
      }
    }
    
    // Get top department
    const topDepartment = Object.entries(departmentScores)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topDepartment) {
      console.log(`🎯 Top department: ${topDepartment[0]} (score: ${topDepartment[1]})`);
    }
    
    // ============================================================
    // LAYER 2: CARD SEARCH & INTELLIGENT SCORING
    // ============================================================
    console.log('🔍 Searching cards with combined text from user + agent response');
    
    let allCards = searchCards(combinedText);
    
    if (allCards.length === 0) {
      console.log('❌ No cards found for combined query');
      return [];
    }
    
    console.log(`📋 Found ${allCards.length} potential cards to score:`, allCards.map(c => c.title).join(', '));
    
    // Enhanced scoring with department boost
    const scoredCards = allCards.map(card => {
      let score = 0;
      const keywords = card.keywords || [];
      
      // Department boost: If card keywords match the detected department
      if (topDepartment && departmentKeywords[topDepartment[0]]) {
        const deptKeywords = [
          ...departmentKeywords[topDepartment[0]].primary,
          ...departmentKeywords[topDepartment[0]].secondary
        ];
        
        const cardText = `${card.title} ${card.description || ''} ${keywords.join(' ')}`.toLowerCase();
        const matchesDepartment = deptKeywords.some(kw => cardText.includes(kw));
        
        if (matchesDepartment) {
          score += 15; // Boost cards that match detected department
          console.log(`🎯 Department boost for "${card.title}" (+15)`);
        }
      }
      
      // Check each keyword against BOTH user message and agent response
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Perfect exact match in user message
        if (userText === keywordLower) {
          score += 50;
        }
        
        // Word boundary match in user message (very strong!)
        const wordRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordRegex.test(userText)) {
          score += 25;
        }
        
        // Word boundary match in agent response (strong - agent knows!)
        if (wordRegex.test(agentText)) {
          score += 20;
        }
        
        // Partial match in user message
        if (userText.includes(keywordLower)) {
          score += 10;
        }
        
        // Partial match in agent response
        if (agentText.includes(keywordLower)) {
          score += 8;
        }
      });
      
      // Boost score if title words appear in messages
      const titleWords = card.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.length > 3) { // Only meaningful words
          const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          
          if (userText === word) score += 50;
          if (agentText === word) score += 40;
          if (wordRegex.test(userText)) score += 20;
          if (wordRegex.test(agentText)) score += 15;
          if (userText.includes(word)) score += 8;
          if (agentText.includes(word)) score += 5;
        }
      });
      
      return { ...card, score };
    });
    
    // Sort by score
    scoredCards.sort((a, b) => b.score - a.score);
    
    console.log('📊 Card scores:', scoredCards.map(c => `${c.title}: ${c.score}`).join(', '));
    
    // ============================================================
    // LAYER 3: FILTERING & SELECTION
    // ============================================================
    const MIN_SCORE = 8; // Slightly lower threshold with department boost
    const relevantCards = scoredCards.filter(card => card.score >= MIN_SCORE);
    
    if (relevantCards.length === 0) {
      console.log('⚠️ No cards meet threshold (min: 8)');
      console.log('   Top scores:', scoredCards.slice(0, 3).map(c => `${c.title} (${c.score})`).join(', '));
      return [];
    }
    
    // If we detected a department, prioritize cards from that department
    let finalCards = relevantCards;
    if (topDepartment && relevantCards.length > 2) {
      const deptKeywords = [
        ...departmentKeywords[topDepartment[0]].primary,
        ...departmentKeywords[topDepartment[0]].secondary
      ];
      
      const deptCards = relevantCards.filter(card => {
        const cardText = `${card.title} ${card.description || ''} ${card.keywords?.join(' ') || ''}`.toLowerCase();
        return deptKeywords.some(kw => cardText.includes(kw));
      });
      
      if (deptCards.length >= 2) {
        finalCards = deptCards;
        console.log(`🎯 Filtered to ${deptCards.length} ${topDepartment[0]}-specific cards`);
      }
    }
    
    // Return top 2 most relevant cards
    const topCards = finalCards.slice(0, 2);
    console.log('✅ FINAL SELECTION:', topCards.map(c => `${c.title} (${c.score})`).join(', '));
    
    return topCards;
  }, []);

  const addMessageWithResources = useCallback((type, content) => {
    // Turn off typing indicator when agent responds
    if (type === 'agent') {
      setIsAgentTyping(false);
      
      // CRITICAL: Check if this is the welcome message FIRST (before any detection)
      // The welcome message has specific text we can identify
      const isWelcomeMessage = content.includes('Thank you for reaching out') && 
                              content.includes('all calls and text exchanges are recorded');
      
      if (isWelcomeMessage) {
        console.log('🚫 WELCOME MESSAGE - No cards or resources will be shown for welcome message');
        addMessage(type, content);
        return;
      }
      
    console.log('✅ NOT welcome message - proceeding with detection');
    
    // Not the welcome message - proceed with card detection
    // CRITICAL: Detect cards FIRST, then add message with cards attached
    
    // Get last user message
    const userMessages = messages.filter(m => m.type === 'user' || m.source === 'user');
    const lastUserMsg = userMessages.slice(-1)[0];
    const lastUserMessage = lastUserMsg?.content || lastUserMsg?.message || '';
    
    console.log('🔍 User said:', lastUserMessage);
    console.log('🔍 Agent responding:', content.substring(0, 100) + '...');
    
    // Detect cards WITH the user message
    const detectedCards = detectCardsFromContext(lastUserMessage, content);
    
    // Search for relevant resources based on USER message
    const relevantResources = searchResources(lastUserMessage);
    console.log('🔍 Resources found (from user query):', relevantResources);
    
    // Prepare cards to attach
    let cardsToAttach = null;
    
    if (detectedCards.length > 0) {
      console.log('🎯 Detected cards:', detectedCards.map(c => c.title).join(', '));
      
      // ALWAYS attach detected cards to this message for persistence
      cardsToAttach = detectedCards;
      
      // Check if user explicitly requested or agent mentioned cards
      const isExplicitCardRequest = /show|display|see|view|card|information/i.test(lastUserMessage);
      const agentMentionsCard = /showing.*screen|display.*information|contact.*card|pulled up|I've pulled|I'm showing|I'm displaying/i.test(content);
      
      // Check if this is a NEW topic vs same topic
      const newTopic = detectedCards[0].title;
      const isTopicChange = currentTopic && newTopic !== currentTopic;
      
      // Update global state for bottom display if:
      // 1. No cards currently showing (!currentTopic) OR
      // 2. Topic changed (different from current) OR
      // 3. User explicitly requested to see cards OR
      // 4. Agent explicitly mentions showing cards
      if (!currentTopic || isTopicChange || isExplicitCardRequest || agentMentionsCard) {
        if (isExplicitCardRequest) {
          console.log('🔔 Explicit card request detected');
        }
        if (agentMentionsCard) {
          console.log('🤖 Agent mentioned showing cards');
        }
        if (isTopicChange) {
          console.log(`🔄 Topic changed: "${currentTopic}" → "${newTopic}"`);
        }
        if (!currentTopic) {
          console.log('🆕 First cards - displaying detected cards');
        }
        
        setCurrentTopic(newTopic);
        setCurrentToolCards(detectedCards);
        
        // Add to history
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date(),
          topic: newTopic,
          cards: detectedCards,
          userQuery: lastUserMessage
        };
        setConversationHistory(prev => [...prev, historyEntry]);
      } else {
        console.log('ℹ️ Same topic - but cards WILL attach to this message');
        // Still update currentToolCards to reflect latest
        setCurrentToolCards(detectedCards);
      }
    } else {
      // NO cards detected
      console.log('ℹ️ No cards detected for this message');
    }

      // Add the message WITH cards and/or resources attached if we have them
      if (cardsToAttach && cardsToAttach.length > 0) {
        console.log('💬 ✅ ATTACHING SERVICE CARDS TO MESSAGE:', cardsToAttach.map(c => c.title).join(', '));
        console.log('📋 Cards being attached:', JSON.stringify(cardsToAttach.map(c => ({ title: c.title, id: c.id })), null, 2));
        addMessage(type, content, relevantResources.length > 0 ? relevantResources : null, cardsToAttach);
        console.log('✅ Message added with cards successfully!');
        return;
      }
      
      if (relevantResources.length > 0) {
        addMessage(type, content, relevantResources);
        return;
      }
      
      addMessage(type, content);
    } else {
      // Non-agent messages
      addMessage(type, content);
    }
  }, [addMessage, currentTopic, detectCardsFromContext, currentToolCards]);
  // NOTE: Removed 'messages' from dependencies to prevent stale closure
  // We always use setMessages(currentMessages => ...) to read current state

  // Monitor conversation status to show typing indicator during agent processing
  useEffect(() => {
    if (!conversation?.status) return;
    
    const status = conversation.status;
    console.log('🔄 Conversation status:', status);
    
    // Show typing indicator when agent is processing or speaking
    if (status === 'speaking' || status === 'processing') {
      if (!isAgentTyping) {
        console.log('💬 Showing typing indicator (status:', status, ')');
        setIsAgentTyping(true);
      }
    } else if (status === 'idle' || status === 'listening') {
      if (isAgentTyping) {
        console.log('💤 Hiding typing indicator (status:', status, ')');
        setIsAgentTyping(false);
      }
    }
  }, [conversation?.status, isAgentTyping]);

  const handleConnect = async () => {
    if (isConnected) return;
    
    try {
      addMessage('system', 'Connecting to Jett with voice...');
      
      // Get signed URL from our API endpoint
      console.log('Fetching signed URL...');
      const signedUrlResponse = await fetch('/api/get-signed-url');
      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get signed URL from server');
      }
      const { signedUrl } = await signedUrlResponse.json();
      console.log('Got signed URL, starting voice session...');
      
      const conversationId = await conversation.startSession({
        signedUrl: signedUrl,
      });
      console.log('Connected with conversation ID:', conversationId);
      
      // Wait a moment for connection to fully establish
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Voice mode - microphone active AND Jett's audio UNMUTED (full volume)
      setIsMicMuted(false); // Unmute microphone via controlled prop
      setIsJettMuted(false); // Unmute Jett's audio for voice calls
      console.log('Voice mode: microphone unmuted, Jett audio UNMUTED (volume=100%)');
      
      addMessage('system', 'Voice chat connected. You can speak and hear Jett.');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        addMessage('error', 'Microphone permission denied. To use voice chat, please allow microphone access. You can still use text chat by typing a message.');
      } else {
        addMessage('error', `Failed to connect: ${error.message}`);
      }
    }
  };

  const handleCopyMessage = async (content, idx) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(idx);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDisconnect = () => {
    if (conversation.status === 'connected') {
      conversation.endSession();
    }
    
    setIsConnected(false);
    setIsMicMuted(false);
    setIsJettMuted(true); // Reset to muted by default
    addMessage('system', 'Conversation ended');
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const messageToSend = textInput.trim();
    
    // Detect Spanish in user input and auto-switch
    if (detectSpanish(messageToSend)) {
      console.log('🌐 Spanish detected in user input, switching UI to Spanish');
      setLanguage('es');
    }
    
    setTextInput('');
    setIsUserTyping(true);
    
    if (!isConnected) {
      try {
        addMessage('system', 'Connecting to Jett...');
        
        // Note: ElevenLabs Conversational AI requires microphone access even for text mode
        // We need to request it but will keep it muted
        addMessage('system', 'Please allow microphone access (it will be muted for text mode)');
        
        // Get signed URL from our API endpoint
        const signedUrlResponse = await fetch('/api/get-signed-url');
        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get signed URL from server');
        }
        const { signedUrl } = await signedUrlResponse.json();
        
        // Start session - this will trigger microphone permission request
        const conversationId = await conversation.startSession({
          signedUrl: signedUrl,
        });
        console.log('Connected with conversation ID (text mode):', conversationId);
        
        // Wait a moment for connection to fully establish
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Immediately mute microphone and audio for text-only mode (controlled by props)
        setIsMicMuted(true); // Mute microphone via controlled prop
        // isJettMuted is already true by default, volume prop keeps it at 0
        console.log('Text mode: microphone and audio both muted (micMuted=true, volume=0)');
        
        addMessage('system', 'Connected! Microphone and audio are muted. Type to chat.');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        addMessage('user', messageToSend);
        setIsUserTyping(false);
        setIsAgentTyping(true);
        console.log('Sending message:', messageToSend);
        conversation.sendUserMessage(messageToSend);
      } catch (error) {
        console.error('Failed to connect:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          addMessage('error', 'Microphone access is required to use Jett (even for text chat). Please click Allow when prompted, or click the phone icon to try again.');
        } else {
          addMessage('error', `Failed to connect: ${error.message}`);
        }
        return;
      }
    } else {
      addMessage('user', messageToSend);
      setIsUserTyping(false);
      setIsAgentTyping(true);
      
      try {
        console.log('Sending message to agent:', messageToSend);
        conversation.sendUserMessage(messageToSend);
        console.log('Message sent successfully');
      } catch (error) {
        console.error('Failed to send text message:', error);
        addMessage('error', `Failed to send message: ${error.message}`);
      }
    }
  };

  const handleToggleMicMute = () => {
    if (isMicMuted) {
      // Unmute microphone
      setIsMicMuted(false);
      console.log('Microphone unmuted by setting micMuted state to false');
      addMessage('system', 'Microphone unmuted - you can now speak');
    } else {
      // Mute microphone
      setIsMicMuted(true);
      console.log('Microphone muted by setting micMuted state to true');
      addMessage('system', 'Microphone muted');
    }
  };

  const handleToggleJettMute = () => {
    if (isJettMuted) {
      // Unmute Jett's audio output
      setIsJettMuted(false);
      console.log('Jett audio unmuted by setting volume state to 1');
      addMessage('system', 'Jett unmuted - you can now hear responses');
    } else {
      // Mute Jett's audio output
      setIsJettMuted(true);
      console.log('Jett audio muted by setting volume state to 0');
      addMessage('system', 'Jett muted');
    }
  };

  console.log('Widget render - isExpanded:', isExpanded);

  // Notify parent window of widget state changes
  const notifyParent = useCallback((type) => {
    if (window.parent !== window) {
      // Send message to parent iframe
      // Using '*' for origin since the parent domain may vary
      window.parent.postMessage({ type }, '*');
      console.log('Sent message to parent:', type);
    }
  }, []);

  // Notify parent when expansion state changes
  useEffect(() => {
    if (isExpanded) {
      notifyParent('widgetExpanded');
    } else {
      // Only notify collapse if we've been expanded before
      notifyParent('widgetCollapsed');
    }
  }, [isExpanded, notifyParent]);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleExpand = useCallback(() => {
    console.log('Button clicked, expanding widget');
    setIsExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    console.log('Closing widget');
    setIsExpanded(false);
  }, []);

  const handleMessageFeedback = useCallback(async (messageIndex, feedbackType) => {
    // Update local state immediately for instant UI feedback
    setMessageFeedback(prev => ({
      ...prev,
      [messageIndex]: feedbackType
    }));

    // Get the message and surrounding context
    const message = messages[messageIndex];
    const previousMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
    const nextMessage = messageIndex < messages.length - 1 ? messages[messageIndex + 1] : null;
    
    // Send to analytics endpoint with full context
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIndex,
          feedbackType,
          messageContent: message?.content,
          messageType: message?.type,
          messageTimestamp: message?.timestamp,
          previousMessage: previousMessage ? {
            content: previousMessage.content,
            type: previousMessage.type
          } : null,
          nextMessage: nextMessage ? {
            content: nextMessage.content,
            type: nextMessage.type
          } : null,
          conversationLength: messages.length,
          conversationId: `conversation_${Date.now()}`,
          timestamp: new Date().toISOString()
        }),
      });
      
      console.log('✅ Feedback submitted:', { 
        messageIndex, 
        feedbackType, 
        messageContent: message?.content?.substring(0, 100) + '...',
        context: `Previous: ${previousMessage?.type}, Next: ${nextMessage?.type}`
      });
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      // Still keep the UI feedback even if API fails
    }
  }, [messages]);

  const handleStarRating = useCallback(async (rating) => {
    // Update local state immediately
    setStarRating(rating);

    // Prepare conversation transcript with context
    const conversationTranscript = messages.map((msg, idx) => ({
      index: idx,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      resources: msg.resources ? msg.resources.map(r => ({ title: r.title, url: r.url })) : null
    }));

    const agentMessages = messages.filter(m => m.type === 'agent').length;
    const userMessages = messages.filter(m => m.type === 'user').length;

    // Send to analytics endpoint with full conversation context
    try {
      await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          conversationId: `conversation_${Date.now()}`,
          timestamp: new Date().toISOString(),
          totalMessages: messages.length,
          agentMessages,
          userMessages,
          conversationTranscript,
          sessionDuration: messages.length > 0 ? messages[messages.length - 1].timestamp - messages[0].timestamp : 0,
          isConnected
        }),
      });
      
      console.log('✅ Star rating submitted:', rating, `(${messages.length} messages in conversation)`);
      
      // After successful rating submission, show survey modal
      setShowSurveyModal(true);
    } catch (error) {
      console.error('❌ Failed to submit star rating:', error);
      // Still show survey even if API fails
      setShowSurveyModal(true);
    }
  }, [messages.length]);

  return (
    <div className={styles.pageContainer}>
      {/* Collapsed Widget Button */}
      {!isExpanded && (
        <>
          {/* Language Flags - Above Collapsed Widget */}
          {mounted && (
            <div className={styles.languageFlagsTop}>
              <button 
                className={`${styles.flagBtn} ${language === 'en' ? styles.flagActive : ''}`}
                onClick={() => setLanguage('en')}
                title="English"
              >
                <svg viewBox="0 0 60 30" className={styles.flagSvg}>
                  <rect width="60" height="30" fill="#b22234"/>
                  <rect width="60" height="2.31" y="0" fill="#fff"/>
                  <rect width="60" height="2.31" y="4.62" fill="#fff"/>
                  <rect width="60" height="2.31" y="9.23" fill="#fff"/>
                  <rect width="60" height="2.31" y="13.85" fill="#fff"/>
                  <rect width="60" height="2.31" y="18.46" fill="#fff"/>
                  <rect width="60" height="2.31" y="23.08" fill="#fff"/>
                  <rect width="60" height="2.31" y="27.69" fill="#fff"/>
                  <rect width="24" height="16.5" fill="#3c3b6e"/>
                  <g fill="#fff">
                    <g id="star">
                      <path d="M2,2 l0.5,1.5 h1.6 l-1.3,1 l0.5,1.5 l-1.3,-1 l-1.3,1 l0.5,-1.5 l-1.3,-1 h1.6 z"/>
                    </g>
                    <use href="#star" x="4"/><use href="#star" x="8"/><use href="#star" x="12"/><use href="#star" x="16"/><use href="#star" x="20"/>
                    <use href="#star" y="4.5" x="2"/><use href="#star" y="4.5" x="6"/><use href="#star" y="4.5" x="10"/><use href="#star" y="4.5" x="14"/><use href="#star" y="4.5" x="18"/>
                    <use href="#star" y="9" x="0"/><use href="#star" y="9" x="4"/><use href="#star" y="9" x="8"/><use href="#star" y="9" x="12"/><use href="#star" y="9" x="16"/><use href="#star" y="9" x="20"/>
                  </g>
                </svg>
              </button>
              <button 
                className={`${styles.flagBtn} ${language === 'es' ? styles.flagActive : ''}`}
                onClick={() => setLanguage('es')}
                title="Español"
              >
                <svg viewBox="0 0 60 30" className={styles.flagSvg}>
                  <rect width="60" height="30" fill="#AA151B"/>
                  <rect width="60" height="15" y="7.5" fill="#F1BF00"/>
                </svg>
              </button>
            </div>
          )}
          
          <button 
            className={styles.widgetButton}
            onClick={handleExpand}
            aria-label="Open Jett Chat"
          >
            {/* Old language selector - will remove */}
            {mounted && false && (
              <div className={styles.languageSelectorCollapsed}>
              <button 
                className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`}
                onClick={(e) => { e.stopPropagation(); setLanguage('en'); }}
                title="English"
              >
                🇺🇸
              </button>
              <div className={styles.langDivider}></div>
              <button 
                className={`${styles.langBtn} ${language === 'es' ? styles.langActive : ''}`}
                onClick={(e) => { e.stopPropagation(); setLanguage('es'); }}
                title="Español"
              >
                �🇸
              </button>
            </div>
          )}
          
          <div className={styles.widgetTop}>
            <div className={styles.widgetAvatar}>
              <Orb
                colors={["#3d6b8f", "#5a8bb8"]}
                agentState={isConnected ? (conversation.status === "speaking" ? "talking" : "listening") : null}
                getInputVolume={() => conversation.getInputVolume?.() ?? 0}
                getOutputVolume={() => conversation.getOutputVolume?.() ?? 0}
                className={styles.orbCanvas}
              />
            </div>
            <span className={styles.widgetGreeting} data-lang={language}>{mounted ? t.greeting : 'Hi, I\'m Jett - Test 👋!'}</span>
          </div>
          
          <div className={styles.widgetCta}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.487 17.14l-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a.997.997 0 0 0-.085-1.39z"/>
            </svg>
            <span>{mounted ? t.ctaText : 'How can I help you?'}</span>
          </div>
        </button>
        </>
      )}

      {/* Expanded Widget Window */}
      {isExpanded && (
        <div className={styles.widgetWindow}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetHeaderContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`${styles.orbContainer} ${isConnected && conversation.status === "speaking" ? styles.pulse : ''}`}>
                  <Orb
                    colors={["#3d6b8f", "#5a8bb8"]}
                    agentState={isConnected ? (conversation.status === "speaking" ? "talking" : "listening") : null}
                    getInputVolume={() => conversation.getInputVolume?.() ?? 0}
                    getOutputVolume={() => conversation.getOutputVolume?.() ?? 0}
                    className={styles.orbCanvas}
                  />
                </div>
                <div className={styles.widgetTitleSection}>
                  <h1>
                    <ShimmeringText 
                      text={t.title}
                      duration={1}
                      color="#000000"
                      shimmerColor="#ffffff"
                      spread={25}
                      repeatDelay={0.1}
                    />
                  </h1>
                  <p className={styles.widgetSubtitle}>
                    <ShimmeringText 
                      text={t.subtitle}
                      duration={1}
                      delay={0.15}
                      color="#000000"
                      shimmerColor="#ffffff"
                      spread={20}
                      repeatDelay={0.1}
                    />
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status and Language Row - Below main header */}
            <div className={styles.headerBottomRow}>
              <div className={styles.statusSection}>
                <span className={`${styles.statusIndicator} ${isConnected ? styles.online : styles.offline}`}></span>
                <span className={styles.statusText}>
                  {isConnected ? t.activelyOnCall : t.readyForCall}
                </span>
              </div>
              
              <div className={styles.languageSelectorBottom}>
              <button 
                className={`${styles.langBtnBottom} ${language === 'en' ? styles.langActiveBottom : ''}`}
                onClick={() => setLanguage('en')}
                title="English"
              >
                EN
              </button>
              <div className={styles.langDivider}></div>
              <button 
                className={`${styles.langBtnBottom} ${language === 'es' ? styles.langActiveBottom : ''}`}
                onClick={() => setLanguage('es')}
                title="Español"
              >
                ES
              </button>
            </div>
            </div>
            
            {conversationHistory.length > 0 && (
              <button 
                className={styles.widgetHistoryBtn}
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Toggle conversation history"
                title={`${conversationHistory.length} topics discussed`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                <span className={styles.historyBadge}>{conversationHistory.length}</span>
              </button>
            )}
            
            <button 
              className={styles.widgetCloseBtn}
              onClick={handleCollapse}
              aria-label="Close chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div className={styles.widgetContent}>
            <div className={styles.messagesContainer}>
              <div className={styles.messages}>
                {/* Welcome State - Always Visible */}
                <div className={styles.welcomeState}>
                  <h2>{t.welcome}</h2>
                  <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                    {t.welcomeMessage}
                  </p>
                  
                  {/* Quick Action Buttons */}
                  <div className={styles.quickActions}>
                    <a href="https://water.Odessatexas.gov/app/login.jsp" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                      </svg>
                      {t.payWaterBill}
                    </a>
                    <a href="https://seeclickfix.com/web_portal/4vRjnxZoH4QWRjsTQ2MY4B4V/report/category" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                      </svg>
                      {t.reportIssue}
                    </a>
                    <a href="https://www.Odessatexas.gov/1424/PermitOdessa" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      {t.permitOdessa}
                    </a>
                    <a href="https://experience.arcgis.com/experience/4cc2fed9276343f39056238d9936e4c6/" target="_blank" rel="noopener noreferrer" className={styles.quickActionBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {t.trafficAlerts}
                    </a>
                  </div>
                  
                  {messages.length === 0 && (
                    <>
                      <p>{t.textModeMessage}</p>
                      <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>{t.voiceModeHint}</p>
                    </>
                  )}
                </div>

                {/* Conversation Messages */}
                {messages.length > 0 && (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`${styles.messageWrapper} ${styles[msg.type + 'Wrapper']}`}>
                      {(msg.type === 'agent' || msg.type === 'user') && (
                        <div className={`${styles.messageOrbContainer} ${msg.type === 'agent' && idx === messages.length - 1 && conversation.status === "speaking" ? styles.pulse : ''}`}>
                          <div style={{ width: '28px', height: '28px' }}>
                            {Orb && (
                              <Orb 
                                colors={msg.type === 'agent' ? ["#3d6b8f", "#5a8bb8"] : ["#4a8fc7", "#6ba9d8"]}
                                agentState={msg.type === 'agent' ? 'speaking' : 'listening'}
                              />
                            )}
                          </div>
                        </div>
                      )}
                      <div className={`${styles.message} ${styles[msg.type]}`}>
                        {(msg.type === 'agent' || msg.type === 'user') && (
                          <button
                            className={`${styles.copyBtn} ${copiedMessageIndex === idx ? styles.copied : ''}`}
                            onClick={() => handleCopyMessage(msg.content, idx)}
                            title="Copy message"
                          >
                            {copiedMessageIndex === idx ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                {t.copied}
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                                {t.copy}
                              </>
                            )}
                          </button>
                        )}
                        <span className={styles.messageType}>
                          {msg.type === 'agent' ? 'Jett' : 
                           msg.type === 'user' ? 'User' :
                           msg.type === 'error' ? 'Error' : 'System'}
                        </span>
                        <span className={styles.messageContent}>
                          {parseMessageWithLinks(msg.content)}
                        </span>
                        
                        {/* Resource cards for relevant information */}
                        {msg.resources && msg.resources.length > 0 && (
                          <div className={styles.resourceSection}>
                            <div className={styles.resourceLabel}>{t.relatedResources}</div>
                            <ResourceGrid resources={msg.resources} />
                          </div>
                        )}
                        
                        {/* Service cards for city services - ONLY use serviceCards attached to message */}
                        {(() => {
                          if (msg.serviceCards && msg.serviceCards.length > 0) {
                            console.log(`🎨 RENDERING cards for message ${idx}:`, msg.serviceCards.map(c => c.title).join(', '));
                            return <ServiceCardGroup cards={msg.serviceCards} maxCards={2} language={language} />;
                          } else {
                            if (msg.type === 'agent' && idx > 1) { // Skip welcome message
                              console.log(`⚠️ Message ${idx} has NO serviceCards attached (type: ${msg.type})`);
                            }
                            return null;
                          }
                        })()}
                        
                        <div className={styles.messageFooter}>
                          <span className={styles.timestamp}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                          
                          {/* Feedback buttons for agent messages only */}
                          {msg.type === 'agent' && (
                            <div className={styles.feedbackButtons}>
                              <button
                                className={`${styles.feedbackBtn} ${messageFeedback[idx] === 'positive' ? styles.feedbackActive : ''}`}
                                onClick={() => handleMessageFeedback(idx, messageFeedback[idx] === 'positive' ? null : 'positive')}
                                title="Helpful"
                                aria-label="Mark as helpful"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                                </svg>
                              </button>
                              <button
                                className={`${styles.feedbackBtn} ${messageFeedback[idx] === 'negative' ? styles.feedbackActive : ''}`}
                                onClick={() => handleMessageFeedback(idx, messageFeedback[idx] === 'negative' ? null : 'negative')}
                                title="Not helpful"
                                aria-label="Mark as not helpful"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Typing Indicators */}
                {isAgentTyping && (
                  <div className={`${styles.messageWrapper} ${styles.agentWrapper}`}>
                    <div className={styles.messageOrbContainer}>
                      <div style={{ width: '28px', height: '28px' }}>
                        {Orb && (
                          <Orb 
                            colors={["#3d6b8f", "#5a8bb8"]}
                            agentState='speaking'
                          />
                        )}
                      </div>
                    </div>
                    <div className={`${styles.message} ${styles.agent}`}>
                      <span className={styles.messageType}>Jett</span>
                      <TypingIndicator type="agent" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Conversation History Panel */}
            {showHistory && conversationHistory.length > 0 && (
              <div className={styles.historyPanel}>
                <div className={styles.historyHeader}>
                  <div>
                    <h3>💬 Conversation History</h3>
                    <button
                      className={styles.historyClearBtn}
                      onClick={() => {
                        if (confirm('Clear all conversation history?')) {
                          setConversationHistory([]);
                          setShowHistory(false);
                        }
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                  <button 
                    className={styles.historyCloseBtn}
                    onClick={() => setShowHistory(false)}
                    aria-label="Close history"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.historyList}>
                  {conversationHistory.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={styles.historyItem}
                      onClick={() => {
                        // Restore the cards from this conversation
                        setCurrentToolCards(entry.cards);
                        
                        // Add a message to show what was recalled
                        addMessage('system', `📋 Showing information about: ${entry.topic}`);
                        
                        // Close history panel
                        setShowHistory(false);
                        
                        // Scroll to bottom to see the recalled cards
                        setTimeout(() => {
                          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      <div className={styles.historyItemHeader}>
                        <span className={styles.historyTopic}>{entry.topic}</span>
                        <span className={styles.historyTime}>
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={styles.historyQuery}>{entry.userQuery}</div>
                      <div className={styles.historyCards}>
                        {entry.cards.map((card, idx) => (
                          <span key={idx} className={styles.historyCardBadge}>{card.title}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.inputArea}>
              <form onSubmit={handleSendText} className={styles.inputForm}>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isConnected ? t.placeholderConnected : t.placeholderDisconnected}
                  className={styles.messageInput}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className={styles.sendBtn}
                  disabled={!textInput.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                  </svg>
                </button>
                
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleMicMute}
                      className={`${styles.micBtn} ${isMicMuted ? styles.muted : ''}`}
                      title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isMicMuted ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21h2v-3.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleJettMute}
                      className={`${styles.speakerBtn} ${isJettMuted ? styles.muted : ''}`}
                      title={isJettMuted ? "Unmute Jett's Audio" : "Mute Jett's Audio"}
                    >
                      {isJettMuted ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className={styles.disconnectBtn}
                      title="End Call"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnect}
                    className={styles.connectBtn}
                    title="Start Voice Call"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.487 17.14l-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a.997.997 0 0 0-.085-1.39z"/>
                    </svg>
                  </button>
                )}
              </form>
            </div>

            <div className={styles.widgetFooter}>
              <div className={styles.widgetFooterContent}>
                <div className={styles.footerActions}>
                  <div className={styles.starRating}>
                    <span className={styles.ratingLabel}>{t.rateExperience}</span>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`${styles.starBtn} ${star <= (hoveredStar || starRating) ? styles.starActive : ''}`}
                          onClick={() => handleStarRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          aria-label={`Rate ${star} stars`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <span className={styles.poweredBy}>{t.poweredBy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className={styles.surveyModalOverlay} onClick={() => setShowSurveyModal(false)}>
          <div className={styles.surveyModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.surveyModalHeader}>
              <h2 className={styles.surveyModalTitle}>
                {language === 'en' ? 'Help Us Improve' : 'Ayúdanos a Mejorar'}
              </h2>
              <button 
                className={styles.surveyModalClose}
                onClick={() => setShowSurveyModal(false)}
                aria-label="Close survey"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className={styles.surveyModalBody}>
              <iframe
                src="https://cityofOdessatx.gov1.qualtrics.com/jfe/form/SV_0OPsa3AFYQafkSa"
                className={styles.surveyIframe}
                title="Customer Satisfaction Survey"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
