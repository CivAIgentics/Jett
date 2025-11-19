/**
 * Jett - City of Odessa AI Assistant
 * ANAM-Only Conversational AI Integration
 * ANAM provides both LLM conversation and visual avatar with lip sync
 */

// Import service cards data
import { serviceCards, searchCards, getCardById } from './service-cards.js';
// Import simple cards for UI display
import { serviceCards as simpleCards } from './service-cards-simple.js';

// Expose comprehensive cards globally for voice navigation
window.serviceCards = serviceCards;
window.searchCards = searchCards;

// Defensive guard for MutationObserver
if (typeof MutationObserver !== 'undefined' && MutationObserver.prototype) {
    const _origObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function(target, options) {
        try {
            return _origObserve.call(this, target, options);
        } catch (err) {
            try {
                const isTypeError = err instanceof TypeError || (err && /parameter 1|not of type 'Node'/.test(err.message));
                if (isTypeError) {
                    console.warn('Safe guard: MutationObserver.observe failed for target (ignored):', target, err);
                    return;
                }
            } catch (inner) {}
            throw err;
        }
    };
}

/**
 * Haptic Feedback Utility
 */
function triggerHaptic(style = 'medium') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: 10,
            medium: 20,
            heavy: [20, 10, 20],
            success: [10, 20, 10, 20],
            error: [50, 30, 50]
        };
        navigator.vibrate(patterns[style] || patterns.medium);
    }
}

// Application state
const state = {
    anamClient: null,
    isStreaming: false,
    isMicMuted: false,
    isAgentMuted: false,
    currentResponseText: '',
    isSpeaking: false,
    conversationMessages: [],
    lastUserMessage: '',
    lastShownCards: [], // Track last shown service cards for "take me there" commands
    messageFeedback: {},
    starRating: 0,
    hoveredStar: 0,
    currentLanguage: 'en',
    personaId: 'ef1b0530-5288-4505-bde1-8cc72fb09904', // Jett Persona ID
    mediaStream: null  // Store the media stream for muting
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
        textChatTitle: 'Type your message',
        textChatPlaceholder: 'Type your message to Jett...',
        sendMessage: 'Send',
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
        textChatTitle: 'Escribe tu mensaje',
        textChatPlaceholder: 'Escribe tu mensaje a Jett...',
        sendMessage: 'Enviar',
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
    closeErrorModal: document.getElementById('close-error-modal'),
    retryBtn: document.getElementById('retry-btn'),
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
function startIdleVideo() {
    const v = elements.idleVideo;
    if (!v) return;
    try {
        v.muted = true;
        v.loop = true;
        const p = v.play();
        if (p && p.then) p.catch(() => {});
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
    v.style.visibility = 'visible';
    setTimeout(() => {
        v.style.opacity = '1';
        try { v.play().catch(() => {}); } catch (e) {}
    }, 50);
}

function hideIdleVideo() {
    const v = elements.idleVideo;
    if (!v) return;
    v.style.opacity = '0';
    setTimeout(() => { v.style.visibility = 'hidden'; }, 500);
}

/**
 * Switch UI language
 */
function switchLanguage(lang) {
    state.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('title', translations[lang][key]);
        }
    });
    
    if (elements.currentFlag) {
        if (lang === 'en') {
            elements.currentFlag.src = '/icons/flag-usa.svg';
            elements.currentFlag.alt = 'English';
        } else {
            elements.currentFlag.src = '/icons/flag-spain.svg';
            elements.currentFlag.alt = 'Español';
        }
    }
    
    // Update ambient voice recognition language
    if (window.ambientVoice && typeof window.ambientVoice.setLanguage === 'function') {
        window.ambientVoice.setLanguage(lang);
        console.log(`🎤 Voice recognition language updated to: ${lang}`);
    }
    
    loadServiceCards();
    console.log(`🌐 Language switched to: ${lang === 'en' ? 'English' : 'Español'}`);
}

/**
 * Detect language from browser
 */
function detectLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) return savedLang;
    
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('es')) return 'es';
    
    return 'en';
}

/**
 * Initialize the application
 */
async function init() {
    try {
        console.log('🚀 Initializing Jett (ANAM-Only)...');
        
        setupEventListeners();
        console.log('✅ Event listeners initialized');
        
        // Initialize dark mode
        initDarkMode();
        console.log('✅ Dark mode initialized');
        
        if (elements.languageToggle) {
            elements.languageToggle.addEventListener('click', () => {
                triggerHaptic('strong');
                const newLang = state.currentLanguage === 'en' ? 'es' : 'en';
                switchLanguage(newLang);
            });
        }
        
        const initialLang = detectLanguage();
        switchLanguage(initialLang);
        
        console.log('✅ Jett initialized successfully');
        updateStatus('Ready', 'ready');
        
        loadServiceCards();
        startIdleVideo();
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize application');
        updateStatus('Error', 'error');
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
        const response = await fetch('/api/anam/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            let errorMessage = 'Failed to get ANAM session token';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Failed to get ANAM session token (${response.status} ${response.statusText})`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Create ANAM client with session token and persona configuration
        state.anamClient = window.anam.createClient(
            data.sessionToken,
            { 
                personaId: state.personaId,
                streamUserText: true,  // Enable user transcript streaming
                streamAgentText: true   // Enable agent transcript streaming
            }
        );
        
        console.log('✅ ANAM client initialized with persona:', state.personaId);
        console.log('✅ Transcript streaming enabled');
        
        // Log all available methods for debugging
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(state.anamClient));
        console.log('🔍 ANAM client methods (full list):', methods);
        console.log('🔍 ANAM client properties:', Object.keys(state.anamClient));
        
        // Print each method on its own line for clarity
        console.log('📋 All ANAM methods:');
        methods.forEach(method => {
            console.log(`  - ${method} (${typeof state.anamClient[method]})`);
        });
        
        // Check specific methods
        console.log('🔍 Methods related to events/audio/text:');
        methods.forEach(method => {
            if (method.toLowerCase().includes('mute') || 
                method.toLowerCase().includes('audio') || 
                method.toLowerCase().includes('mic') ||
                method.toLowerCase().includes('transcript') ||
                method.toLowerCase().includes('listen') ||
                method.toLowerCase().includes('event') ||
                method.toLowerCase().includes('text')) {
                console.log(`  ✅ Found: ${method} (type: ${typeof state.anamClient[method]})`);
            }
        });
        
        // Setup ANAM event listeners
        setupAnamEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize ANAM client:', error);
        throw error;
    }
}

/**
 * Setup ANAM event listeners
 */
function setupAnamEventListeners() {
    if (!state.anamClient) return;
    
    console.log('🔍 Setting up ANAM SDK event listeners...');
    
    // Use the correct ANAM SDK events as per documentation
    // https://docs.anam.ai/sdk-reference/events
    
    // Real-time message streaming (persona and user speech chunks)
    state.anamClient.addListener('MESSAGE_STREAM_EVENT_RECEIVED', (event) => {
        console.log('📝 MESSAGE_STREAM_EVENT_RECEIVED:', event);
        
        if (event && event.content) {
            const role = event.role === 'persona' ? 'agent' : 'user';
            console.log(`💬 Stream chunk from ${role}:`, event.content);
            
            // For now, we'll wait for MESSAGE_HISTORY_UPDATED for complete messages
            // Streaming chunks can be used for real-time display if needed
        }
    });
    
    // Complete message history (called when user or persona finishes speaking)
    state.anamClient.addListener('MESSAGE_HISTORY_UPDATED', (messages) => {
        console.log('📚 MESSAGE_HISTORY_UPDATED:', messages);
        
        if (!messages || !Array.isArray(messages)) return;
        
        // Get the last message that was added
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;
        
        console.log('💬 Last message:', lastMessage);
        
        // Add to our transcript
        const role = lastMessage.role === 'persona' ? 'agent' : 'user';
        const text = lastMessage.content;
        
        if (text && text.length > 0) {
            console.log(`✅ Adding ${role} message to transcript:`, text);
            
            if (role === 'user') {
                state.lastUserMessage = text;
                addTranscriptMessage('user', text);
                detectOpenServiceCardCommand(text);
                detectStarRatingCommand(text);
            } else {
                const relevantCards = detectCardsFromContext(state.lastUserMessage, text);
                addTranscriptMessage('agent', text, relevantCards);
            }
        }
    });
    
    // Connection events
    state.anamClient.addListener('CONNECTION_ESTABLISHED', () => {
        console.log('🔗 ANAM connection established');
    });
    
    state.anamClient.addListener('SESSION_READY', () => {
        console.log('✅ ANAM session ready');
    });
    
    state.anamClient.addListener('CONNECTION_CLOSED', () => {
        console.log('🔌 ANAM connection closed');
    });
    
    // Video playback
    state.anamClient.addListener('VIDEO_PLAY_STARTED', () => {
        console.log('🎥 ANAM video playback started');
    });
    
    // Input audio stream
    state.anamClient.addListener('INPUT_AUDIO_STREAM_STARTED', (stream) => {
        console.log('🎤 Input audio stream started:', stream);
    });
    
    console.log('✅ ANAM event listeners registered');
}

/**
 * Handle ANAM events - centralized handler
 */
function handleAnamEvent(eventType, data) {
    // Extract text from various event formats
    let text = null;
    let isUserMessage = false;
    let isAgentMessage = false;
    
    // Determine message type
    if (eventType.toLowerCase().includes('user')) {
        isUserMessage = true;
    } else if (eventType.toLowerCase().includes('agent')) {
        isAgentMessage = true;
    }
    
    // Extract text from data
    if (typeof data === 'string') {
        text = data;
    } else if (data && data.text) {
        text = data.text;
    } else if (data && data.transcript) {
        text = data.transcript;
    } else if (data && data.message) {
        text = data.message;
    }
    
    // Add to transcript if we have text
    if (text && text.length > 0) {
        console.log(`📝 Extracted text from ${eventType}:`, text);
        
        if (isUserMessage) {
            state.lastUserMessage = text;
            addTranscriptMessage('user', text);
            detectOpenServiceCardCommand(text);
            detectStarRatingCommand(text);
        } else if (isAgentMessage) {
            const relevantCards = detectCardsFromContext(state.lastUserMessage, text);
            addTranscriptMessage('agent', text, relevantCards);
        }
    }
}

/**
 * Setup event listeners for UI controls
 */
function setupEventListeners() {
    console.log('📋 Setting up event listeners...');
    
    // Validate critical elements
    const requiredElements = {
        startBtn: 'Start button',
        stopBtn: 'Stop button',
        muteMicBtn: 'Mute mic button',
        muteAgentBtn: 'Mute agent button',
        textChatBtn: 'Text chat button'
    };
    
    for (const [key, name] of Object.entries(requiredElements)) {
        if (!elements[key]) {
            console.warn(`⚠️ ${name} not found in DOM`);
        }
    }
    
    if (elements.startBtn) {
        elements.startBtn.addEventListener('click', () => {
            triggerHaptic('heavy');
            startConversation();
        });
        console.log('✅ Start button listener attached');
    }
    
    if (elements.stopBtn) {
        elements.stopBtn.addEventListener('click', () => {
            triggerHaptic('heavy');
            stopConversation();
        });
        console.log('✅ Stop button listener attached');
    }
    
    if (elements.muteMicBtn) {
        elements.muteMicBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            toggleMicMute();
        });
        console.log('✅ Mute mic button listener attached');
    }
    
    if (elements.muteAgentBtn) {
        elements.muteAgentBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            toggleAgentMute();
        });
        console.log('✅ Mute agent button listener attached');
    }
    
    if (elements.textChatBtn) {
        elements.textChatBtn.addEventListener('click', () => {
            triggerHaptic('medium');
            openTextChat();
        });
        console.log('✅ Text chat button listener attached');
    }
    
    if (elements.closeErrorModal) {
        elements.closeErrorModal.addEventListener('click', () => {
            elements.errorModal.style.display = 'none';
        });
        console.log('✅ Error modal close listener attached');
    }
    
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', () => {
            elements.errorModal.style.display = 'none';
            startConversation();
        });
        console.log('✅ Retry button listener attached');
    }
    
    // Setup star rating listeners
    const starButtons = document.querySelectorAll('.star-rating-btn');
    if (starButtons.length > 0) {
        starButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const rating = parseInt(btn.dataset.rating);
                triggerHaptic(rating === 5 ? 'success' : 'heavy');
                handleStarRating(rating);
            });
            
            btn.addEventListener('mouseenter', () => {
                const rating = parseInt(btn.dataset.rating);
                triggerHaptic('light');
                if (state.starRating === 0) {
                    state.hoveredStar = rating;
                    showHoverEffect(rating);
                }
            });
        });
        console.log(`✅ ${starButtons.length} star rating listeners attached`);
    }
    
    const starRatingContainer = document.getElementById('star-rating-container');
    if (starRatingContainer) {
        starRatingContainer.addEventListener('mouseleave', () => {
            state.hoveredStar = 0;
            clearHoverEffects();
            if (state.starRating > 0) {
                highlightStarsUpTo(state.starRating);
            }
        });
        console.log('✅ Star rating container listener attached');
    }
    
    // Global haptic feedback
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .service-card, .card-link, .service-link');
        if (target) {
            if (target.classList.contains('service-card') || target.classList.contains('card-link') || target.classList.contains('service-link')) {
                triggerHaptic('light');
            } else if (target.tagName === 'A') {
                triggerHaptic('medium');
            }
        }
    }, true);
    
    console.log('✅ All event listeners setup complete');
}

/**
 * Start the conversation with ANAM
 */
async function startConversation() {
    try {
        console.log('🎙️ Starting ANAM conversation...');
        elements.startBtn.disabled = true;
        elements.loadingOverlay.classList.remove('hidden');
        updateStatus('Connecting...', 'connecting');
        
        // Ensure ANAM video element exists and is ready
        if (!elements.anamVideo) {
            throw new Error('ANAM video element not found');
        }
        
        // Make sure the video element is in the DOM
        if (!document.body.contains(elements.anamVideo)) {
            throw new Error('ANAM video element not attached to DOM');
        }
        
        // Initialize ANAM client if not already initialized
        if (!state.anamClient) {
            console.log('Initializing ANAM client...');
            await initializeAnamClient();
        }
        
        // CRITICAL: Make video element fully visible and in render tree BEFORE streaming
        // This prevents MutationObserver errors in ANAM SDK
        console.log('📺 Preparing video element for ANAM...');
        if (elements.anamVideo) {
            elements.anamVideo.style.visibility = 'visible';
            elements.anamVideo.style.opacity = '1';
            elements.anamVideo.style.display = 'block';  // Ensure it's in render tree
            elements.anamVideo.style.pointerEvents = 'auto';
        }
        
        // Hide idle video
        stopIdleVideo();
        hideIdleVideo();
        
        // Wait for browser to fully render the video element
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Start ANAM streaming
        console.log('🎥 Starting ANAM video stream...');
        await state.anamClient.streamToVideoAndAudioElements(
            'anam-video',
            'anam-video'
        );
        console.log('✅ ANAM streaming started');
        
        state.isStreaming = true;
        
        // Update UI
        elements.loadingOverlay.classList.add('hidden');
        elements.startBtn.classList.add('hidden');
        elements.stopBtn.classList.remove('hidden');
        elements.muteMicBtn.classList.remove('hidden');
        elements.muteAgentBtn.classList.remove('hidden');
        updateStatus('Connected', 'connected');
        
        showWaveform('idle');
        
        if (window.dispatchConversationStarted) {
            window.dispatchConversationStarted();
        }
        
        console.log('✅ Conversation started successfully with ANAM');
        console.log('🎤 Speak now - ANAM will handle everything!');
        
    } catch (error) {
        console.error('❌ Error starting conversation:', error);
        showError(error.message);
        elements.loadingOverlay.classList.add('hidden');
        elements.startBtn.disabled = false;
        updateStatus('Error', 'error');
        
        if (state.anamClient && state.isStreaming) {
            state.anamClient.stopStreaming();
        }
    }
}

/**
 * Stop the conversation
 */
function stopConversation() {
    try {
        console.log('🛑 Stopping conversation...');
        updateStatus('Stopping...', 'connecting');
        
        // Stop ANAM streaming
        if (state.anamClient && state.isStreaming) {
            state.anamClient.stopStreaming();
            state.isStreaming = false;
        }
        
        // Stop and clean up media stream
        if (state.mediaStream) {
            state.mediaStream.getTracks().forEach(track => {
                track.stop();
                console.log('🎤 Stopped track:', track.label);
            });
            state.mediaStream = null;
        }
        
        // Reset mute state
        state.isMicMuted = false;
        state.isAgentMuted = false;
        
        // Hide ANAM video, show idle video
        if (elements.anamVideo) {
            elements.anamVideo.style.opacity = '0';
            elements.anamVideo.style.pointerEvents = 'none';
            setTimeout(() => {
                elements.anamVideo.style.display = 'none';  // Remove from render tree after fade
            }, 600);
        }
        
        setTimeout(() => {
            showIdleVideo();
            startIdleVideo();
        }, 500);
        
        // Reset UI
        elements.stopBtn.classList.add('hidden');
        elements.muteMicBtn.classList.add('hidden');
        elements.muteAgentBtn.classList.add('hidden');
        elements.startBtn.classList.remove('hidden');
        elements.startBtn.disabled = false;
        updateStatus('Ready', 'connected');
        
        hideWaveform();
        
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
    
    console.log('🎤 Toggling mic mute. New state:', state.isMicMuted);
    
    if (state.anamClient) {
        try {
            if (state.isMicMuted) {
                state.anamClient.muteInputAudio();
                elements.muteMicBtn.textContent = '🎤 Unmute Mic';
                console.log('🎤 Microphone muted via ANAM muteInputAudio()');
            } else {
                state.anamClient.unmuteInputAudio();
                elements.muteMicBtn.innerHTML = `
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    <span data-i18n="muteMic">Mute Mic</span>
                `;
                console.log('🎤 Microphone unmuted via ANAM unmuteInputAudio()');
            }
        } catch (error) {
            console.error('❌ Error toggling microphone:', error);
            showToast('Failed to toggle microphone', 'error', 2000);
        }
    } else {
        console.warn('⚠️ ANAM client not available');
        showToast('Cannot control microphone - not connected', 'warning', 2000);
    }
}

/**
 * Toggle agent audio mute/unmute
 */
function toggleAgentMute() {
    state.isAgentMuted = !state.isAgentMuted;
    
    if (elements.anamVideo) {
        elements.anamVideo.muted = state.isAgentMuted;
    }
    
    if (state.isAgentMuted) {
        elements.muteAgentBtn.textContent = '🔊 Unmute Agent';
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
 * Open text chat
 */
function openTextChat() {
    const url = 'https://www.perplexity.ai/spaces/Jett-2-0-city-of-Odessa-tx-UNjkz8egR0uvRgHoYPf8Qw#0';
    const width = 1200;
    const height = 800;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=no`;
    
    const popup = window.open(url, 'JettTextChat', features);
    if (popup) {
        popup.focus();
        console.log('💬 Text chat popup opened');
    } else {
        window.open(url, '_blank');
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
 * Show waveform visualization
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
 * Detect relevant service cards based on conversation context
 */
function detectCardsFromContext(userMessage, agentResponse) {
    console.log('🔍 Card detection starting...');
    console.log('   User said:', userMessage?.substring(0, 100) + '...');
    console.log('   Agent said:', agentResponse?.substring(0, 100) + '...');
    
    const isWelcomeMessage = agentResponse && (
        agentResponse.includes('all calls and text exchanges are recorded') ||
        agentResponse.includes('training and monitoring purposes') ||
        state.conversationMessages.length === 0
    );
    
    if (isWelcomeMessage) {
        console.log('🚫 Skipping cards - this is the welcome message');
        return [];
    }
    
    const userText = (userMessage || '').toLowerCase().trim();
    const agentText = (agentResponse || '').toLowerCase().trim();
    const combinedText = `${userText} ${agentText}`;
    
    if (combinedText.length < 30) {
        console.log('🚫 Combined text too short:', combinedText.length, 'chars');
        return [];
    }
    
    console.log('🔍 Searching cards with query:', combinedText.substring(0, 100) + '...');
    let matchingCards = searchCards(combinedText);
    
    if (matchingCards.length === 0) {
        console.log('⚠️ No cards found by keyword search');
        return [];
    }
    
    console.log(`📋 Found ${matchingCards.length} potential cards:`, matchingCards.map(c => c.title).join(', '));
    
    const scoredCards = matchingCards.map(card => {
        let score = 0;
        const keywords = card.keywords || [];
        
        keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (userText === keywordLower) score += 50;
            const wordRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (wordRegex.test(userText)) score += 25;
            if (wordRegex.test(agentText)) score += 20;
            if (userText.includes(keywordLower)) score += 10;
            if (agentText.includes(keywordLower)) score += 8;
        });
        
        const titleWords = card.title.toLowerCase().split(/\s+/);
        titleWords.forEach(word => {
            if (word.length > 3) {
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
    
    scoredCards.sort((a, b) => b.score - a.score);
    console.log('📊 Top card scores:', scoredCards.slice(0, 5).map(c => `${c.title}: ${c.score}`).join(', '));
    
    const MIN_SCORE = 8;
    const relevantCards = scoredCards.filter(card => card.score >= MIN_SCORE);
    
    if (relevantCards.length === 0) {
        console.log('⚠️ No cards meet threshold (min: 8)');
        return [];
    }
    
    const topCards = relevantCards.slice(0, 2);
    console.log('✅ Final cards:', topCards.map(c => `${c.title} (score: ${c.score})`).join(', '));
    
    // Store the shown cards so user can say "take me there" or "open that"
    if (topCards.length > 0) {
        state.lastShownCards = topCards;
        console.log('💾 Stored', topCards.length, 'cards for quick access');
    }
    
    return topCards;
}

/**
 * Handle message feedback
 */
async function handleMessageFeedback(messageIndex, feedbackType) {
    state.messageFeedback[messageIndex] = feedbackType;
    updateMessageFeedbackUI(messageIndex, feedbackType);
    
    const message = state.conversationMessages[messageIndex];
    const previousMessage = messageIndex > 0 ? state.conversationMessages[messageIndex - 1] : null;
    const nextMessage = messageIndex < state.conversationMessages.length - 1 ? 
        state.conversationMessages[messageIndex + 1] : null;
    
    try {
        await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        console.log('✅ Feedback submitted');
    } catch (error) {
        console.error('❌ Failed to submit feedback:', error);
    }
}

/**
 * Detect star rating voice commands
 */
function detectStarRatingCommand(text) {
    if (!text) return;
    
    const lowerText = text.toLowerCase().trim();
    
    const numberPatterns = [
        { pattern: /\b(one|1)\s*(star|stars?)\b/i, rating: 1 },
        { pattern: /\b(two|2)\s*(star|stars?)\b/i, rating: 2 },
        { pattern: /\b(three|3)\s*(star|stars?)\b/i, rating: 3 },
        { pattern: /\b(four|4)\s*(star|stars?)\b/i, rating: 4 },
        { pattern: /\b(five|5)\s*(star|stars?)\b/i, rating: 5 },
        { pattern: /\b(una|1)\s*(estrella|estrellas?)\b/i, rating: 1 },
        { pattern: /\b(dos|2)\s*(estrella|estrellas?)\b/i, rating: 2 },
        { pattern: /\b(tres|3)\s*(estrella|estrellas?)\b/i, rating: 3 },
        { pattern: /\b(cuatro|4)\s*(estrella|estrellas?)\b/i, rating: 4 },
        { pattern: /\b(cinco|5)\s*(estrella|estrellas?)\b/i, rating: 5 }
    ];
    
    const qualityPatterns = [
        { pattern: /\b(very\s+poor|terrible|awful|worst)\b/i, rating: 1 },
        { pattern: /\b(poor|bad|not\s+good)\b/i, rating: 2 },
        { pattern: /\b(fair|okay|ok|average|decent)\b/i, rating: 3 },
        { pattern: /\b(good|nice|great)\b/i, rating: 4 },
        { pattern: /\b(excellent|outstanding|amazing|perfect|best|wonderful|fantastic)\b/i, rating: 5 },
        { pattern: /\b(muy\s+mal|terrible|pésimo|muy\s+pobre)\b/i, rating: 1 },
        { pattern: /\b(mal|malo|no\s+bueno|pobre)\b/i, rating: 2 },
        { pattern: /\b(regular|justo|promedio)\b/i, rating: 3 },
        { pattern: /\b(bien|bueno|buen)\b/i, rating: 4 },
        { pattern: /\b(excelente|maravilloso|increíble|perfecto|fantástico)\b/i, rating: 5 }
    ];
    
    const ratingPhrases = [
        /rate\s*(it|this|you|the\s+service|my\s+experience)/i,
        /give\s*(you|it|this|the\s+service)/i,
        /calificar|dar\s+una\s+calificación/i,
        /mi\s+experiencia|servicio/i
    ];
    
    const isRatingContext = ratingPhrases.some(phrase => phrase.test(lowerText));
    
    for (const { pattern, rating } of numberPatterns) {
        if (pattern.test(lowerText)) {
            console.log(`⭐ Voice command detected: ${rating} stars`);
            handleStarRating(rating);
            showToast(`⭐ Rated ${rating} star${rating !== 1 ? 's' : ''}!`, 'success', 3000);
            return;
        }
    }
    
    if (isRatingContext || lowerText.length < 50) {
        for (const { pattern, rating } of qualityPatterns) {
            if (pattern.test(lowerText)) {
                const qualityTexts = { 1: 'Very Poor', 2: 'Poor', 3: 'Fair', 4: 'Good', 5: 'Excellent' };
                console.log(`⭐ Voice command detected: ${qualityTexts[rating]} (${rating} stars)`);
                handleStarRating(rating);
                showToast(`⭐ Rated ${rating} star${rating !== 1 ? 's' : ''} - ${qualityTexts[rating]}!`, 'success', 3000);
                return;
            }
        }
    }
}

/**
 * Detect open service card voice commands
 */
function detectOpenServiceCardCommand(text) {
    if (!text) return;

    const lower = text.toLowerCase().trim();
    console.log('🔍 Voice navigation: analyzing "' + text + '"');

    const intentPhrases = [
        /\b(open|go to|take me to|show me|launch|visit|abrir|ir a|mostrar|llevarme a|muéstrame)\b/i,
        /\b(open the|go to the|take me to the)\b/i,
        /\b(take me there|open that|open it|go there|yes take me|yes open|open link|click link|visit link|llevarme allí|abrirlo|ir allí|sí llevarme|abrir enlace)\b/i
    ];

    const isIntent = intentPhrases.some(re => re.test(lower));
    console.log('🔍 Intent detected:', isIntent);
    
    // Check if user is asking to open the last shown service card
    const recentCardRequest = /\b(take me there|open that|open it|go there|yes take me|yes open|open link|click link|visit link|llevarme allí|abrirlo|ir allí|sí llevarme|abrir enlace)\b/i.test(lower);
    if (recentCardRequest && state.lastShownCards && state.lastShownCards.length > 0) {
        console.log('🔍 User requesting to open last shown card');
        const lastCard = state.lastShownCards[0]; // Open the first card shown
        if (lastCard.url) {
            console.log('✅ Opening recently shown card:', lastCard.title, '->', lastCard.url);
            showToast(`✅ Opening ${lastCard.title}...`, 'success', 2500);
            // Always use overlay (never open new tab)
            if (window.websiteOverlay) {
                window.websiteOverlay.open(lastCard.url, lastCard.title);
            } else {
                console.error('❌ Browser overlay not available');
            }
            return;
        }
    }

    const stopwords = new Set(['the','to','a','an','and','or','me','please','por','la','el','que','de','en','it','this','that']);
    const tokens = (lower.match(/\b[\wáéíóúñ]+\b/g) || []).filter(w => w.length > 2 && !stopwords.has(w));
    console.log('🔍 Extracted tokens:', tokens);
    
    if (tokens.length === 0 && !isIntent) {
        console.log('🔍 No tokens or intent - skipping navigation');
        return;
    }

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
            if (title.includes(t)) score += 3;
            else if (textContent.includes(t)) score += 1;
            if (title.match(new RegExp('\\b' + t + '\\b'))) score += 2;
        });

        const link = card.querySelector('a.service-link, a.card-link, a[href]');
        if (!link || !link.href) score = 0;

        if (score > bestScore) {
            bestScore = score;
            bestCard = card;
            bestTitle = title;
            bestUrl = link ? link.href : null;
        }
        
        if (score > 0) console.log('🔍 Card "' + title + '" score:', score);
    });
    
    if (typeof serviceCards !== 'undefined') {
        console.log('🔍 Also searching comprehensive cards catalog...');
        Object.entries(serviceCards).forEach(([id, card]) => {
            const title = (card.title || '').toLowerCase();
            const desc = (card.description || '').toLowerCase();
            const keywords = (card.keywords || []).map(k => k.toLowerCase());
            let score = 0;
            
            tokens.forEach(t => {
                if (title.includes(t)) score += 3;
                if (title.match(new RegExp('\\b' + t + '\\b'))) score += 2;
                if (keywords.some(k => k.includes(t))) score += 4;
                if (desc.includes(t)) score += 1;
            });
            
            if (card.url && score > bestScore) {
                bestScore = score;
                bestCard = null;
                bestTitle = card.title;
                bestUrl = card.url;
                console.log('🔍 Comprehensive card "' + card.title + '" score:', score);
            }
        });
    }

    console.log('🔍 Best match: "' + bestTitle + '" with score:', bestScore);

    if ((bestScore >= 2 || (isIntent && bestScore > 0)) && bestUrl) {
        console.log('✅ Voice navigation: opening', bestTitle, '->', bestUrl);
        showToast(`✅ Opening ${bestTitle}...`, 'success', 2500);

        if (bestCard) {
            bestCard.classList.add('service-card-opening');
            setTimeout(() => bestCard.classList.remove('service-card-opening'), 2000);
            const link = bestCard.querySelector('a.service-link, a.card-link, a[href]');
            if (link) {
                try {
                    link.click();
                } catch (err) {
                    if (window.websiteOverlay) {
                        window.websiteOverlay.open(bestUrl, bestTitle);
                    }
                }
            }
        } else {
            if (window.websiteOverlay) {
                window.websiteOverlay.open(bestUrl, bestTitle);
            }
        }
    }
}

/**
 * Handle star rating
 */
async function handleStarRating(rating) {
    console.log('⭐ Star rating clicked:', rating);
    state.starRating = rating;
    updateStarRatingUI(rating);
    
    if (rating === 5) {
        console.log('🎉 5-STAR RATING! TRIGGERING CONFETTI!');
        try {
            triggerConfetti();
            triggerScreenShake();
            triggerScreenFlash();
        } catch (error) {
            console.error('❌ Confetti error:', error);
        }
    }
    
    const conversationTranscript = state.conversationMessages.map((msg, idx) => ({
        index: idx,
        type: msg.role,
        content: msg.text,
        timestamp: msg.timestamp
    }));
    
    const agentMessages = state.conversationMessages.filter(m => m.role === 'agent').length;
    const userMessages = state.conversationMessages.filter(m => m.role === 'user').length;
    
    try {
        await fetch('/api/rating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
 * UI helper functions
 */
function updateMessageFeedbackUI(messageIndex, feedbackType) {
    const messageElements = document.querySelectorAll('.transcript-message.agent-message');
    const messageElement = messageElements[Math.floor(messageIndex / 2)];
    
    if (messageElement) {
        const thumbsUpBtn = messageElement.querySelector('.feedback-thumbs-up');
        const thumbsDownBtn = messageElement.querySelector('.feedback-thumbs-down');
        
        if (thumbsUpBtn && thumbsDownBtn) {
            thumbsUpBtn.classList.toggle('feedback-active', feedbackType === 'positive');
            thumbsDownBtn.classList.toggle('feedback-active', feedbackType === 'negative');
        }
    }
}

function updateStarRatingUI(rating) {
    highlightStarsUpTo(rating);
}

function highlightStarsUpTo(rating) {
    const stars = document.querySelectorAll('.star-rating-btn');
    stars.forEach((star) => {
        const starRating = parseInt(star.dataset.rating);
        star.classList.remove('rating-1', 'rating-2', 'rating-3', 'rating-4', 'rating-5');
        
        if (starRating <= rating) {
            star.classList.add('star-active');
            star.classList.add(`rating-${rating}`);
        } else {
            star.classList.remove('star-active');
        }
    });
}

function showHoverEffect(rating) {
    const stars = document.querySelectorAll('.star-rating-btn');
    stars.forEach((star) => {
        const starRating = parseInt(star.dataset.rating);
        star.classList.remove('hover-1', 'hover-2', 'hover-3', 'hover-4', 'hover-5');
        if (starRating <= rating) {
            star.classList.add(`hover-${rating}`);
        }
    });
}

function clearHoverEffects() {
    const stars = document.querySelectorAll('.star-rating-btn');
    stars.forEach(star => {
        star.classList.remove('hover-1', 'hover-2', 'hover-3', 'hover-4', 'hover-5');
    });
}

function triggerScreenShake() {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    if (isMobile) return;
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.classList.add('screen-shake');
        setTimeout(() => appContainer.classList.remove('screen-shake'), 500);
    }
}

function triggerScreenFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

function triggerConfetti() {
    const flash = document.createElement('div');
    flash.className = 'celebration-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
    
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti');
    
    for (let i = 0; i < 150; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 40 - 20);
        piece.style.setProperty('--start-x', `${startX}%`);
        piece.style.setProperty('--end-x', `${endX}%`);
        piece.style.left = `${startX}%`;
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
        
        const colors = [
            '#FFD700', '#FFA500', '#FF6B35', '#00A4E4', '#0052A5', 
            '#F7B731', '#5F27CD', '#00D2D3', '#FF9FF3', '#54A0FF', 
            '#48DBFB', '#1DD1A1', '#FFEB3B', '#FF1744', '#E040FB',
            '#FFFFFF', '#C0C0C0'
        ];
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const size = 6 + Math.random() * 12;
        piece.style.width = `${size}px`;
        piece.style.height = `${size * 1.5}px`;
        piece.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
        
        confettiContainer.appendChild(piece);
    }
    
    document.body.appendChild(confettiContainer);
    
    try {
        triggerHaptic('success');
        setTimeout(() => triggerHaptic('success'), 200);
        setTimeout(() => triggerHaptic('success'), 400);
    } catch (e) {}
    
    setTimeout(() => confettiContainer.remove(), 5000);
}

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    
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
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Add transcript message
 */
function addTranscriptMessage(role, text, cards = null) {
    console.log(`💬 addTranscriptMessage called - Role: ${role}, Text: "${text?.substring(0, 50)}..."`);
    console.log(`📦 Elements check - transcript:`, elements.transcript);
    console.log(`📦 Elements check - transcriptContainer:`, elements.transcriptContainer);
    
    if (!elements.transcriptContainer) {
        console.error('❌ transcriptContainer element not found!');
        return;
    }
    
    if (elements.transcriptContainer.style.display === 'none') {
        console.log('👁️ Making transcript container visible');
        elements.transcriptContainer.style.display = 'block';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `transcript-message ${role}-message`;
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? translations[state.currentLanguage].userLabel : translations[state.currentLanguage].agentLabel;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg><span class="copy-text">Copy</span>`;
    copyBtn.onclick = async (e) => {
        e.stopPropagation();
        triggerHaptic('light');
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
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = `${dateStr} at ${timeStr}`;
    
    bubble.appendChild(content);
    
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
            triggerHaptic('medium');
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
            triggerHaptic('medium');
            const currentFeedback = state.messageFeedback[messageIndex];
            handleMessageFeedback(messageIndex, currentFeedback === 'negative' ? null : 'negative');
        };
        
        feedbackContainer.appendChild(thumbsUpBtn);
        feedbackContainer.appendChild(thumbsDownBtn);
        bubble.appendChild(feedbackContainer);
    }
    
    if (cards && cards.length > 0) {
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'message-service-cards';
        
        // Store cards for "take me there" / "open that" commands
        state.lastShownCards = cards;
        console.log('💾 Stored', cards.length, 'cards in transcript for quick access');
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'message-service-card';
            
            const title = state.currentLanguage === 'es' && card.titleEs ? card.titleEs : card.title;
            const description = state.currentLanguage === 'es' && card.descriptionEs ? card.descriptionEs : card.description;
            
            let cardHTML = `
                <div class="card-header"><h5>${title}</h5></div>
                <div class="card-body"><p>${description}</p>`;
            
            if (card.links && card.links.length > 0) {
                const linksHTML = card.links.map(link => {
                    const linkText = state.currentLanguage === 'es' && link.textEs ? link.textEs : link.text;
                    return `<a href="${link.url}" data-card-title="${card.title || 'Service'}" class="card-link" onclick="event.preventDefault(); if(window.websiteOverlay) { window.websiteOverlay.open('${link.url}', '${(card.title || 'Service').replace(/'/g, "\\'")}')} return false;">${linkText}</a>`;
                }).join('');
                cardHTML += `<div class="card-links">${linksHTML}</div>`;
            } else {
                const contactLinks = [];
                if (card.phone) contactLinks.push(`<a href="tel:${card.phone}" class="card-link">📞 ${card.phone}</a>`);
                if (card.email) contactLinks.push(`<a href="mailto:${card.email}" class="card-link">✉️ Email</a>`);
                if (card.url) {
                    if (card.openInNewTab) {
                        contactLinks.push(`<a href="${card.url}" class="card-link" target="_blank" rel="noopener noreferrer">🔗 Visit Website</a>`);
                    } else {
                        contactLinks.push(`<a href="${card.url}" class="card-link" onclick="event.preventDefault(); if(window.websiteOverlay) { window.websiteOverlay.open('${card.url}', '${(card.title || 'Service').replace(/'/g, "\\'")}')} return false;">🔗 Visit Website</a>`);
                    }
                }
                if (contactLinks.length > 0) cardHTML += `<div class="card-links">${contactLinks.join('')}</div>`;
            }
            
            cardHTML += '</div>';
            cardElement.innerHTML = cardHTML;
            cardsContainer.appendChild(cardElement);
        });
        
        content.appendChild(cardsContainer);
    }
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestamp);
    elements.transcript.appendChild(messageDiv);
    
    state.conversationMessages.push({
        role: role,
        text: text,
        timestamp: Date.now(),
        cards: cards
    });
    
    elements.transcript.scrollTop = elements.transcript.scrollHeight;
}

/**
 * Load service cards
 */
async function loadServiceCards() {
    try {
        const defaultGrid = document.getElementById('default-cards-grid');
        const serviceCardsContainer = document.getElementById('service-cards');
        
        if (!defaultGrid) return;
        
        defaultGrid.innerHTML = '';
        simpleCards.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            
            const title = state.currentLanguage === 'es' && service.titleEs ? service.titleEs : service.title;
            const description = state.currentLanguage === 'es' && service.descriptionEs ? service.descriptionEs : service.description;
            
            let iconHTML = '';
            if (service.icon) {
                const iconLower = service.icon.toLowerCase();
                if (iconLower.endsWith('.svg')) {
                    iconHTML = `<img src="${service.icon}" alt="${title}" class="service-icon-svg" />`;
                } else if (iconLower.endsWith('.json')) {
                    iconHTML = `<lottie-player src="${service.icon}" background="transparent" speed="1" loop autoplay class="service-lottie" aria-label="${title}"></lottie-player>`;
                } else if (iconLower.match(/\.(png|jpg|jpeg|gif)$/)) {
                    iconHTML = `<img src="${service.icon}" alt="${title}" class="service-icon-svg" />`;
                } else {
                    iconHTML = `<div class="service-icon">${service.icon}</div>`;
                }
            } else {
                iconHTML = `<div class="service-icon">📋</div>`;
            }
            
            let cardHTML = `${iconHTML}<h4>${title}</h4><p>${description}</p>`;
            
            if (service.links && service.links.length > 0) {
                const linksHTML = service.links.map(link => {
                    const linkText = state.currentLanguage === 'es' && link.textEs ? link.textEs : link.text;
                    if (link.openInNewTab || service.openInNewTab) {
                        return `<a href="${link.url}" class="service-link" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                    } else if (link.openInCompactWindow || service.openInCompactWindow) {
                        return `<a href="${link.url}" class="service-link" onclick="event.preventDefault(); event.stopPropagation(); if(window.websiteOverlay) { window.websiteOverlay.openCompactWindow('${link.url}', '${(service.title || 'Service').replace(/'/g, "\\'")}')} return false;">${linkText}</a>`;
                    } else {
                        return `<a href="${link.url}" class="service-link" onclick="event.preventDefault(); event.stopPropagation(); if(window.websiteOverlay) { window.websiteOverlay.open('${link.url}', '${(service.title || 'Service').replace(/'/g, "\\'")}')} return false;">${linkText}</a>`;
                    }
                }).join('');
                cardHTML += `<div class="service-links">${linksHTML}</div>`;
            } else if (service.url) {
                // Card has a direct URL (no links array)
                const linkText = state.currentLanguage === 'es' ? 'Ver Más' : 'Learn More';
                if (service.openInNewTab) {
                    cardHTML += `<div class="service-links">
                        <a href="${service.url}" class="service-link" target="_blank" rel="noopener noreferrer">${linkText}</a>
                    </div>`;
                } else if (service.openInCompactWindow) {
                    cardHTML += `<div class="service-links">
                        <a href="${service.url}" class="service-link" onclick="event.preventDefault(); event.stopPropagation(); if(window.websiteOverlay) { window.websiteOverlay.openCompactWindow('${service.url}', '${(service.title || 'Service').replace(/'/g, "\\'")}')} return false;">${linkText}</a>
                    </div>`;
                } else {
                    cardHTML += `<div class="service-links">
                        <a href="${service.url}" class="service-link" onclick="event.preventDefault(); event.stopPropagation(); if(window.websiteOverlay) { window.websiteOverlay.open('${service.url}', '${(service.title || 'Service').replace(/'/g, "\\'")}')} return false;">${linkText}</a>
                    </div>`;
                }
            }
            
            card.innerHTML = cardHTML;
            defaultGrid.appendChild(card);
            
            const lottiePlayer = card.querySelector('.service-lottie');
            if (lottiePlayer) {
                card.addEventListener('mouseenter', () => lottiePlayer.setSpeed(1.8));
                card.addEventListener('mouseleave', () => lottiePlayer.setSpeed(1));
            }
        });
        
        if (serviceCardsContainer) serviceCardsContainer.style.display = 'block';
        
        const searchSection = document.getElementById('search-all-services');
        if (searchSection) searchSection.style.display = 'block';
        
        console.log('✅ Default service cards loaded:', simpleCards.length);
        
        if (typeof initSearchAndFilter === 'function') {
            initSearchAndFilter();
        }
    } catch (error) {
        console.error('Error loading service cards:', error);
    }
}

/**
 * Search and Filter System
 */
const searchState = {
    query: '',
    activeCategory: 'all',
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    maxHistoryItems: 10
};

function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    
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
    if (text.includes(query)) return true;
    
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

function searchServiceCards(query) {
    const allCards = Object.entries(serviceCards).map(([id, card]) => ({ id, ...card }));
    if (!query || query.trim().length === 0) return allCards;
    
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
    grid.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'service-card';
        cardElement.dataset.cardId = card.id;
        
        const currentLang = state.currentLanguage;
        const title = currentLang === 'es' && card.titleEs ? card.titleEs : card.title;
        const description = currentLang === 'es' && card.descriptionEs ? card.descriptionEs : card.description;
        
        const iconHTML = card.icon ? `<div class="service-icon">${card.icon}</div>` : '';
        const linkText = currentLang === 'es' && card.linkTextEs ? card.linkTextEs : 'Learn More';
        
        let cardHTML = `${iconHTML}<h4>${title}</h4><p>${description}</p>`;
        if (card.url) {
            if (card.openInNewTab) {
                cardHTML += `<div class="service-links">
                <a href="${card.url}" class="service-link" target="_blank" rel="noopener noreferrer">${linkText}</a>
            </div>`;
            } else {
                cardHTML += `<div class="service-links">
                <a href="${card.url}" class="service-link" onclick="event.preventDefault(); event.stopPropagation(); if(window.websiteOverlay) { window.websiteOverlay.open('${card.url}', '${(card.title || 'Service').replace(/'/g, "\\'")}')} return false;">${linkText}</a>
            </div>`;
            }
        }
        
        cardElement.innerHTML = cardHTML;
        grid.appendChild(cardElement);
    });
}

function performSearch(query = searchState.query) {
    searchState.query = query;
    let results = searchServiceCards(query);
    renderSearchResults(results, query);
    
    if (query && query.trim().length >= 2) {
        if (!searchState.searchHistory.includes(query.trim())) {
            searchState.searchHistory.unshift(query.trim());
            if (searchState.searchHistory.length > searchState.maxHistoryItems) {
                searchState.searchHistory.pop();
            }
            localStorage.setItem('searchHistory', JSON.stringify(searchState.searchHistory));
        }
    }
}

function initSearchAndFilter() {
    const searchInput = document.getElementById('service-search');
    const clearSearchBtn = document.getElementById('clear-search');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (clearSearchBtn) clearSearchBtn.style.display = query ? 'flex' : 'none';
        performSearch(query);
    });
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            performSearch('');
            searchInput.focus();
        });
    }
    
    performSearch('');
    console.log('✅ Search system initialized');
}

/**
 * Dark mode and UI utilities
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    
    if (!darkModeToggle) {
        console.warn('⚠️ Dark mode toggle button not found');
        return;
    }
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update icon based on current theme
    if (darkModeIcon) {
        darkModeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
    
    console.log('🌓 Dark mode initialized with theme:', savedTheme);
    
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        if (darkModeIcon) {
            darkModeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        }
        
        console.log('🌓 Theme switched to:', newTheme);
        triggerHaptic('medium');
    });
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (state.anamClient && state.isStreaming) {
        state.anamClient.stopStreaming();
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
