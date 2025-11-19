/**
 * Jett - City of Odessa AI Assistant
 * ElevenLabs Conversational AI + ANAM Avatar Integration
 * ElevenLabs provides LLM/logic, ANAM provides visual avatar with lip sync
 */

// Import service cards data
import { serviceCards, searchCards, getCardById } from './service-cards.js';
// Import simple cards for UI display
import { serviceCards as simpleCards } from './service-cards-simple.js';

// Expose comprehensive cards globally for voice navigation
window.serviceCards = serviceCards;
window.searchCards = searchCards;

// Defensive guard: attempt original observe first; if it throws a TypeError due to an
// invalid target (common when extensions call observe with non-Node values), swallow
// that specific error and warn instead of letting it bubble and break the page.
// This approach avoids incorrectly rejecting valid cross-realm Node objects (e.g. from
// iframes) while still protecting against bad inputs.
if (typeof MutationObserver !== 'undefined' && MutationObserver.prototype) {
    const _origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function(target, options) {
        try {
            // Prefer calling the native implementation; it correctly accepts cross-realm Nodes.
            return _origObserve.call(this, target, options);
        } catch (err) {
            // If the native observe throws a TypeError about the first parameter, swallow it
            // and log a warning to avoid uncaught exceptions from third-party scripts.
            try {
                const isTypeError = err instanceof TypeError || (err && /parameter 1|not of type 'Node'/.test(err.message));
                if (isTypeError) {
                    console.warn('Safe guard: MutationObserver.observe failed for target (ignored):', target, err);
                    return;
                }
            } catch (inner) {
                // If checking the error fails for any reason, fall through to rethrow the original
            }
            // Re-throw unexpected errors so they can be handled normally
            throw err;
        }
    };
}

/**
 * Haptic Feedback Utility
 * Provides strong haptic feedback on mobile devices that support it
 */
function triggerHaptic(style = 'medium') {
    // Check if the Vibration API is supported
    if ('vibrate' in navigator) {
        // Different vibration patterns for different interactions
        const patterns = {
            light: 10,      // Quick tap
            medium: 20,     // Button press
            heavy: [20, 10, 20], // Important action
            success: [10, 20, 10, 20], // Positive feedback
            error: [50, 30, 50] // Error/warning
        };
        
        navigator.vibrate(patterns[style] || patterns.medium);
    }
}

// Application state
const state = {
    config: null,
    anamClient: null,
    elevenLabsSocket: null,
    audioStream: null,
    audioContext: null,
    audioProcessor: null,
    isStreaming: false,
    isMicMuted: false,
    isAgentMuted: false,
    currentResponseText: '',
    isSpeaking: false,
    conversationMessages: [], // Store conversation history for context
    lastUserMessage: '', // Track last user message for card detection
    messageFeedback: {}, // Track thumbs up/down per message index
    starRating: 0, // Overall conversation rating (1-5)
    hoveredStar: 0, // For star hover effects
    currentLanguage: 'en' // Current UI language
};

// Translations
const translations = {
    en: {
        appTitle: 'Jett',
        appSubtitle: 'City of Odessa AI Assistant',
        statusInitializing: 'Initializing...',
        statusConnecting: 'Connecting...',
        statusConnected: 'Connected',
        statusDisconnected: 'Disconnected',
        startConversation: 'Start Conversation',
        endConversation: 'End Conversation',
        muteMic: 'Mute Mic',
        unmuteMic: 'Unmute Mic',
        muteAgent: 'Mute Agent',
        unmuteAgent: 'Unmute Agent',
        textChat: 'Text Chat',
        infoText: 'Click "Start Conversation" to speak with Jett. Allow microphone access when prompted.',
        conversationTitle: 'Conversation',
        welcomeTitle: 'Welcome to Jett!',
        welcomeMessage: "I'm your AI assistant for City of Odessa services. Start a conversation to ask me anything about city services, utilities, permits, and more.",
        quickServices: 'Quick Links and Services',
        searchAllServices: 'Search All Services',
        rateExperience: 'Rate your experience:',
        valueFeedback: 'We value your feedback',
        userLabel: 'User',
        agentLabel: 'Jett',
        errorTitle: 'Error',
        retry: 'Retry',
        poor: 'Very Poor',
        fair: 'Poor',
        good: 'Fair',
        veryGood: 'Good',
        excellent: 'Excellent',
        helpful: 'Helpful',
        notHelpful: 'Not helpful',
        poweredBy: 'Powered by Dr. Steven Sierra Alcabes',
        searchPlaceholder: 'Search all city services...',
        recentSearches: 'Recent Searches',
        clearAll: 'Clear All',
        categoryAll: 'All',
        categoryGovernment: 'Government',
        categorySafety: 'Safety',
        categoryUtilities: 'Utilities',
        categoryRecreation: 'Recreation',
        categoryBusiness: 'Business',
        categoryTransportation: 'Transport',
        resetFilters: 'Reset Filters',
        noResultsTitle: 'No services found',
        noResultsMessage: 'Try adjusting your search or filter criteria',
        resultsFound: '{count} services found'
    },
    es: {
        appTitle: 'Jett',
        appSubtitle: 'Asistente de IA de la Ciudad de Odessa',
        statusInitializing: 'Inicializando...',
        statusConnecting: 'Conectando...',
        statusConnected: 'Conectado',
        statusDisconnected: 'Desconectado',
        startConversation: 'Iniciar Conversación',
        endConversation: 'Terminar Conversación',
        muteMic: 'Silenciar Micrófono',
        unmuteMic: 'Activar Micrófono',
        muteAgent: 'Silenciar Agente',
        unmuteAgent: 'Activar Agente',
        textChat: 'Chat de Texto',
        infoText: 'Haz clic en "Iniciar Conversación" para hablar con Jett. Permite el acceso al micrófono cuando se solicite.',
        conversationTitle: 'Conversación',
        welcomeTitle: '¡Bienvenido a Jett!',
        welcomeMessage: 'Soy tu asistente de IA para los servicios de la Ciudad de Odessa. Inicia una conversación para preguntarme sobre servicios municipales, servicios públicos, permisos y más.',
        quickServices: 'Enlaces y Servicios Rápidos',
        searchAllServices: 'Buscar Todos los Servicios',
        rateExperience: 'Califica tu experiencia:',
        valueFeedback: 'Valoramos tus comentarios',
        userLabel: 'Usuario',
        agentLabel: 'Jett',
        errorTitle: 'Error',
        retry: 'Reintentar',
        poor: 'Muy Malo',
        fair: 'Malo',
        good: 'Regular',
        veryGood: 'Bueno',
        excellent: 'Excelente',
        helpful: 'Útil',
        notHelpful: 'No útil',
        poweredBy: 'Diseñado y Desarollado por Dr. Steven Sierra Alcabes',
        searchPlaceholder: 'Buscar todos los servicios de la ciudad...',
        recentSearches: 'Búsquedas Recientes',
        clearAll: 'Borrar Todo',
        categoryAll: 'Todos',
        categoryGovernment: 'Gobierno',
        categorySafety: 'Seguridad',
        categoryUtilities: 'Servicios Públicos',
        categoryRecreation: 'Recreación',
        categoryBusiness: 'Negocios',
        categoryTransportation: 'Transporte',
        resetFilters: 'Restablecer Filtros',
        noResultsTitle: 'No se encontraron servicios',
        noResultsMessage: 'Intenta ajustar tus criterios de búsqueda o filtros',
        resultsFound: '{count} servicios encontrados'
    }
};

// DOM Elements
const elements = {
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    muteMicBtn: document.getElementById('mute-mic-btn'),
    muteAgentBtn: document.getElementById('mute-agent-btn'),
    textChatBtn: document.getElementById('text-chat-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
    statusIndicator: document.getElementById('status-indicator'),
    statusText: document.querySelector('.status-text'),
    statusDot: document.querySelector('.status-dot'),
    errorModal: document.getElementById('error-modal'),
    errorMessage: document.getElementById('error-message'),
    errorCloseBtn: document.getElementById('close-error-modal'),
    closeErrorModal: document.getElementById('close-error-modal'), // Add alias for consistency
    retryBtn: document.getElementById('retry-btn'), // Add retry button
    transcriptContainer: document.getElementById('transcript-container'),
    transcript: document.getElementById('transcript'),
    serviceCards: document.getElementById('service-cards'),
    serviceCardsGrid: document.querySelector('.service-cards-grid'),
    languageToggle: document.getElementById('language-toggle'),
    currentFlag: document.getElementById('current-flag'),
    waveformContainer: document.getElementById('waveform-container'),
    anamVideo: document.getElementById('anam-video'),
    idleVideo: document.getElementById('idle-video')
};
// Idle video control
/**
 * Ensure idle video is playing, unmuted state should remain muted per requirement.
 */
function startIdleVideo() {
    const v = elements.idleVideo;
    if (!v) return;
    try {
        v.muted = true;
        v.loop = true;
        // Some browsers require play() to be called programmatically
        const p = v.play();
        if (p && p.then) p.catch(() => { /* autoplay blocked; user interaction required */ });
        v.style.display = 'block';
        v.style.opacity = '1';
    } catch (e) {
        console.warn('Failed to start idle video:', e);
    }
}

function stopIdleVideo() {
    const v = elements.idleVideo;
    if (!v) return;
    try {
        v.pause();
        v.style.opacity = '0';
        setTimeout(() => {
            v.style.display = 'none';
        }, 500);
    } catch (e) {
        console.warn('Failed to stop idle video:', e);
    }
}

function showIdleVideo() {
    const v = elements.idleVideo;
    if (!v) return;
    v.style.display = 'block';
    setTimeout(() => {
        v.style.opacity = '1';
        try { v.play().catch(() => {}); } catch (e) {}
    }, 50);
}

function hideIdleVideo() {
    const v = elements.idleVideo;
    if (!v) return;
    v.style.opacity = '0';
    setTimeout(() => { v.style.display = 'none'; }, 500);
}

/**
 * Switch UI language
 */
function switchLanguage(lang) {
    state.currentLanguage = lang;
    
    // Save preference to localStorage
    localStorage.setItem('preferredLanguage', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update elements with data-i18n-title attribute (for tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('title', translations[lang][key]);
        }
    });
    
    // Update flag icon
    if (elements.currentFlag) {
        if (lang === 'en') {
            elements.currentFlag.src = '/icons/flag-usa.svg';
            elements.currentFlag.alt = 'English';
        } else {
            elements.currentFlag.src = '/icons/flag-spain.svg';
            elements.currentFlag.alt = 'Español';
        }
    }
    
    // Re-render service cards with new language
    loadServiceCards();
    
    console.log(`🌐 Language switched to: ${lang === 'en' ? 'English' : 'Español'}`);
}

/**
 * Detect if text is Spanish and auto-switch language
 * @param {string} text - The text to analyze
 */
function detectAndSwitchLanguage(text) {
    if (!text) return;
    
    // Common Spanish words and patterns
    const spanishIndicators = [
        // Greetings and common phrases
        'hola', 'buenos', 'días', 'tardes', 'noches', 'gracias', 'por favor', 'ayuda',
        'necesito', 'quiero', 'puedo', 'dónde', 'cuándo', 'cómo', 'qué', 'cuál',
        'está', 'están', 'tengo', 'tiene', 'soy', 'eres', 'somos', 'hacer', 'favor',
        // City services in Spanish
        'agua', 'basura', 'permiso', 'permisos', 'multa', 'policía', 'bomberos',
        'parque', 'parques', 'mascota', 'animal', 'concejo', 'alcalde', 'ciudad',
        'servicio', 'servicios', 'pago', 'factura', 'trabajo', 'empleo',
        // Questions in Spanish
        'dónde está', 'cómo puedo', 'qué es', 'cuánto cuesta', 'cuándo abre',
        // Verbs and common actions
        'hablar', 'llamar', 'ir', 'venir', 'pagar', 'solicitar', 'reportar',
        'encontrar', 'buscar', 'necesitar', 'informacion', 'información',
        // Additional common words
        'si', 'no', 'porque', 'entonces', 'ahora', 'aquí', 'allí', 'muy',
        'también', 'pero', 'más', 'menos', 'todo', 'nada', 'algo', 'alguien',
        'siempre', 'nunca', 'hoy', 'mañana', 'ayer', 'semana', 'mes', 'año',
        // Pronouns and articles
        'yo', 'tú', 'él', 'ella', 'nosotros', 'ustedes', 'ellos', 'mi', 'tu',
        'su', 'nuestro', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
        // Municipal services
        'biblioteca', 'recreación', 'transporte', 'autobús', 'tráfico',
        'estacionamiento', 'construcción', 'zoning', 'planificación'
    ];
    
    // English indicators to avoid false positives
    const englishIndicators = [
        'hello', 'hi', 'thank', 'please', 'help', 'need', 'want', 'where', 'when',
        'how', 'what', 'can', 'could', 'would', 'should', 'water', 'trash', 'permit',
        'police', 'fire', 'park', 'pet', 'city', 'service', 'payment', 'bill', 'job',
        'the', 'is', 'are', 'have', 'has', 'do', 'does', 'will', 'would',
        'library', 'recreation', 'transport', 'bus', 'traffic', 'parking'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Count Spanish indicators
    let spanishCount = 0;
    spanishIndicators.forEach(word => {
        if (lowerText.includes(word)) {
            spanishCount++;
        }
    });
    
    // Count English indicators
    let englishCount = 0;
    englishIndicators.forEach(word => {
        if (lowerText.includes(word)) {
            englishCount++;
        }
    });
    
    // Check for Spanish-specific characters
    const hasSpanishChars = /[áéíóúñ¿¡]/i.test(text);
    if (hasSpanishChars) {
        spanishCount += 2; // Weight heavily
    }
    
    // Auto-switch if Spanish is detected
    if (spanishCount > englishCount && spanishCount >= 1) {
        if (state.currentLanguage !== 'es') {
            console.log('🌐 Spanish detected in input, auto-switching to Spanish');
            console.log(`   Detected ${spanishCount} Spanish indicators vs ${englishCount} English`);
            showToast('🇪🇸 Idioma cambiado a Español automáticamente', 'success', 4000);
            switchLanguage('es');
        }
    } else if (englishCount > spanishCount && englishCount >= 1) {
        if (state.currentLanguage !== 'en') {
            console.log('🌐 English detected in input, auto-switching to English');
            console.log(`   Detected ${englishCount} English indicators vs ${spanishCount} Spanish`);
            showToast('🇺🇸 Language automatically switched to English', 'success', 4000);
            switchLanguage('en');
        }
    }
}

/**
 * Detect language from browser or conversation
 */
function detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('es')) {
        return 'es';
    }
    
    return 'en'; // Default to English
}

/**
 * Initialize the application
 */
async function init() {
    try {
        console.log('🚀 Initializing Jett...');
        
        // Verify configuration
        console.log('✅ Configuration loaded');
        
        // Don't initialize ANAM yet - wait until user starts conversation
        // await initializeAnamClient();
        
        // Setup ALL event listeners (including star ratings)
        setupEventListeners();
        console.log('✅ Event listeners initialized');
        
        // Language toggle event listener
        if (elements.languageToggle) {
            elements.languageToggle.addEventListener('click', () => {
                triggerHaptic('strong'); // Strong haptic feedback for language toggle
                const newLang = state.currentLanguage === 'en' ? 'es' : 'en';
                switchLanguage(newLang);
            });
        }
        
        // Detect and apply initial language
        const initialLang = detectLanguage();
        switchLanguage(initialLang);
        
        console.log('✅ Jett initialized successfully');
        updateStatus('Ready', 'ready');
        
        // Load service cards
        loadServiceCards();
        
    // Start idle background video
    startIdleVideo();
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize application');
        updateStatus('Error', 'error');
    }
}

/**
 * Fetch configuration from server
 */
async function fetchConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error('Failed to fetch configuration');
        }
        return await response.json();
    } catch (error) {
        console.error('Config fetch error:', error);
        throw error;
    }
}

/**
 * Initialize ANAM client
 */
async function initializeAnamClient() {
    if (!window.anam) {
        throw new Error('ANAM SDK not loaded');
    }
    
    try {
        // Get session token from server
        const response = await fetch('/api/anam/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            // Try to get detailed error message from server
            let errorMessage = 'Failed to get ANAM session token';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
                
                // Add more context for specific error codes
                if (errorData.code === 'MISSING_CONFIG') {
                    errorMessage += ' - Server configuration issue. Please contact support.';
                } else if (errorData.code === 'TIMEOUT') {
                    errorMessage += ' - Request timed out. Please try again.';
                } else if (errorData.code === 'NETWORK_ERROR') {
                    errorMessage += ' - Network connectivity issue. Please check your connection and try again.';
                }
            } catch (e) {
                // If we can't parse the error, use the status text
                errorMessage = `Failed to get ANAM session token (${response.status} ${response.statusText})`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Create client with session token and persona configuration
        state.anamClient = window.anam.createClient(
            data.sessionToken,
            { personaId: data.personaId }
        );
        
        console.log('✅ ANAM client initialized with persona:', data.personaId);
    } catch (error) {
        console.error('Failed to initialize ANAM client:', error);
        throw error;
    }
}

/**
 * Setup event listeners for UI controls
 */
function setupEventListeners() {
    console.log('📋 Setting up event listeners...');
    
    // Setup main control buttons with null checks
    if (elements.startBtn) {
        elements.startBtn.addEventListener('click', () => {
            triggerHaptic('heavy');
            startConversation();
        });
        console.log('✅ Start button listener added');
    } else {
        console.error('❌ Start button not found!');
    }
    
    if (elements.stopBtn) {
        elements.stopBtn.addEventListener('click', () => {
            triggerHaptic('heavy');
            stopConversation();
        });
        console.log('✅ Stop button listener added');
    }
    
    if (elements.muteMicBtn) {
        elements.muteMicBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            toggleMicMute();
        });
        console.log('✅ Mute mic button listener added');
    }
    
    if (elements.muteAgentBtn) {
        elements.muteAgentBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            toggleAgentMute();
        });
        console.log('✅ Mute agent button listener added');
    }
    
    // Text chat button
    if (elements.textChatBtn) {
        elements.textChatBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            openTextChat();
        });
        console.log('✅ Text chat button listener added');
    }
    
    // Error modal buttons
    if (elements.closeErrorModal) {
        elements.closeErrorModal.addEventListener('click', () => {
            elements.errorModal.classList.add('hidden');
        });
        console.log('✅ Close error modal listener added');
    }
    
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', () => {
            elements.errorModal.classList.add('hidden');
            startConversation();
        });
        console.log('✅ Retry button listener added');
    }
    
    // Setup star rating event listeners
    console.log('⭐ Setting up star rating listeners...');
    const starButtons = document.querySelectorAll('.star-rating-btn');
    console.log(`⭐ Found ${starButtons.length} star buttons`);
    
    if (starButtons.length === 0) {
        console.error('❌ No star buttons found! Check HTML structure.');
    }
    
    starButtons.forEach((btn, index) => {
        console.log(`⭐ Adding listener to star button ${index + 1} with rating:`, btn.dataset.rating);
        
        btn.addEventListener('click', () => {
            const rating = parseInt(btn.dataset.rating);
            console.log('⭐⭐⭐ STAR CLICKED! Rating:', rating);
            triggerHaptic(rating === 5 ? 'success' : 'heavy'); // Success haptic for 5 stars
            handleStarRating(rating);
        });
        
        btn.addEventListener('mouseenter', () => {
            // Always show hover effect - cumulative from right to left
            const rating = parseInt(btn.dataset.rating);
            console.log(`🖱️ Hovering over star ${rating}`);
            triggerHaptic('light'); // Light haptic on hover
            
            // Only show hover if no rating has been permanently set
            if (state.starRating === 0) {
                state.hoveredStar = rating;
                showHoverEffect(rating);
            }
        });
    });
    
    console.log('⭐ Star rating listeners setup complete');
    
    const starRatingContainer = document.getElementById('star-rating-container');
    if (starRatingContainer) {
        starRatingContainer.addEventListener('mouseleave', () => {
            state.hoveredStar = 0;
            // Clear hover effects and restore active rating if exists
            clearHoverEffects();
            if (state.starRating > 0) {
                highlightStarsUpTo(state.starRating);
            }
        });
        console.log('⭐ Star rating container mouseleave listener added');
    } else {
        console.error('❌ Star rating container not found!');
    }
    
    // Global haptic feedback for all interactive elements
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .service-card, .card-link, .service-link');
        if (target) {
            // Check element type for appropriate haptic intensity
            if (target.classList.contains('service-card') || target.classList.contains('card-link') || target.classList.contains('service-link')) {
                triggerHaptic('light');
            } else if (target.tagName === 'A') {
                triggerHaptic('medium');
            }
            // Buttons already have their own haptic feedback in their click handlers
        }
    }, true); // Use capture phase to ensure haptic fires before navigation
    
    console.log('✅ All event listeners setup complete');
}

/**
 * Start the conversation
 */
async function startConversation() {
    try {
        console.log('🎙️ Starting conversation...');
        elements.startBtn.disabled = true;
        elements.loadingOverlay.classList.remove('hidden');
        updateStatus('Connecting...', 'connecting');
        
        // Initialize ANAM client if not already initialized
        if (!state.anamClient) {
            console.log('Initializing ANAM client...');
            await initializeAnamClient();
        }
        
        // Step 1: Get ElevenLabs signed URL
        console.log('Getting ElevenLabs signed URL...');
        const urlResponse = await fetch('/api/conversation/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!urlResponse.ok) {
            throw new Error('Failed to get ElevenLabs conversation URL');
        }
        
        const { signedUrl } = await urlResponse.json();
        console.log('✅ ElevenLabs signed URL received:', signedUrl ? 'Valid' : 'MISSING!');
        
        // Step 2: Start ANAM streaming
        console.log('🎥 Starting ANAM video stream...');
        await state.anamClient.streamToVideoAndAudioElements(
            'anam-video',  // video element ID
            'anam-video'   // audio element ID (same video element)
        );
        console.log('✅ ANAM streaming started');
        
        // Step 3: Request microphone access
        console.log('🎤 Requesting microphone access...');
        try {
            state.audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            console.log('✅ Microphone access granted');
        } catch (error) {
            throw new Error('Microphone access denied. Please allow microphone access and try again.');
        }
        
        // Step 4: Connect to ElevenLabs WebSocket
        console.log('Connecting to ElevenLabs WebSocket...');
        state.elevenLabsSocket = new WebSocket(signedUrl);
        
        // Setup ElevenLabs event handlers FIRST
        setupElevenLabsEventHandlers();
        
        // Wait for connection to open
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('WebSocket connection timeout'));
            }, 10000);
            
            state.elevenLabsSocket.addEventListener('open', () => {
                clearTimeout(timeout);
                console.log('✅ Connected to ElevenLabs WebSocket');
                console.log('WebSocket readyState:', state.elevenLabsSocket.readyState);
                console.log('WebSocket URL:', state.elevenLabsSocket.url);
                
                resolve();
            }, { once: true });
            
            state.elevenLabsSocket.addEventListener('error', (error) => {
                clearTimeout(timeout);
                console.error('WebSocket error:', error);
                reject(new Error('WebSocket connection failed'));
            }, { once: true });
        });
        
        // Send minimal init message - don't override agent config
        console.log('📤 Preparing init message...');
        const initMessage = {
            type: 'conversation_initiation_client_data'
        };
        
        console.log('📤 Sending init message:', initMessage);
        console.log('WebSocket state before send:', state.elevenLabsSocket.readyState);
        state.elevenLabsSocket.send(JSON.stringify(initMessage));
        console.log('✅ Init message sent');
        
        // Step 5: Start audio streaming
        console.log('🎵 Starting audio streaming...');
        startAudioStreaming();
        
        state.isStreaming = true;
        
    // Stop idle video and hide it, show ANAM video
    stopIdleVideo();
    hideIdleVideo();
        
        if (elements.anamVideo) {
            elements.anamVideo.style.display = 'block';
            setTimeout(() => {
                elements.anamVideo.style.opacity = '1';
            }, 50);
        }
        
        // Update UI
        elements.loadingOverlay.classList.add('hidden');
        elements.startBtn.style.display = 'none';
        elements.stopBtn.style.display = 'inline-flex';
        elements.muteMicBtn.style.display = 'inline-flex';
        elements.muteAgentBtn.style.display = 'inline-flex';
        updateStatus('Connected', 'connected');
        
        // Show waveform in idle mode
        showWaveform('idle');
        
        // Dispatch conversation started event for liquid morphing
        if (window.dispatchConversationStarted) {
            window.dispatchConversationStarted();
        }
        
        console.log('✅ Conversation started successfully');
        console.log('🎤 Speak now - ElevenLabs will process, ANAM will display!');
        
    } catch (error) {
        console.error('❌ Error starting conversation:', error);
        showError(error.message);
        elements.loadingOverlay.classList.add('hidden');
        elements.startBtn.disabled = false;
        updateStatus('Error', 'error');
        
        // Cleanup on error
        if (state.elevenLabsSocket) {
            state.elevenLabsSocket.close();
        }
        if (state.anamClient && state.isStreaming) {
            state.anamClient.stopStreaming();
        }
    }
}

/**
 * Start streaming audio from microphone to ElevenLabs
 */
function startAudioStreaming() {
    if (!state.audioStream || !state.elevenLabsSocket) {
        console.error('Cannot start audio streaming: missing audio stream or socket');
        return;
    }
    
    // Create audio context with 16kHz sample rate
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
    });
    
    const source = state.audioContext.createMediaStreamSource(state.audioStream);
    
    // Create script processor for audio data
    state.audioProcessor = state.audioContext.createScriptProcessor(2048, 1, 1);
    
    let audioChunkCount = 0;
    
    state.audioProcessor.onaudioprocess = (event) => {
        if (state.elevenLabsSocket && state.elevenLabsSocket.readyState === WebSocket.OPEN && !state.isMicMuted) {
            const inputData = event.inputBuffer.getChannelData(0);
            
            // Convert Float32Array to Int16Array (PCM16)
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            // Convert to base64 for JSON message format
            const uint8Array = new Uint8Array(pcm16.buffer);
            let binary = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64Audio = btoa(binary);
            
            // Send audio in ElevenLabs expected JSON format
            const audioMessage = {
                user_audio_chunk: base64Audio
            };
            
            audioChunkCount++;
            if (audioChunkCount % 50 === 0) {
                console.log(`🎤 Sent ${audioChunkCount} audio chunks to ElevenLabs`);
            }
            
            state.elevenLabsSocket.send(JSON.stringify(audioMessage));
        }
    };
    
    // Connect source to processor
    source.connect(state.audioProcessor);
    
    // Connect to a gain node set to 0 to keep the processor active without audio feedback
    const silentGain = state.audioContext.createGain();
    silentGain.gain.value = 0;
    state.audioProcessor.connect(silentGain);
    silentGain.connect(state.audioContext.destination);
    
    console.log('✅ Audio streaming started');
}

/**
 * Stop the conversation
 */
function stopConversation() {
    try {
        console.log('🛑 Stopping conversation...');
        updateStatus('Stopping...', 'connecting');
        
        // Stop audio processor
        if (state.audioProcessor) {
            state.audioProcessor.disconnect();
            state.audioProcessor = null;
        }
        
        // Stop audio stream
        if (state.audioStream) {
            state.audioStream.getTracks().forEach(track => track.stop());
            state.audioStream = null;
        }
        
        // Close audio context
        if (state.audioContext) {
            state.audioContext.close();
            state.audioContext = null;
        }
        
        // Close WebSocket
        if (state.elevenLabsSocket && state.isStreaming) {
            state.elevenLabsSocket.close();
            state.elevenLabsSocket = null;
        }
        
        // Stop ANAM streaming
        if (state.anamClient && state.isStreaming) {
            state.anamClient.stopStreaming();
            state.isStreaming = false;
        }
        
        // Hide ANAM video and show slideshow
        if (elements.anamVideo) {
            elements.anamVideo.style.opacity = '0';
            setTimeout(() => {
                elements.anamVideo.style.display = 'none';
            }, 500);
        }
        
        // Show idle video and restart playback
        setTimeout(() => {
            showIdleVideo();
        }, 500);
        
        // Reset UI
        elements.stopBtn.style.display = 'none';
        elements.muteMicBtn.style.display = 'none';
        elements.muteAgentBtn.style.display = 'none';
        elements.startBtn.style.display = 'inline-flex';
        elements.startBtn.disabled = false;
        updateStatus('Ready', 'connected');
        
        // Hide waveform
        hideWaveform();
        
        // Dispatch conversation stopped event for liquid morphing
        if (window.dispatchConversationStopped) {
            window.dispatchConversationStopped();
        }
        
        console.log('✅ Conversation stopped');
        
    } catch (error) {
        console.error('❌ Error stopping conversation:', error);
        showError('Failed to stop conversation properly');
    }
}

/**
 * Toggle microphone mute/unmute
 */
function toggleMicMute() {
    state.isMicMuted = !state.isMicMuted;
    
    if (state.isMicMuted) {
        // Disconnect audio processor to prevent voice interruption
        if (state.audioProcessor) {
            try {
                state.audioProcessor.disconnect();
                console.log('🎤 Audio processor disconnected');
            } catch (e) {
                console.warn('Audio processor already disconnected');
            }
        }
        
        // Disable microphone tracks
        if (state.audioStream) {
            state.audioStream.getAudioTracks().forEach(track => {
                track.enabled = false;
            });
        }
        
        elements.muteMicBtn.textContent = '🎤 Unmute Mic';
        console.log('🎤 Microphone muted - Voice interruption disabled');
    } else {
        // Re-enable microphone tracks
        if (state.audioStream) {
            state.audioStream.getAudioTracks().forEach(track => {
                track.enabled = true;
            });
        }
        
        // Reconnect audio processor
        if (state.audioProcessor && state.audioContext) {
            try {
                const silentGain = state.audioContext.createGain();
                silentGain.gain.value = 0;
                state.audioProcessor.connect(silentGain);
                silentGain.connect(state.audioContext.destination);
                console.log('🎤 Audio processor reconnected');
            } catch (e) {
                console.warn('Failed to reconnect audio processor:', e);
            }
        }
        
        elements.muteMicBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span data-i18n="muteMic">Mute Mic</span>
        `;
        console.log('🎤 Microphone unmuted - Voice interruption enabled');
    }
}

/**
 * Toggle agent audio mute/unmute
 */
function toggleAgentMute() {
    state.isAgentMuted = !state.isAgentMuted;
    
    // Mute/unmute ANAM video output
    if (elements.anamVideo) {
        elements.anamVideo.muted = state.isAgentMuted;
    }
    
    // Update button UI
    if (state.isAgentMuted) {
        elements.muteAgentBtn.textContent = '� Unmute Agent';
        console.log('🔇 Agent audio muted');
    } else {
        elements.muteAgentBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <span data-i18n="muteAgent">Mute Agent</span>
        `;
        console.log('🔊 Agent audio unmuted');
    }
}

/**
 * Open text chat in a popup window
 */
function openTextChat() {
    const url = 'https://www.perplexity.ai/spaces/Jett-2-0-city-of-Odessa-tx-UNjkz8egR0uvRgHoYPf8Qw#0';
    
    // Calculate centered position
    const width = 1200;
    const height = 800;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    // Open in a popup window with specific dimensions
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=no`;
    
    const popup = window.open(url, 'JettTextChat', features);
    
    if (popup) {
        popup.focus();
        console.log('💬 Text chat popup opened');
    } else {
        console.warn('⚠️ Popup blocked - please allow popups for this site');
        // Fallback: open in new tab
        window.open(url, '_blank');
    }
}

/**
 * Close text chat (no-op for popup approach, kept for compatibility)
 */
function closeTextChat() {
    console.log('💬 Text chat close called (popup manages its own window)');
}

/**
 * Setup ElevenLabs WebSocket event handlers
 */
function setupElevenLabsEventHandlers() {
    if (!state.elevenLabsSocket) return;
    
    state.elevenLabsSocket.addEventListener('message', (event) => {
        // Handle binary data (audio)
        if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
            return; // Ignore audio data - ANAM handles speech
        }
        
        try {
            const data = JSON.parse(event.data);
            
            // Handle different message types
            switch (data.type) {
                case 'conversation_initiation_metadata':
                    console.log('🎬 Conversation initiated');
                    // Conversation is ready - first message should come separately
                    // or will be triggered when user speaks
                    break;
                    
                case 'audio':
                    // We don't use ElevenLabs audio - ANAM will handle it
                    break;
                    
                case 'user_transcript':
                    // User speech was transcribed
                    if (data.user_transcription_event?.user_transcript) {
                        const userText = data.user_transcription_event.user_transcript;
                        console.log('👤 You said:', userText);
                        
                        // Show user speaking waveform
                        showWaveform('user-speaking');
                        
                        // Detect voice commands for star rating
                        detectStarRatingCommand(userText);

                        // Detect and auto-switch language based on user speech
                        detectAndSwitchLanguage(userText);

                        // Detect voice commands that should open service links or cards
                        // (e.g. "open permits", "take me to water account", "abrir permisos")
                        detectOpenServiceCardCommand(userText);
                        
                        // Store last user message for card detection
                        state.lastUserMessage = userText;
                        
                        addTranscriptMessage('user', userText);
                        
                        // Show typing indicator after user message
                        showTypingIndicator();
                        
                        // Enable thinking vignette
                        setThinkingMode(true);
                    }
                    break;
                    
                case 'agent_response':
                    // Full agent response with transcript
                    if (data.agent_response_event?.agent_response) {
                        const responseText = data.agent_response_event.agent_response;
                        console.log('🤖 ElevenLabs full response:', responseText);
                        
                        // Show AI speaking waveform
                        showWaveform('ai-speaking');
                        
                        // Hide typing indicator
                        hideTypingIndicator();
                        
                        // Disable thinking vignette
                        setThinkingMode(false);
                        
                        // Detect and auto-switch language based on agent speech
                        detectAndSwitchLanguage(responseText);
                        
                        // Detect relevant service cards based on context
                        const relevantCards = detectCardsFromContext(state.lastUserMessage, responseText);
                        
                        // Send text to ANAM for speech
                        sendTextToAnam(responseText);
                        
                        // Add message with detected cards
                        addTranscriptMessage('agent', responseText, relevantCards);
                        
                        state.currentResponseText = '';
                        
                        // Return waveform to idle after 2 seconds
                        setTimeout(() => showWaveform('idle'), 2000);
                    } else if (state.currentResponseText) {
                        // If no full response but we have accumulated text
                        console.log('🤖 Sending accumulated text:', state.currentResponseText);
                        
                        // Hide typing indicator
                        hideTypingIndicator();
                        
                        // Detect and auto-switch language
                        detectAndSwitchLanguage(state.currentResponseText);
                        
                        // Detect relevant service cards
                        const relevantCards = detectCardsFromContext(state.lastUserMessage, state.currentResponseText);
                        
                        sendTextToAnam(state.currentResponseText);
                        addTranscriptMessage('agent', state.currentResponseText, relevantCards);
                        
                        state.currentResponseText = '';
                    }
                    break;
                    
                case 'agent_chat_response_part':
                    // Streaming text chunks - accumulate them
                    if (data.text_response_part && data.text_response_part.text) {
                        state.currentResponseText += data.text_response_part.text;
                    }
                    break;
                    
                case 'interruption':
                    console.log('🚫 User interrupted');
                    state.currentResponseText = '';
                    state.isSpeaking = false;
                    break;
                    
                case 'ping':
                    // Respond to ping with pong
                    if (state.elevenLabsSocket.readyState === WebSocket.OPEN) {
                        const pongMessage = {
                            type: 'pong',
                            event_id: data.ping_event?.event_id || Date.now()
                        };
                        state.elevenLabsSocket.send(JSON.stringify(pongMessage));
                    }
                    break;
                    
                case 'error':
                    console.error('❌ ElevenLabs error:', data);
                    showError(`Conversation error: ${data.message || 'Unknown error'}`);
                    break;
                    
                default:
                    // Silently handle other message types
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error, event.data);
        }
    });
    
    state.elevenLabsSocket.addEventListener('close', (event) => {
        console.log('🔌 ElevenLabs connection closed:', event.code, event.reason);
        if (state.isStreaming) {
            updateStatus('Disconnected', 'error');
            showError('Connection closed unexpectedly');
        }
    });
    
    state.elevenLabsSocket.addEventListener('error', (error) => {
        console.error('❌ ElevenLabs WebSocket error:', error);
        showError('Connection error occurred');
    });
    
    console.log('✅ ElevenLabs event handlers registered');
}

/**
 * Send text to ANAM for speech and lip sync
 */
async function sendTextToAnam(text) {
    if (!state.anamClient || !text || state.isSpeaking) {
        return;
    }
    
    try {
        state.isSpeaking = true;
        console.log('💬 Sending to ANAM:', text);
        
        // Use ANAM's talk method to make the avatar speak
        await state.anamClient.talk(text);
        
        // Wait a bit before allowing next message
        setTimeout(() => {
            state.isSpeaking = false;
            state.currentResponseText = '';
        }, 1000);
        
    } catch (error) {
        console.error('Error sending text to ANAM:', error);
        state.isSpeaking = false;
    }
}

/**
 * Update status indicator
 */
function updateStatus(text, status) {
    elements.statusText.textContent = text;
    elements.statusDot.className = 'status-dot';
    
    if (status === 'connected') {
        elements.statusDot.classList.add('connected');
    } else if (status === 'error') {
        elements.statusDot.classList.add('error');
    }
}

/**
 * Show error modal
 */
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.style.display = 'flex';
}

/**
 * Hide error modal
 */
function hideError() {
    elements.errorModal.style.display = 'none';
}

/**
 * Detect relevant service cards based on conversation context
 * Analyzes both user message and agent response to find matching cards
 * @param {string} userMessage - The user's question or statement
 * @param {string} agentResponse - The agent's response
 * @returns {Array} Array of relevant service card objects (max 2)
 */
function detectCardsFromContext(userMessage, agentResponse) {
    console.log('🔍 Card detection starting...');
    console.log('   User said:', userMessage?.substring(0, 100) + '...');
    console.log('   Agent said:', agentResponse?.substring(0, 100) + '...');
    
    // Prevent showing cards on welcome message
    const isWelcomeMessage = agentResponse && (
        agentResponse.includes('all calls and text exchanges are recorded') ||
        agentResponse.includes('training and monitoring purposes') ||
        state.conversationMessages.length === 0
    );
    
    if (isWelcomeMessage) {
        console.log('🚫 Skipping cards - this is the welcome message');
        return [];
    }
    
    // Combine user message and agent response for analysis
    const userText = (userMessage || '').toLowerCase().trim();
    const agentText = (agentResponse || '').toLowerCase().trim();
    const combinedText = `${userText} ${agentText}`;
    
    // Check minimum length requirement
    if (combinedText.length < 30) {
        console.log('🚫 Combined text too short:', combinedText.length, 'chars');
        return [];
    }
    
    // Search for relevant cards using the imported search function
    console.log('🔍 Searching cards with query:', combinedText.substring(0, 100) + '...');
    let matchingCards = searchCards(combinedText);
    
    if (matchingCards.length === 0) {
        console.log('⚠️ No cards found by keyword search');
        return [];
    }
    
    console.log(`📋 Found ${matchingCards.length} potential cards:`, matchingCards.map(c => c.title).join(', '));
    
    // Score each card based on keyword matches
    const scoredCards = matchingCards.map(card => {
        let score = 0;
        const keywords = card.keywords || [];
        
        // Check each keyword against user and agent text
        keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            
            // Perfect exact match in user message (highest score)
            if (userText === keywordLower) {
                score += 50;
            }
            
            // Word boundary match in user message (very strong)
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
    
    console.log('📊 Top card scores:', scoredCards.slice(0, 5).map(c => `${c.title}: ${c.score}`).join(', '));
    
    // Minimum score threshold
    const MIN_SCORE = 8;
    const relevantCards = scoredCards.filter(card => card.score >= MIN_SCORE);
    
    if (relevantCards.length === 0) {
        console.log('⚠️ No cards meet threshold (min: 8)');
        return [];
    }
    
    // Return top 2 most relevant cards
    const topCards = relevantCards.slice(0, 2);
    console.log('✅ Final cards:', topCards.map(c => `${c.title} (score: ${c.score})`).join(', '));
    
    return topCards;
}

/**
 * Handle thumbs up/down feedback for individual messages
 * @param {number} messageIndex - Index of the message in conversationMessages
 * @param {string} feedbackType - 'positive', 'negative', or null to clear
 */
async function handleMessageFeedback(messageIndex, feedbackType) {
    // Update local state immediately for instant UI feedback
    state.messageFeedback[messageIndex] = feedbackType;
    
    // Update UI
    updateMessageFeedbackUI(messageIndex, feedbackType);
    
    // Get message context
    const message = state.conversationMessages[messageIndex];
    const previousMessage = messageIndex > 0 ? state.conversationMessages[messageIndex - 1] : null;
    const nextMessage = messageIndex < state.conversationMessages.length - 1 ? 
        state.conversationMessages[messageIndex + 1] : null;
    
    // Send to analytics endpoint
    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messageIndex,
                feedbackType,
                messageContent: message?.text,
                messageType: message?.role,
                messageTimestamp: message?.timestamp,
                previousMessage: previousMessage ? {
                    content: previousMessage.text,
                    type: previousMessage.role
                } : null,
                nextMessage: nextMessage ? {
                    content: nextMessage.text,
                    type: nextMessage.role
                } : null,
                conversationLength: state.conversationMessages.length,
                timestamp: new Date().toISOString()
            }),
        });
        
        console.log('✅ Feedback submitted:', { 
            messageIndex, 
            feedbackType, 
            messageContent: message?.text?.substring(0, 100) + '...'
        });
    } catch (error) {
        console.error('❌ Failed to submit feedback:', error);
    }
}

/**
 * Detect star rating voice commands and auto-rate
 * @param {string} text - The spoken text to analyze
 */
function detectStarRatingCommand(text) {
    if (!text) return;
    
    const lowerText = text.toLowerCase().trim();
    
    // Rating patterns with numbers (English and Spanish)
    const numberPatterns = [
        // English number patterns
        { pattern: /\b(one|1)\s*(star|stars?)\b/i, rating: 1 },
        { pattern: /\b(two|2)\s*(star|stars?)\b/i, rating: 2 },
        { pattern: /\b(three|3)\s*(star|stars?)\b/i, rating: 3 },
        { pattern: /\b(four|4)\s*(star|stars?)\b/i, rating: 4 },
        { pattern: /\b(five|5)\s*(star|stars?)\b/i, rating: 5 },
        // Spanish number patterns
        { pattern: /\b(una|1)\s*(estrella|estrellas?)\b/i, rating: 1 },
        { pattern: /\b(dos|2)\s*(estrella|estrellas?)\b/i, rating: 2 },
        { pattern: /\b(tres|3)\s*(estrella|estrellas?)\b/i, rating: 3 },
        { pattern: /\b(cuatro|4)\s*(estrella|estrellas?)\b/i, rating: 4 },
        { pattern: /\b(cinco|5)\s*(estrella|estrellas?)\b/i, rating: 5 }
    ];
    
    // Quality level patterns (English and Spanish)
    const qualityPatterns = [
        // English quality levels
        { pattern: /\b(very\s+poor|terrible|awful|worst)\b/i, rating: 1 },
        { pattern: /\b(poor|bad|not\s+good)\b/i, rating: 2 },
        { pattern: /\b(fair|okay|ok|average|decent)\b/i, rating: 3 },
        { pattern: /\b(good|nice|great)\b/i, rating: 4 },
        { pattern: /\b(excellent|outstanding|amazing|perfect|best|wonderful|fantastic)\b/i, rating: 5 },
        // Spanish quality levels
        { pattern: /\b(muy\s+mal|terrible|pésimo|muy\s+pobre)\b/i, rating: 1 },
        { pattern: /\b(mal|malo|no\s+bueno|pobre)\b/i, rating: 2 },
        { pattern: /\b(regular|justo|promedio)\b/i, rating: 3 },
        { pattern: /\b(bien|bueno|buen)\b/i, rating: 4 },
        { pattern: /\b(excelente|maravilloso|increíble|perfecto|fantástico)\b/i, rating: 5 }
    ];
    
    // Rating context phrases
    const ratingPhrases = [
        /rate\s*(it|this|you|the\s+service|my\s+experience)/i,
        /give\s*(you|it|this|the\s+service)/i,
        /calificar|dar\s+una\s+calificación/i,
        /mi\s+experiencia|servicio/i
    ];
    
    // Check if user is trying to give a rating
    const isRatingContext = ratingPhrases.some(phrase => phrase.test(lowerText));
    
    // Check number patterns
    for (const { pattern, rating } of numberPatterns) {
        if (pattern.test(lowerText)) {
            console.log(`⭐ Voice command detected: ${rating} stars`);
            handleStarRating(rating);
            showToast(`⭐ Rated ${rating} star${rating !== 1 ? 's' : ''}!`, 'success', 3000);
            return;
        }
    }
    
    // Check quality patterns (only if in rating context or clear quality statement)
    if (isRatingContext || lowerText.length < 50) { // Short statements likely about rating
        for (const { pattern, rating } of qualityPatterns) {
            if (pattern.test(lowerText)) {
                const qualityTexts = {
                    1: 'Very Poor',
                    2: 'Poor',
                    3: 'Fair',
                    4: 'Good',
                    5: 'Excellent'
                };
                console.log(`⭐ Voice command detected: ${qualityTexts[rating]} (${rating} stars)`);
                handleStarRating(rating);
                showToast(`⭐ Rated ${rating} star${rating !== 1 ? 's' : ''} - ${qualityTexts[rating]}!`, 'success', 3000);
                return;
            }
        }
    }
}

/**
 * Detect voice phrase that should open a service card/link and open it.
 * Searches visible `.service-card` elements for best match against spoken keywords.
 * Opens the first `.service-link` anchor found in the matched card.
 * @param {string} text
 */
function detectOpenServiceCardCommand(text) {
    if (!text) return;

    const lower = text.toLowerCase().trim();
    console.log('🔍 Voice navigation: analyzing "' + text + '"');

    // Intent phrases indicating the user wants us to open/navigate
    const intentPhrases = [
        /\b(open|go to|take me to|show me|launch|visit|abrir|ir a|mostrar|llevarme a|muéstrame)\b/i,
        /\b(open the|go to the|take me to the)\b/i
    ];

    const isIntent = intentPhrases.some(re => re.test(lower));
    console.log('🔍 Intent detected:', isIntent);

    // Create keyword tokens from user speech (minimal stop words - keep important service words)
    const stopwords = new Set(['the','to','a','an','and','or','me','please','por','la','el','que','de','en','it','this','that']);
    const tokens = (lower.match(/\b[\wáéíóúñ]+\b/g) || []).filter(w => w.length > 2 && !stopwords.has(w));
    console.log('🔍 Extracted tokens:', tokens);
    
    if (tokens.length === 0 && !isIntent) {
        console.log('🔍 No tokens or intent - skipping navigation');
        return;
    }

    // Score cards by token matches
    const visibleCards = Array.from(document.querySelectorAll('.service-card'));
    console.log('🔍 Found', visibleCards.length, 'visible service cards to check');
    
    let bestCard = null;
    let bestScore = 0;
    let bestTitle = '';
    let bestUrl = null;

    visibleCards.forEach(card => {
        const titleEl = card.querySelector('h4') || card.querySelector('h3');
        const title = titleEl ? titleEl.innerText.toLowerCase() : '';
        const textContent = (card.innerText || '').toLowerCase();
        let score = 0;
        
        tokens.forEach(t => {
            // Higher score for title matches
            if (title.includes(t)) score += 3;
            // Medium score for anywhere in card text
            else if (textContent.includes(t)) score += 1;
            // Boost for exact word boundary match in title
            if (title.match(new RegExp('\\b' + t + '\\b'))) score += 2;
        });

        // Prefer cards that have actionable links
        const link = card.querySelector('a.service-link, a.card-link, a[href]');
        if (!link || !link.href) {
            score = 0;
        }

        if (score > bestScore) {
            bestScore = score;
            bestCard = card;
            bestTitle = title;
            bestUrl = link ? link.href : null;
        }
        
        if (score > 0) {
            console.log('🔍 Card "' + title + '" score:', score);
        }
    });
    
    // Also search comprehensive cards (not yet rendered)
    if (typeof serviceCards !== 'undefined') {
        console.log('🔍 Also searching comprehensive cards catalog...');
        Object.entries(serviceCards).forEach(([id, card]) => {
            const title = (card.title || '').toLowerCase();
            const desc = (card.description || '').toLowerCase();
            const keywords = (card.keywords || []).map(k => k.toLowerCase());
            let score = 0;
            
            tokens.forEach(t => {
                // Score title matches
                if (title.includes(t)) score += 3;
                if (title.match(new RegExp('\\b' + t + '\\b'))) score += 2;
                
                // Score keyword matches (high priority)
                if (keywords.some(k => k.includes(t))) score += 4;
                
                // Score description matches
                if (desc.includes(t)) score += 1;
            });
            
            if (card.url && score > bestScore) {
                bestScore = score;
                bestCard = null; // Not visible yet
                bestTitle = card.title;
                bestUrl = card.url;
                console.log('🔍 Comprehensive card "' + card.title + '" score:', score);
            }
        });
    }

    console.log('🔍 Best match: "' + bestTitle + '" with score:', bestScore);

    // If there's a strong match (>=2 score) or explicit intent + any match, open it
    if ((bestScore >= 2 || (isIntent && bestScore > 0)) && bestUrl) {
        console.log('✅ Voice navigation: opening', bestTitle, '->', bestUrl);
        showToast(`✅ Opening ${bestTitle}...`, 'success', 2500);

        if (bestCard) {
            // Visual highlight for visible cards
            bestCard.classList.add('service-card-opening');
            setTimeout(() => bestCard.classList.remove('service-card-opening'), 2000);
        }

        // Click the link directly (links have target="_blank") to avoid pop-up blocker
        if (bestCard) {
            const link = bestCard.querySelector('a.service-link, a.card-link, a[href]');
            if (link) {
                try {
                    link.click();
                    console.log('✅ Link clicked successfully');
                } catch (err) {
                    console.error('❌ Failed to click link:', err);
                    window.open(bestUrl, '_blank', 'noopener,noreferrer');
                }
            }
        } else {
            // Comprehensive card not visible - open URL directly
            window.open(bestUrl, '_blank', 'noopener,noreferrer');
        }
    } else {
        console.log('❌ No good match found (best score:', bestScore, ', intent:', isIntent, ')');
    }
}

/**
 * Handle star rating for overall conversation
 * @param {number} rating - Star rating from 1-5
 */
async function handleStarRating(rating) {
    console.log('⭐ Star rating clicked:', rating);
    
    // Update local state
    state.starRating = rating;
    console.log('⭐ Updated state.starRating to:', state.starRating);
    
    // Update UI - keep stars highlighted
    updateStarRatingUI(rating);
    console.log('⭐ UI updated for rating:', rating);
    
    // Trigger confetti for 5-star ratings!
    if (rating === 5) {
        console.log('🎉🎉🎉 5-STAR RATING! TRIGGERING CONFETTI! 🎉🎉🎉');
        try {
            triggerConfetti();
            triggerScreenShake();
            triggerScreenFlash();
            console.log('✅ Confetti triggered successfully');
        } catch (error) {
            console.error('❌ Confetti error:', error);
        }
    }
    
    // Prepare conversation transcript
    const conversationTranscript = state.conversationMessages.map((msg, idx) => ({
        index: idx,
        type: msg.role,
        content: msg.text,
        timestamp: msg.timestamp
    }));
    
    const agentMessages = state.conversationMessages.filter(m => m.role === 'agent').length;
    const userMessages = state.conversationMessages.filter(m => m.role === 'user').length;
    
    // Send to analytics endpoint
    try {
        const response = await fetch('/api/rating', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rating,
                timestamp: new Date().toISOString(),
                totalMessages: state.conversationMessages.length,
                agentMessages,
                userMessages,
                conversationTranscript,
                sessionDuration: state.conversationMessages.length > 0 ? 
                    state.conversationMessages[state.conversationMessages.length - 1].timestamp - 
                    state.conversationMessages[0].timestamp : 0,
            }),
        });
        
        console.log('✅ Star rating submitted:', rating);
    } catch (error) {
        console.error('❌ Failed to submit star rating:', error);
    }
}

/**
 * Update the feedback button UI for a specific message
 */
function updateMessageFeedbackUI(messageIndex, feedbackType) {
    const messageElements = document.querySelectorAll('.transcript-message.agent-message');
    const messageElement = messageElements[Math.floor(messageIndex / 2)]; // Approximate since user/agent alternate
    
    if (messageElement) {
        const thumbsUpBtn = messageElement.querySelector('.feedback-thumbs-up');
        const thumbsDownBtn = messageElement.querySelector('.feedback-thumbs-down');
        
        if (thumbsUpBtn && thumbsDownBtn) {
            thumbsUpBtn.classList.toggle('feedback-active', feedbackType === 'positive');
            thumbsDownBtn.classList.toggle('feedback-active', feedbackType === 'negative');
        }
    }
}

/**
 * Update the star rating UI
 */
function updateStarRatingUI(rating) {
    highlightStarsUpTo(rating);
}

/**
 * Highlight stars up to the given rating (for permanent selection)
 */
function highlightStarsUpTo(rating) {
    console.log('⭐ highlightStarsUpTo called with rating:', rating);
    const stars = document.querySelectorAll('.star-rating-btn');
    const feedbackElement = document.querySelector('.star-rating-feedback-header');
    console.log('⭐ Found', stars.length, 'star buttons');
    
    // Keep "We value your feedback" - don't change it after rating
    
    stars.forEach((star, index) => {
        const starRating = parseInt(star.dataset.rating);
        console.log(`⭐ Star ${index + 1} has data-rating=${starRating}, checking if <= ${rating}`);
        
        // Remove all previous rating classes and hover classes
        star.classList.remove('rating-1', 'rating-2', 'rating-3', 'rating-4', 'rating-5');
        
        if (starRating <= rating) {
            star.classList.add('star-active');
            // ALL stars get the same rating class based on the highest rating selected
            star.classList.add(`rating-${rating}`);
            console.log(`⭐ Added star-active and rating-${rating} to star ${starRating}`);
        } else {
            star.classList.remove('star-active');
            console.log(`⭐ Removed star-active from star ${starRating}`);
        }
    });
    
    // Log final state
    const activeStars = document.querySelectorAll('.star-rating-btn.star-active');
    console.log('⭐ Total active stars after update:', activeStars.length);
}

/**
 * Show hover effect for stars (for preview before clicking)
 */
function showHoverEffect(rating) {
    console.log('🖱️ showHoverEffect called with rating:', rating);
    const stars = document.querySelectorAll('.star-rating-btn');
    const feedbackElement = document.querySelector('.star-rating-feedback-header');
    
    // Update feedback text during hover - but keep "We value your feedback!" as the main text
    const feedbackTexts = {
        1: 'Very Poor',
        2: 'Poor',
        3: 'Fair',
        4: 'Good',
        5: 'Excellent'
    };
    
    // Show individual rating description on the hovered star (via tooltip/title attribute)
    stars.forEach((star) => {
        const starRating = parseInt(star.dataset.rating);
        
        // Remove all hover classes first
        star.classList.remove('hover-1', 'hover-2', 'hover-3', 'hover-4', 'hover-5');
        
        // Update tooltip to show description for this specific star
        if (starRating === rating) {
            star.setAttribute('title', feedbackTexts[rating] || '');
        }
        
        // ALL stars get the same hover class based on the rating being hovered
        if (starRating <= rating) {
            star.classList.add(`hover-${rating}`);
            console.log(`🖱️ Added hover-${rating} to star ${starRating}`);
        }
    });
}

/**
 * Clear all hover effects
 */
function clearHoverEffects() {
    const stars = document.querySelectorAll('.star-rating-btn');
    const feedbackElement = document.querySelector('.star-rating-feedback-header');
    
    stars.forEach(star => {
        star.classList.remove('hover-1', 'hover-2', 'hover-3', 'hover-4', 'hover-5');
        // Reset tooltips to original values
        const rating = parseInt(star.dataset.rating);
        const tooltips = {
            1: 'Very Poor',
            2: 'Poor',
            3: 'Fair',
            4: 'Good',
            5: 'Excellent'
        };
        star.setAttribute('title', tooltips[rating] || '');
    });
    
    // Keep "We value your feedback" always visible - don't change it
    if (feedbackElement && state.starRating === 0) {
        feedbackElement.textContent = 'We value your feedback';
    }
    
    console.log('🖱️ Cleared all hover effects');
}

/**
 * Clear all star highlights
 */
function clearStarHighlights() {
    const stars = document.querySelectorAll('.star-rating-btn');
    stars.forEach(star => {
        star.classList.remove('star-active');
    });
}

/**
 * Update star hover effects
 */
function updateStarHoverUI(rating) {
    highlightStarsUpTo(rating);
}

/**
 * Trigger screen shake effect
 */
function triggerScreenShake() {
    // Disable screen shake on mobile devices
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    if (isMobile) return;
    
    const appContainer = document.getElementById('app-container');
    appContainer.classList.add('screen-shake');
    setTimeout(() => appContainer.classList.remove('screen-shake'), 500);
}

/**
 * Trigger screen flash effect
 */
function triggerScreenFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

/**
 * Toggle thinking vignette effect
 */
function setThinkingMode(isThinking) {
    const appContainer = document.getElementById('app-container');
    if (isThinking) {
        appContainer.classList.add('thinking');
    } else {
        appContainer.classList.remove('thinking');
    }
}

/**
 * Show waveform visualization
 * @param {string} mode - 'user-speaking', 'ai-speaking', or 'idle'
 */
function showWaveform(mode = 'idle') {
    if (elements.waveformContainer) {
        elements.waveformContainer.classList.remove('hidden', 'user-speaking', 'ai-speaking', 'speaking');
        
        if (mode === 'user-speaking') {
            elements.waveformContainer.classList.add('user-speaking', 'speaking');
        } else if (mode === 'ai-speaking') {
            elements.waveformContainer.classList.add('ai-speaking', 'speaking');
        }
    }
}

/**
 * Hide waveform visualization
 */
function hideWaveform() {
    if (elements.waveformContainer) {
        elements.waveformContainer.classList.add('hidden');
        elements.waveformContainer.classList.remove('user-speaking', 'ai-speaking', 'speaking');
    }
}

/**
 * Show typing indicator in transcript
 */
function showTypingIndicator() {
    // Remove any existing typing indicator first
    hideTypingIndicator();
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.id = 'typing-indicator';
    
    // Create glowing dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'typing-dots';
    
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        dotsContainer.appendChild(dot);
    }
    
    // Create text
    const textSpan = document.createElement('span');
    textSpan.className = 'typing-indicator-text';
    textSpan.textContent = 'Jett is thinking...';
    
    indicatorDiv.appendChild(dotsContainer);
    indicatorDiv.appendChild(textSpan);
    
    // Add to transcript
    elements.transcript.appendChild(indicatorDiv);
    
    // Scroll to bottom
    elements.transcript.scrollTop = elements.transcript.scrollHeight;
}

/**
 * Hide typing indicator from transcript
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Add a message to the transcript display
 * @param {string} role - 'user' or 'agent'
 * @param {string} text - The message text
 * @param {Array} cards - Optional service cards to display with the message
 */
function addTranscriptMessage(role, text, cards = null) {
    // Show transcript container if hidden
    if (elements.transcriptContainer.style.display === 'none') {
        elements.transcriptContainer.style.display = 'block';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `transcript-message ${role}-message`;
    
    // Add label (Agent or User)
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? translations[state.currentLanguage].userLabel : translations[state.currentLanguage].agentLabel;
    
    // Create bubble container
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg><span class="copy-text">Copy</span>`;
    copyBtn.onclick = async (e) => {
        e.stopPropagation();
        triggerHaptic('light'); // Light haptic for copy action
        try {
            await navigator.clipboard.writeText(text);
            const textSpan = copyBtn.querySelector('.copy-text');
            const originalText = textSpan.textContent;
            textSpan.textContent = 'Copied';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                textSpan.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };
    content.appendChild(copyBtn);
    
    // Format timestamp with date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = `${dateStr} at ${timeStr}`;
    
    bubble.appendChild(content);
    
    // Add feedback buttons for agent messages
    if (role === 'agent') {
        const messageIndex = state.conversationMessages.length;
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'message-feedback';
        
        const thumbsUpBtn = document.createElement('button');
        thumbsUpBtn.className = 'feedback-btn feedback-thumbs-up';
        thumbsUpBtn.title = translations[state.currentLanguage].helpful;
        thumbsUpBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
        </svg>`;
        thumbsUpBtn.onclick = (e) => {
            e.stopPropagation();
            triggerHaptic('medium'); // Medium haptic for feedback
            const currentFeedback = state.messageFeedback[messageIndex];
            handleMessageFeedback(messageIndex, currentFeedback === 'positive' ? null : 'positive');
        };
        
        const thumbsDownBtn = document.createElement('button');
        thumbsDownBtn.className = 'feedback-btn feedback-thumbs-down';
        thumbsDownBtn.title = translations[state.currentLanguage].notHelpful;
        thumbsDownBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
        </svg>`;
        thumbsDownBtn.onclick = (e) => {
            e.stopPropagation();
            triggerHaptic('medium'); // Medium haptic for feedback
            const currentFeedback = state.messageFeedback[messageIndex];
            handleMessageFeedback(messageIndex, currentFeedback === 'negative' ? null : 'negative');
        };
        
        feedbackContainer.appendChild(thumbsUpBtn);
        feedbackContainer.appendChild(thumbsDownBtn);
        bubble.appendChild(feedbackContainer);
    }
    
    // Add service cards if provided
    if (cards && cards.length > 0) {
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'message-service-cards';
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'message-service-card';
            
            // Use current language for title and description
            const title = state.currentLanguage === 'es' && card.titleEs ? card.titleEs : card.title;
            const description = state.currentLanguage === 'es' && card.descriptionEs ? card.descriptionEs : card.description;
            
            // Build card HTML
            let cardHTML = `
                <div class="card-header">
                    <h5>${title}</h5>
                </div>
                <div class="card-body">
                    <p>${description}</p>
            `;
            
            // Add links from the links array (new format)
            if (card.links && card.links.length > 0) {
                const linksHTML = card.links.map(link => {
                    const linkText = state.currentLanguage === 'es' && link.textEs ? link.textEs : link.text;
                    return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="card-link">${linkText}</a>`;
                }).join('');
                cardHTML += `<div class="card-links">${linksHTML}</div>`;
            }
            // Fallback to old format if links array doesn't exist
            else {
                const contactLinks = [];
                if (card.phone) {
                    contactLinks.push(`<a href="tel:${card.phone}" class="card-link">📞 ${card.phone}</a>`);
                }
                if (card.email) {
                    contactLinks.push(`<a href="mailto:${card.email}" class="card-link">✉️ Email</a>`);
                }
                if (card.url) {
                    contactLinks.push(`<a href="${card.url}" target="_blank" rel="noopener noreferrer" class="card-link">🔗 Visit Website</a>`);
                }
                
                if (contactLinks.length > 0) {
                    cardHTML += `<div class="card-links">${contactLinks.join('')}</div>`;
                }
            }
            
            cardHTML += '</div>';
            cardElement.innerHTML = cardHTML;
            cardsContainer.appendChild(cardElement);
        });
        
        content.appendChild(cardsContainer);
        console.log(`📇 Rendered ${cards.length} service cards:`, cards.map(c => c.title).join(', '));
    }
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestamp);
    elements.transcript.appendChild(messageDiv);
    
    // Store message in conversation history
    state.conversationMessages.push({
        role: role,
        text: text,
        timestamp: Date.now(),
        cards: cards
    });
    
    // Auto-scroll to bottom
    elements.transcript.scrollTop = elements.transcript.scrollHeight;
}

/**
 * Load and display default service cards (simpleCards)
 * These are always visible and NOT affected by search
 */
async function loadServiceCards() {
    try {
        const defaultGrid = document.getElementById('default-cards-grid');
        const serviceCardsContainer = document.getElementById('service-cards');
        
        if (!defaultGrid) return;
        
        // Display default service cards using simpleCards
        defaultGrid.innerHTML = '';
        simpleCards.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            
            // Use current language for title and description
            const title = state.currentLanguage === 'es' && service.titleEs ? service.titleEs : service.title;
            const description = state.currentLanguage === 'es' && service.descriptionEs ? service.descriptionEs : service.description;
            
            // Render icon - support SVG, Lottie JSON, image files, or emoji/fallback
            let iconHTML = '';
            if (service.icon) {
                const iconLower = service.icon.toLowerCase();
                if (iconLower.endsWith('.svg')) {
                    iconHTML = `<img src="${service.icon}" alt="${title}" class="service-icon-svg" />`;
                } else if (iconLower.endsWith('.json')) {
                    // Use Lottie webcomponent to play animation
                    iconHTML = `<lottie-player src="${service.icon}" background="transparent" speed="1" loop autoplay class="service-lottie" aria-label="${title}"></lottie-player>`;
                } else if (iconLower.match(/\.(png|jpg|jpeg|gif)$/)) {
                    iconHTML = `<img src="${service.icon}" alt="${title}" class="service-icon-svg" />`;
                } else {
                    // Treat as emoji or plain text
                    iconHTML = `<div class="service-icon">${service.icon}</div>`;
                }
            } else {
                iconHTML = `<div class="service-icon">📋</div>`;
            }
            
            let cardHTML = `
                ${iconHTML}
                <h4>${title}</h4>
                <p>${description}</p>
            `;
            
            // Add links
            if (service.links && service.links.length > 0) {
                const linksHTML = service.links.map(link => {
                    const linkText = state.currentLanguage === 'es' && link.textEs ? link.textEs : link.text;
                    return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="service-link" onclick="event.stopPropagation()">${linkText}</a>`;
                }).join('');
                cardHTML += `<div class="service-links">${linksHTML}</div>`;
            }
            
            card.innerHTML = cardHTML;
            defaultGrid.appendChild(card);
            
            // Add Lottie hover speed control
            const lottiePlayer = card.querySelector('.service-lottie');
            if (lottiePlayer) {
                card.addEventListener('mouseenter', () => {
                    lottiePlayer.setSpeed(1.8);
                });
                card.addEventListener('mouseleave', () => {
                    lottiePlayer.setSpeed(1);
                });
            }
        });
        
        // Show default cards container
        if (serviceCardsContainer) {
            serviceCardsContainer.style.display = 'block';
        }
        
        // Show search section
        const searchSection = document.getElementById('search-all-services');
        if (searchSection) {
            searchSection.style.display = 'block';
        }
        
        console.log('✅ Default service cards loaded:', simpleCards.length);
        
        // Initialize search system for comprehensive catalog
        if (typeof initSearchAndFilter === 'function') {
            initSearchAndFilter();
        }
    } catch (error) {
        console.error('Error loading service cards:', error);
    }
}


// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (state.anamClient && state.isStreaming) {
        state.anamClient.stopStreaming();
    }
    if (state.elevenLabsSocket) {
        state.elevenLabsSocket.close();
    }
});

// Export for debugging
window.JettApp = {
    state,
    startConversation,
    stopConversation,
    toggleMicMute,
    toggleAgentMute
};

/* ============================================
   NEW UI ENHANCEMENTS
   ============================================ */

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.classList.add('toast-exit'); setTimeout(() => this.parentElement.remove(), 300)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-dismiss
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Status Badge Update Function
function updateStatusBadge(status) {
    const badge = document.getElementById('status-badge');
    if (!badge) return;
    
    badge.className = 'status-badge';
    badge.classList.add(`status-${status}`);
}

// Dark Mode Toggle
function initDarkMode() {
    console.log('🌓 Initializing dark mode...');
    const toggle = document.getElementById('dark-mode-toggle');
    const icon = document.getElementById('dark-mode-icon');
    const logo = document.querySelector('.city-logo');
    
    console.log('🌓 Dark mode elements:', { 
        toggle: toggle, 
        toggleExists: !!toggle, 
        icon: icon, 
        iconExists: !!icon, 
        logo: logo,
        logoExists: !!logo 
    });
    
    if (!toggle) {
        console.error('❌ Dark mode toggle button not found!');
        return;
    }
    
    // Check saved preference
    const savedMode = localStorage.getItem('darkMode');
    console.log('🌓 Saved dark mode preference:', savedMode);
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (icon) icon.textContent = '🌙';
        if (logo) logo.src = '/icons/City_of_Odessa,_Texas_logo.png';
        console.log('🌓 Restored dark mode from localStorage');
    }
    
    // Toggle handler
    toggle.addEventListener('click', (e) => {
        console.log('🌓 Dark mode toggle clicked!', e);
        triggerHaptic('strong'); // Strong haptic feedback for toggle
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        console.log('🌓 Body classes:', document.body.className);
        console.log('🌓 Is dark mode?', isDark);
        
        // Update icon
        if (icon) {
            icon.textContent = isDark ? '🌙' : '☀️';
            console.log('🌓 Icon updated to:', icon.textContent);
        }
        
        // Update logo
        if (logo) {
            logo.src = isDark 
                ? '/icons/City_of_Odessa,_Texas_logo.png'
                : '/icons/City_of_Odessa,_Texas_logo.png';
            console.log('🌓 Logo updated to:', logo.src);
        }
        
        // Save preference
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        console.log(`🌓 Dark mode ${isDark ? 'enabled' : 'disabled'} - saved to localStorage`);
        
        // Show toast
        showToast(
            isDark ? 'Dark mode enabled' : 'Light mode enabled',
            'info',
            2000
        );
    });
    
    console.log('✅ Dark mode toggle listener attached successfully');
}

// Update existing functions to use toast and status badge
const originalStartConversation = startConversation;
startConversation = async function() {
    updateStatusBadge('connecting');
    showToast('Connecting to Jett...', 'info', 2000);
    
    try {
        await originalStartConversation();
        updateStatusBadge('connected');
        showToast('Connected! Start speaking or type a message.', 'success', 3000);
    } catch (error) {
        updateStatusBadge('disconnected');
        showToast('Connection failed. Please try again.', 'error', 4000);
        throw error;
    }
};

const originalStopConversation = stopConversation;
stopConversation = function() {
    originalStopConversation();
    updateStatusBadge('disconnected');
    showToast('Conversation ended', 'info', 2000);
};

const originalToggleMicMute = toggleMicMute;
toggleMicMute = function() {
    const wasMuted = state.isMicMuted;
    originalToggleMicMute();
    showToast(
        wasMuted ? 'Microphone unmuted' : 'Microphone muted',
        'info',
        2000
    );
};

const originalToggleAgentMute = toggleAgentMute;
toggleAgentMute = function() {
    const wasMuted = state.isAgentMuted;
    originalToggleAgentMute();
    showToast(
        wasMuted ? 'Agent audio unmuted' : 'Agent audio muted',
        'info',
        2000
    );
};

// Initialize new features
document.addEventListener('DOMContentLoaded', () => {
    // Dark mode is initialized at the end of the file
    
    // Add speaking status detection
    if (state.anamClient) {
        const originalOnStreamingStarted = state.anamClient.onstreamingstarted || (() => {});
        state.anamClient.onstreamingstarted = function() {
            updateStatusBadge('speaking');
            originalOnStreamingStarted.apply(this, arguments);
        };
        
        const originalOnStreamingStopped = state.anamClient.onstreamingstopped || (() => {});
        state.anamClient.onstreamingstopped = function() {
            updateStatusBadge('connected');
            originalOnStreamingStopped.apply(this, arguments);
        };
    }
});

// Add to window for global access
window.showToast = showToast;
window.updateStatusBadge = updateStatusBadge;
window.addTranscriptMessage = addTranscriptMessage;
window.detectCardsFromContext = detectCardsFromContext;

/* ============================================
   🎨 ADVANCED ANIMATIONS & EFFECTS
   ============================================ */

/**
 * 1. RIPPLE EFFECT ON ALL BUTTON CLICKS
 */
function createRipple(event) {
    const button = event.currentTarget;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    // Calculate ripple position
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    // Set ripple position and size
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // Add ripple to button
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * 2. 3D PARALLAX TILT EFFECT ON SERVICE CARDS (Mouse and Touch)
 */
function handleCardTilt(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Get coordinates from either mouse or touch event
    let clientX, clientY;
    if (event.type.startsWith('touch')) {
        const touch = event.touches[0] || event.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    // Calculate position relative to card center
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate normalized distance from center (-1 to 1)
    const relX = (x - centerX) / centerX;
    const relY = (y - centerY) / centerY;
    
    // Calculate distance from center (0 to ~1.4)
    const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
    
    // Dead zone in center (30% radius) - minimal effect when hovering center
    const deadZone = 0.3;
    if (distanceFromCenter < deadZone) {
        card.style.transform = 'perspective(1000px) scale3d(1.02, 1.02, 1.02)';
        return;
    }
    
    // Scale effect based on distance from dead zone
    const effectStrength = Math.min((distanceFromCenter - deadZone) / (1 - deadZone), 1);
    
    // Calculate rotation angles (max 20 degrees - increased for stronger effect) with reduced strength
    const rotateX = relY * -20 * effectStrength;
    const rotateY = relX * 20 * effectStrength;
    
    // Apply 3D transform with stronger scale and translateZ
    card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${1.02 + 0.08 * effectStrength}, ${1.02 + 0.08 * effectStrength}, ${1.02 + 0.08 * effectStrength})
        translateZ(${20 * effectStrength}px)
    `;
}

function resetCardTilt(event) {
    const card = event.currentTarget;
    card.style.transform = '';
}

/**
 * 3. CONFETTI ANIMATION ON 5-STAR RATINGS
 */
function triggerConfetti() {
    console.log('🎊 triggerConfetti() function called!');
    
    // Add screen flash effect
    const flash = document.createElement('div');
    flash.className = 'celebration-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
    
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti');
    console.log('🎊 Created confetti container');
    
    // Create MANY MORE confetti pieces for spectacular effect (150 instead of 50)
    for (let i = 0; i < 150; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        
        // Wider spread - position across full width and from top
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 40 - 20); // Drift left or right
        piece.style.setProperty('--start-x', `${startX}%`);
        piece.style.setProperty('--end-x', `${endX}%`);
        piece.style.left = `${startX}%`;
        
        // Varied timing for cascading effect
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
        
        // More vibrant colors with gold/sparkle emphasis
        const colors = [
            '#FFD700', '#FFA500', '#FF6B35', '#00A4E4', '#0052A5', 
            '#F7B731', '#5F27CD', '#00D2D3', '#FF9FF3', '#54A0FF', 
            '#48DBFB', '#1DD1A1', '#FFEB3B', '#FF1744', '#E040FB',
            '#FFFFFF', '#C0C0C0'  // Gold, white, silver emphasis
        ];
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Bigger, more visible pieces
        const size = 6 + Math.random() * 12;
        piece.style.width = `${size}px`;
        piece.style.height = `${size * 1.5}px`;
        
        // Random rotation for more dynamic movement
        piece.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
        
        confettiContainer.appendChild(piece);
    }
    
    console.log('🎊 Created 150 confetti pieces for SPECTACULAR celebration! 🎉');
    document.body.appendChild(confettiContainer);
    console.log('🎊 Confetti container added to body!');
    
    // Enhanced haptic feedback - multiple pulses
    try {
        triggerHaptic('success');
        setTimeout(() => triggerHaptic('success'), 200);
        setTimeout(() => triggerHaptic('success'), 400);
    } catch (e) {
        console.log('Haptic feedback not available');
    }
    
    // Remove confetti after animation (longer duration for bigger show)
    setTimeout(() => {
        confettiContainer.remove();
        console.log('🎊 Confetti removed after animation');
    }, 5000);
}

/**
 * Initialize all advanced effects
 */
function initAdvancedEffects() {
    // Add ripple effect to all buttons
    const buttons = document.querySelectorAll('.control-btn, .service-link, .quick-action-btn, .dark-mode-toggle, .language-toggle');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Add parallax tilt effect to all service cards (mouse and touch)
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        // Mouse events for desktop
        card.addEventListener('mousemove', handleCardTilt);
        card.addEventListener('mouseleave', resetCardTilt);
        
        // Touch events for mobile
        card.addEventListener('touchmove', handleCardTilt);
        card.addEventListener('touchend', resetCardTilt);
        card.addEventListener('touchcancel', resetCardTilt);
        
        // Add ripple effect to cards
        card.addEventListener('click', createRipple);
    });
    
    // Monitor star ratings for 5-star confetti
    const starContainer = document.getElementById('star-rating');
    if (starContainer) {
        const stars = starContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                triggerHaptic('medium'); // Medium haptic for star rating
                const rating = index + 1;
                if (rating === 5) {
                    // Trigger confetti on 5-star rating!
                    setTimeout(() => {
                        triggerConfetti();
                    }, 300);
                }
            });
        });
    }
}

// Initialize advanced effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAdvancedEffects();
    
    // Re-initialize effects when service cards are dynamically added
    const observer = new MutationObserver(() => {
        initAdvancedEffects();
    });
    
    const serviceCardsContainer = document.querySelector('.service-cards-grid');
    if (serviceCardsContainer) {
        observer.observe(serviceCardsContainer, {
            childList: true,
            subtree: true
        });
    }
});

// Add to window for global access
window.createRipple = createRipple;
window.triggerConfetti = triggerConfetti;

/* ============================================
   END ADVANCED ANIMATIONS & EFFECTS
   ============================================ */

/* ============================================
   🔍 SMART SEARCH & FILTERING SYSTEM
   ============================================ */

// Search and Filter State
const searchState = {
    query: '',
    activeCategory: 'all',
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    maxHistoryItems: 10
};

// Category mapping for service cards
const categoryMap = {
    government: ['mayor', 'council', 'leadership', 'secretary', 'staff', 'meeting', 'board', 'commission'],
    safety: ['police', 'fire', 'emergency', 'alert', '311', 'animal', 'code enforcement'],
    utilities: ['water', 'electric', 'trash', 'solid waste', 'recycling', 'utility'],
    recreation: ['park', 'recreation', 'library', 'museum', 'golf', 'aquatic', 'trail'],
    business: ['permit', 'license', 'development', 'economic', 'business', 'zoning', 'planning'],
    transportation: ['transportation', 'traffic', 'parking', 'street', 'transit', 'mrt', 'bus']
};

/**
 * Fuzzy search with typo tolerance
 * Uses Levenshtein distance algorithm
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function fuzzyMatch(query, text, threshold = 2) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    // Exact match
    if (text.includes(query)) return true;
    
    // Word-by-word fuzzy matching
    const queryWords = query.split(' ');
    const textWords = text.split(' ');
    
    return queryWords.every(queryWord => {
        if (queryWord.length < 3) return textWords.some(w => w.includes(queryWord));
        
        return textWords.some(textWord => {
            const distance = levenshteinDistance(queryWord, textWord);
            const maxLength = Math.max(queryWord.length, textWord.length);
            return distance <= threshold || (distance / maxLength) <= 0.3;
        });
    });
}

/**
 * Search service cards with fuzzy matching
 * Searches through comprehensive serviceCards from service-cards.js (100+ cards)
 */
function searchServiceCards(query) {
    // Convert serviceCards object to array
    const allCards = Object.entries(serviceCards).map(([id, card]) => ({
        id,
        ...card
    }));
    
    if (!query || query.trim().length === 0) {
        return allCards; // Return all comprehensive cards if no query
    }
    
    return allCards.filter(card => {
        const searchableText = [
            card.title,
            card.description,
            card.titleEs || '',
            card.descriptionEs || '',
            ...(card.keywords || [])
        ].join(' ');
        
        return fuzzyMatch(query, searchableText);
    });
}

/**
 * Filter cards by category
 */
function filterByCategory(cards, category) {
    if (category === 'all') return cards;
    
    const categoryKeywords = categoryMap[category] || [];
    
    return cards.filter(card => {
        const cardText = [
            card.title,
            card.description,
            ...(card.keywords || [])
        ].join(' ').toLowerCase();
        
        return categoryKeywords.some(keyword => cardText.includes(keyword));
    });
}


/**
 * Highlight search terms in text
 */
function highlightText(text, query) {
    if (!query || !text) return text;
    
    const words = query.toLowerCase().split(' ').filter(w => w.length > 2);
    let highlightedText = text;
    
    words.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
    });
    
    return highlightedText;
}

/**
 * Render search results cards with highlighting
 * Uses comprehensive serviceCards catalog (100+ cards)
 */
function renderSearchResults(cards, highlightQuery = '') {
    const grid = document.getElementById('search-results-grid');
    const noResults = document.getElementById('no-results');
    
    if (!grid) return;
    
    if (cards.length === 0) {
        grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    // Clear existing cards
    grid.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'service-card';
        cardElement.dataset.cardId = card.id;
        
        // Use current language for title and description
        const currentLang = state.currentLanguage;
        const title = currentLang === 'es' && card.titleEs ? card.titleEs : card.title;
        const description = currentLang === 'es' && card.descriptionEs ? card.descriptionEs : card.description;
        
        // Add data-description for enhanced tooltip on desktop
        cardElement.dataset.description = description;
        
        // Apply highlighting if query provided
        const highlightedTitle = highlightQuery ? highlightText(title, highlightQuery) : title;
        const highlightedDesc = highlightQuery ? highlightText(description, highlightQuery) : description;
        
        // Icon handling
        const iconHTML = card.icon ? `<div class="service-icon">${card.icon}</div>` : '';
        
        let cardHTML = `
            ${iconHTML}
            <h4>${highlightedTitle}</h4>
            <p>${highlightedDesc}</p>
        `;
        
        // Add links
        const linkText = currentLang === 'es' && card.linkTextEs ? card.linkTextEs : 'Learn More';
        if (card.url) {
            cardHTML += `<div class="service-links">
                <a href="${card.url}" target="_blank" rel="noopener noreferrer" class="service-link" onclick="event.stopPropagation()">${linkText}</a>
            </div>`;
        }
        
        cardElement.innerHTML = cardHTML;
        grid.appendChild(cardElement);
    });
    
    // Re-initialize effects for new cards
    if (typeof initAdvancedEffects === 'function') {
        setTimeout(() => initAdvancedEffects(), 100);
    }
}


/**
 * Update search results info
 */
function updateSearchResultsInfo(count, hasFilters) {
    const resultsInfo = document.getElementById('search-results-info');
    const resultsCount = document.getElementById('results-count');
    
    if (!resultsInfo || !resultsCount) return;
    
    if (hasFilters) {
        resultsInfo.style.display = 'flex';
        const text = translations[state.currentLanguage].resultsFound.replace('{count}', count);
        resultsCount.textContent = text;
    } else {
        resultsInfo.style.display = 'none';
    }
}

/**
 * Add to search history
 */
function addToSearchHistory(query) {
    if (!query || query.trim().length < 2) return;
    
    query = query.trim();
    
    // Remove duplicates
    searchState.searchHistory = searchState.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    searchState.searchHistory.unshift(query);
    
    // Limit size
    if (searchState.searchHistory.length > searchState.maxHistoryItems) {
        searchState.searchHistory = searchState.searchHistory.slice(0, searchState.maxHistoryItems);
    }
    
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchState.searchHistory));
}

/**
 * Render search history
 */
function renderSearchHistory() {
    const historyList = document.getElementById('search-history-list');
    const historyDropdown = document.getElementById('search-history');
    
    if (!historyList || !historyDropdown) return;
    
    if (searchState.searchHistory.length === 0) {
        historyDropdown.style.display = 'none';
        return;
    }
    
    historyList.innerHTML = searchState.searchHistory.map(query => `
        <div class="search-history-item" data-query="${query}">
            <span class="search-history-item-text">
                <svg class="search-history-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${query}
            </span>
            <button class="search-history-item-remove" data-query="${query}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join('');
    
    // Add click handlers
    historyList.querySelectorAll('.search-history-item').forEach(item => {
        const query = item.dataset.query;
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.search-history-item-remove')) {
                const searchInput = document.getElementById('service-search');
                if (searchInput) {
                    searchInput.value = query;
                    performSearch(query);
                    historyDropdown.style.display = 'none';
                }
            }
        });
    });
    
    // Add remove handlers
    historyList.querySelectorAll('.search-history-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const query = btn.dataset.query;
            searchState.searchHistory = searchState.searchHistory.filter(item => item !== query);
            localStorage.setItem('searchHistory', JSON.stringify(searchState.searchHistory));
            renderSearchHistory();
        });
    });
}

/**
 * Perform search
 * Searches comprehensive serviceCards catalog
 */
function performSearch(query = searchState.query) {
    searchState.query = query;
    
    // Get all comprehensive cards or search results
    let results = searchServiceCards(query);
    
    // Filter by category
    results = filterByCategory(results, searchState.activeCategory);
    
    // Render search results with highlighting
    renderSearchResults(results, query);
    
    // Update results info only if filters are active
    const hasFilters = (query && query.trim().length > 0) || searchState.activeCategory !== 'all';
    updateSearchResultsInfo(results.length, hasFilters);
    
    // Add to history only if there's a meaningful query
    if (query && query.trim().length >= 2) {
        addToSearchHistory(query);
    }
    
    console.log(`🔍 Search performed: "${query}" | Category: ${searchState.activeCategory} | Results: ${results.length}`);
}


/**
 * Initialize search and filter system
 */
function initSearchAndFilter() {
    const searchInput = document.getElementById('service-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const historyDropdown = document.getElementById('search-history');
    const clearHistoryBtn = document.getElementById('clear-history');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const categoryTabs = document.querySelectorAll('.category-tab');
    
    if (!searchInput) return;
    
    // Real-time search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        // Show/hide clear button
        if (clearSearchBtn) {
            clearSearchBtn.style.display = query ? 'flex' : 'none';
        }
        
        // Perform search
        performSearch(query);
    });
    
    // Show search history on focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length === 0 && searchState.searchHistory.length > 0) {
            renderSearchHistory();
            if (historyDropdown) historyDropdown.style.display = 'block';
        }
    });
    
    // Hide search history when clicking outside
    document.addEventListener('click', (e) => {
        if (historyDropdown && !e.target.closest('.search-bar-wrapper') && !e.target.closest('#search-history')) {
            historyDropdown.style.display = 'none';
        }
    });
    
    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            performSearch('');
            searchInput.focus();
        });
    }
    
    // Clear search history
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            searchState.searchHistory = [];
            localStorage.removeItem('searchHistory');
            if (historyDropdown) historyDropdown.style.display = 'none';
        });
    }
    
    // Category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update active category
            searchState.activeCategory = tab.dataset.category;
            
            // Perform search with new category
            performSearch();
        });
    });
    
    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchState.query = '';
            searchState.activeCategory = 'all';
            
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            
            categoryTabs.forEach(t => t.classList.remove('active'));
            const allTab = document.querySelector('.category-tab[data-category="all"]');
            if (allTab) allTab.classList.add('active');
            
            performSearch('');
        });
    }
    
    // Initial render - show all comprehensive serviceCards (100+)
    performSearch('');
    
    console.log('✅ Search and filter system initialized - searching', Object.keys(serviceCards).length, 'comprehensive service cards');
}

// Initialize search when DOM is ready and cards are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for serviceCards to be imported
    setTimeout(() => {
        if (typeof serviceCards !== 'undefined') {
            initSearchAndFilter();
        }
    }, 500);
});

/* ============================================
   END SMART SEARCH & FILTERING SYSTEM
   ============================================ */

// Initialize dark mode immediately (module scripts are deferred, so DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    // DOM is already loaded, call immediately
    initDarkMode();
}
