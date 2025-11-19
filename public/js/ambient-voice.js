/**
 * Ambient Voice Recognition System
 * - Voice search for service cards
 * - Quick voice commands
 * - "Hey Jett" wake word detection
 * - Always-on listening mode
 */

class AmbientVoiceRecognition {
    constructor() {
        console.log('🎤 Initializing AmbientVoiceRecognition...');
        this.recognition = null;
        this.isListening = false;
        this.wakeWordActive = false;
        this.voiceButton = null;
        this.resultDisplay = null;
        this.currentLanguage = 'en-US'; // Default to English (US)
        this.supportedLanguages = ['en-US', 'es-MX']; // Support both English and Spanish
        this.lastCommandTime = 0; // Track last command to prevent rapid-fire
        this.commandCooldown = 500; // 500ms cooldown between commands (reduced from 2000ms)
        this.lastTranscript = ''; // Track last transcript to prevent duplicates
        this.restartAttempts = 0; // Track restart attempts
        this.maxRestartAttempts = 5; // Maximum restart attempts
        this.restartTimer = null; // Timer for restart attempts
        this.isRestarting = false; // Flag to prevent concurrent restart attempts
        
        // Removed hardcoded serviceKeywords - now uses dynamic card search for all 156 cards

        this.init();
    }

    init() {
        // Always create the UI first
        this.createVoiceUI();
        
        // Check for Web Speech API support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ Speech recognition not supported in this browser');
            this.showUnsupportedMessage();
            return;
        }

        this.setupRecognition();
        this.setupEventListeners();
    }

    /**
     * Change speech recognition language
     * @param {string} lang - Language code ('en' or 'es')
     */
    setLanguage(lang) {
        const wasListening = this.isListening;
        
        // Stop recognition if active
        if (wasListening) {
            this.stopListening();
        }

        // Update language based on UI language code
        this.currentLanguage = lang === 'es' ? 'es-MX' : 'en-US';
        
        // Update recognition language if it exists
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage;
            console.log(`🌍 Speech recognition language changed to: ${this.currentLanguage}`);
        }

        // Restart recognition if it was active
        if (wasListening) {
            setTimeout(() => this.startListening(), 100);
        }
    }
    
    showUnsupportedMessage() {
        if (this.voiceButton) {
            this.voiceButton.title = 'Speech recognition not supported in this browser';
            this.voiceButton.style.opacity = '0.5';
            this.voiceButton.style.cursor = 'not-allowed';
            this.voiceButton.onclick = () => {
                this.showResult('⚠️ Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.', false);
            };
        }
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        // CRITICAL: Set language to Spanish (Mexico) for better Spanish recognition
        // Chrome's speech recognition works best with explicit language codes
        this.recognition.lang = this.currentLanguage;
        console.log(`🌍 Speech recognition language set to: ${this.currentLanguage}`);
        
        // Get multiple alternatives to improve accuracy
        this.recognition.maxAlternatives = 5; // Increased from 3 for better Spanish detection

        // Recognition event handlers
        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            // Don't try to restart on no-speech errors to avoid the InvalidStateError
            if (event.error === 'no-speech') {
                // Just log, don't restart (onend will handle restart)
                console.log('⚠️ No speech detected, waiting for onend to restart...');
            } else if (event.error === 'aborted') {
                // Recognition was aborted, safe to restart
                if (this.isListening) {
                    setTimeout(() => {
                        try {
                            this.recognition.start();
                        } catch (err) {
                            console.warn('Could not restart recognition:', err);
                        }
                    }, 1000);
                }
            }
        };

        this.recognition.onend = () => {
            console.log('🔄 Recognition ended, state:', { isListening: this.isListening, isRestarting: this.isRestarting });
            
            // ALWAYS auto-restart if listening is enabled (even in background tabs)
            if (this.isListening && !this.isRestarting) {
                // Immediate restart - no delay needed
                this.attemptRestart();
            }
        };
    }

    attemptRestart() {
        if (this.isRestarting) {
            console.log('⏳ Already restarting, skipping duplicate restart');
            return;
        }
        
        this.isRestarting = true;
        this.restartAttempts++;
        
        console.log(`🔄 Attempting to restart recognition (attempt ${this.restartAttempts}/${this.maxRestartAttempts})...`);
        
        // Clear any existing restart timer
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
        
        try {
            this.recognition.start();
            console.log('✅ Recognition restarted successfully');
            this.restartAttempts = 0; // Reset counter on success
            this.isRestarting = false;
        } catch (err) {
            console.warn(`⚠️ Restart attempt ${this.restartAttempts} failed:`, err.message);
            
            if (this.restartAttempts < this.maxRestartAttempts) {
                // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
                const delay = Math.min(100 * Math.pow(2, this.restartAttempts - 1), 1600);
                console.log(`⏱️ Retrying in ${delay}ms...`);
                
                this.restartTimer = setTimeout(() => {
                    this.isRestarting = false;
                    if (this.isListening) {
                        this.attemptRestart();
                    }
                }, delay);
            } else {
                console.error('❌ Max restart attempts reached. Please manually toggle recognition.');
                this.isRestarting = false;
                this.restartAttempts = 0;
                // Update UI to show recognition stopped
                this.voiceButton?.classList.remove('listening');
                this.showResult('❌ Recognition stopped. Click to restart.', false);
            }
        }
    }

    createVoiceUI() {
        console.log('🎤 Creating voice UI button...');
        
        // Create voice button in header
        const header = document.querySelector('.app-header') || document.querySelector('header');
        if (!header) {
            console.error('❌ Header not found! Cannot create voice button.');
            return;
        }
        
        console.log('✅ Header found:', header);

        // Create voice button
        this.voiceButton = document.createElement('button');
        this.voiceButton.id = 'ambient-voice-button';
        this.voiceButton.className = 'voice-control-btn';
        this.voiceButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            <span class="voice-pulse"></span>
        `;
        this.voiceButton.title = 'Voice Commands (Click or say "Hey Jett")';

        // Add to header
        const rightControls = header.querySelector('.header-right') || header;
        console.log('📍 Adding button to:', rightControls);
        rightControls.insertBefore(this.voiceButton, rightControls.firstChild);
        
        console.log('✅ Voice button created and added to DOM:', this.voiceButton);

        // Create result display
        this.resultDisplay = document.createElement('div');
        this.resultDisplay.id = 'voice-result-display';
        this.resultDisplay.className = 'voice-result-display hidden';
        document.body.appendChild(this.resultDisplay);

        this.addStyles();
        console.log('✅ Voice UI fully initialized');
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .voice-control-btn {
                position: relative;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: var(--glass-bg, rgba(255, 255, 255, 0.8));
                backdrop-filter: blur(10px);
                border: 2px solid var(--border-color, rgba(0, 0, 0, 0.1));
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: var(--text-primary, #333);
                margin: 0 8px;
            }

            .voice-control-btn:hover {
                transform: scale(1.1);
                border-color: var(--primary-color, #00a4e4);
                box-shadow: 0 4px 12px rgba(0, 164, 228, 0.3);
            }

            .voice-control-btn.listening {
                background: linear-gradient(135deg, #00a4e4, #8a2be2);
                color: white;
                border-color: transparent;
                animation: voicePulse 2s ease-in-out infinite;
            }

            .voice-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid var(--primary-color, #00a4e4);
                opacity: 0;
                pointer-events: none;
            }

            .voice-control-btn.listening .voice-pulse {
                animation: pulsRing 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }

            @keyframes voicePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @keyframes pulseRing {
                0% {
                    transform: scale(0.8);
                    opacity: 1;
                }
                100% {
                    transform: scale(1.4);
                    opacity: 0;
                }
            }

            .voice-result-display {
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--glass-bg, rgba(255, 255, 255, 0.95));
                backdrop-filter: blur(20px);
                padding: 15px 25px;
                border-radius: 30px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                max-width: 400px;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: var(--text-primary, #333);
                font-size: 15px;
                font-weight: 500;
                text-align: center;
            }

            .voice-result-display.hidden {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
                pointer-events: none;
            }

            .voice-result-display.success {
                background: linear-gradient(135deg, rgba(0, 164, 228, 0.95), rgba(138, 43, 226, 0.95));
                color: white;
            }

            body.dark-mode .voice-control-btn {
                background: rgba(45, 45, 45, 0.8);
                color: #e0e0e0;
            }

            body.dark-mode .voice-result-display {
                background: rgba(45, 45, 45, 0.95);
                color: #e0e0e0;
            }

            /* Card highlight for voice search */
            .service-card.voice-matched {
                animation: voiceHighlight 1s ease-in-out;
                border: 2px solid #00a4e4 !important;
                box-shadow: 0 0 30px rgba(0, 164, 228, 0.6) !important;
            }

            @keyframes voiceHighlight {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Voice button click
        this.voiceButton?.addEventListener('click', () => {
            this.toggleListening();
        });

        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language === 'es' ? 'es-ES' : 'en-US';
            if (this.recognition) {
                this.recognition.lang = this.currentLanguage;
            }
        });
        
        // Handle window focus/blur to maintain recognition
        window.addEventListener('blur', () => {
            console.log('🪟 Window lost focus - voice recognition continues in background');
            // Keep recognition running even when user switches tabs
        });
        
        window.addEventListener('focus', () => {
            console.log('🪟 Window regained focus - voice recognition still active');
            // Verify recognition is still running when tab regains focus
            if (this.isListening && !this.isRestarting) {
                console.log('✅ Verifying recognition status on focus...');
                // The onend handler will auto-restart if needed
            }
        });
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        try {
            this.recognition.start();
            this.isListening = true;
            this.voiceButton?.classList.add('listening');
            this.showResult('🎤 Listening... Try "Find permits" or "Hey Jett"');
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        } catch (error) {
            console.error('Failed to start recognition:', error);
        }
    }

    stopListening() {
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
        this.recognition.stop();
        this.isListening = false;
        this.isRestarting = false;
        this.restartAttempts = 0;
        this.voiceButton?.classList.remove('listening');
        this.hideResult();
    }

    handleRecognitionResult(event) {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        const isFinal = event.results[last].isFinal;

        console.log('Voice input:', transcript, 'Final:', isFinal);

        // Show interim results
        if (!isFinal) {
            this.showResult(`🎤 ${transcript}...`);
            return;
        }

        // Check for wake word with fuzzy matching
        if (this.detectWakeWord(transcript)) {
            this.handleWakeWord(transcript);
            return;
        }

        // Check for voice commands
        if (this.handleVoiceCommand(transcript)) {
            return;
        }

        // Check for service search
        this.handleServiceSearch(transcript);
    }

    detectWakeWord(transcript) {
        // Wake word variations - all phonetically similar to "Jett"
        const wakeWordPatterns = [
            'hey Jett', 'hey jackie', 'hey jaki', 'hey jaky', 'hey jakki',
            'hey jack', 'hey jacki', 'hey jacci', 'hey jakee', 'hey jakey',
            'ok Jett', 'ok jackie', 'ok jaki', 'ok jaky', 'ok jakki',
            'okay Jett', 'okay jackie', 'okay jaki',
            'hi Jett', 'hi jackie', 'hi jaki',
            'hello Jett', 'hello jackie', 'hello jaki'
        ];

        // Check if transcript contains any wake word pattern
        for (const pattern of wakeWordPatterns) {
            if (transcript.includes(pattern)) {
                console.log('✨ Wake word detected:', pattern);
                return true;
            }
        }

        // Also check for standalone "Jett" variants after "hey/hi/ok/hello"
        const starterWords = ['hey', 'hi', 'ok', 'okay', 'hello'];
        const JettVariants = ['Jett', 'jackie', 'jaki', 'jaky', 'jakki', 'jack', 'jacki', 'jacci', 'jakee', 'jakey'];
        
        for (const starter of starterWords) {
            for (const variant of JettVariants) {
                const pattern = `${starter} ${variant}`;
                if (transcript.includes(pattern)) {
                    console.log('✨ Wake word detected (variant):', pattern);
                    return true;
                }
            }
        }

        return false;
    }

    handleWakeWord(transcript) {
        this.showResult('👋 Hey! How can I help?', true);
        
        // Trigger conversation start after brief delay
        setTimeout(() => {
            const startBtn = document.getElementById('start-btn');
            if (startBtn && !startBtn.disabled) {
                startBtn.click();
                this.stopListening();
            }
        }, 1000);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
    }

    handleVoiceCommand(transcript) {
        // Start conversation - English and Spanish with Jett name variations
        const talkPatterns = [
            // English
            'start conversation', 'talk to Jett', 'talk to jackie', 'talk to jaki', 
            'speak to Jett', 'speak to jackie', 'chat with Jett', 'chat with jackie',
            // Spanish
            'comenzar conversación', 'hablar con Jett', 'hablar con jackie',
            'platicar con Jett', 'chatear con Jett'
        ];
        
        if (talkPatterns.some(pattern => transcript.includes(pattern))) {
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.click();
                this.showResult('✅ Starting conversation... / Iniciando conversación...', true);
                this.stopListening();
                return true;
            }
        }

        // Toggle dark mode - English and Spanish
        if (transcript.includes('dark mode') || transcript.includes('toggle theme') || 
            transcript.includes('light mode') || transcript.includes('switch theme') ||
            transcript.includes('modo oscuro') || transcript.includes('cambiar tema') ||
            transcript.includes('modo claro')) {
            const darkModeBtn = document.querySelector('.dark-mode-toggle');
            if (darkModeBtn) {
                darkModeBtn.click();
                this.showResult('✅ Theme toggled / Tema cambiado', true);
                return true;
            }
        }

        // Change language - English and Spanish
        if (transcript.includes('change language') || transcript.includes('switch language') || 
            transcript.includes('spanish') || transcript.includes('español') || 
            transcript.includes('inglés') || transcript.includes('english') ||
            transcript.includes('cambiar idioma')) {
            const langBtn = document.getElementById('language-toggle');
            if (langBtn) {
                langBtn.click();
                this.showResult('✅ Language changed / Idioma cambiado', true);
                return true;
            }
        }

        // Open specific card - English and Spanish
        const openMatchEn = transcript.match(/open\s+(.+)/);
        const openMatchEs = transcript.match(/abrir\s+(.+)|abre\s+(.+)|mostrar\s+(.+)|muestra\s+(.+)/);
        
        if (openMatchEn) {
            const serviceName = openMatchEn[1];
            return this.openService(serviceName);
        }
        
        if (openMatchEs) {
            const serviceName = openMatchEs[1] || openMatchEs[2] || openMatchEs[3] || openMatchEs[4];
            return this.openService(serviceName);
        }

        return false;
    }

    /**
     * Analyze the intent from the full context of what the user said
     * Now supports both English and Spanish!
     */
    analyzeIntent(text) {
        const intents = {
            // English | Spanish
            payment: /\b(pay|payment|bill|billing|invoice|charge|fee|cost|money|owe|owing|pagar|pago|factura|facturación|cobro|costo|dinero|deber)\b/i,
            report: /\b(report|complaint|issue|problem|broken|damaged|pothole|trash|graffiti|streetlight|reportar|reporte|queja|problema|roto|dañado|bache|basura|grafiti|luz)\b/i,
            application: /\b(apply|application|form|submit|register|registration|enroll|enrollment|sign up|signup|aplicar|aplicación|formulario|enviar|registrar|registro|inscribir|inscripción)\b/i,
            permit: /\b(permit|permission|approval|license|licensing|authorization|building|construction|permiso|aprobación|licencia|autorización|construcción|edificio|edificar)\b/i,
            information: /\b(information|info|learn|about|what is|tell me|show me|find|search|lookup|look up|información|aprender|sobre|qué es|dime|muéstrame|mostrar|buscar|encontrar)\b/i,
            schedule: /\b(schedule|appointment|book|reserve|reservation|meeting|calendar|horario|cita|reservar|reserva|reunión|calendario|agendar)\b/i,
            emergency: /\b(emergency|urgent|police|fire|ambulance|911|crisis|danger|emergencia|urgente|policía|bomberos|ambulancia|crisis|peligro)\b/i,
            account: /\b(account|login|sign in|signin|profile|settings|my account|portal|cuenta|entrar|iniciar sesión|perfil|configuración|mi cuenta)\b/i,
            utility: /\b(water|electric|electricity|gas|utility|utilities|sewer|trash|garbage|recycling|waste|agua|eléctrico|electricidad|utilidad|servicios|alcantarillado|basura|reciclaje|desechos)\b/i,
            job: /\b(job|career|employment|work|hiring|position|opening|vacancy|apply|trabajo|carrera|empleo|trabajar|contratar|puesto|vacante|aplicar)\b/i,
            event: /\b(event|program|class|workshop|activity|recreation|park|library|evento|programa|clase|taller|actividad|recreación|parque|biblioteca)\b/i,
            contact: /\b(contact|call|phone|email|reach|speak|talk|ask|question|contacto|llamar|teléfono|correo|alcanzar|hablar|preguntar|pregunta)\b/i
        };

        const detected = [];
        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(text)) {
                detected.push(intent);
            }
        }

        return detected.length > 0 ? detected : ['general'];
    }

    /**
     * Score content based on detected intent
     */
    scoreByIntent(intents, title, content) {
        let score = 0;
        const combined = `${title} ${content}`;

        intents.forEach(intent => {
            switch (intent) {
                case 'payment':
                    if (/\b(pay|payment|bill|online.*pay|pagar|pago|factura)\b/i.test(combined)) score += 5;
                    break;
                case 'report':
                    if (/\b(report|complaint|issue|problem|fix|reportar|queja|problema)\b/i.test(combined)) score += 5;
                    break;
                case 'application':
                    if (/\b(apply|application|form|submit|aplicar|aplicación|formulario)\b/i.test(combined)) score += 5;
                    break;
                case 'permit':
                    if (/\b(permit|license|approval|building|permiso|licencia|construcción)\b/i.test(combined)) score += 5;
                    break;
                case 'information':
                    if (/\b(information|directory|guide|resource|información|directorio|guía)\b/i.test(combined)) score += 3;
                    break;
                case 'schedule':
                    if (/\b(schedule|appointment|book|calendar|horario|cita|calendario)\b/i.test(combined)) score += 5;
                    break;
                case 'emergency':
                    if (/\b(emergency|police|fire|urgent|emergencia|policía|bomberos|urgente)\b/i.test(combined)) score += 10;
                    break;
                case 'account':
                    if (/\b(account|login|portal|profile|cuenta|entrar|perfil)\b/i.test(combined)) score += 5;
                    break;
                case 'utility':
                    if (/\b(water|electric|utility|sewer|trash|agua|eléctrico|basura)\b/i.test(combined)) score += 5;
                    break;
                case 'job':
                    if (/\b(job|career|employment|hiring|trabajo|carrera|empleo)\b/i.test(combined)) score += 5;
                    break;
                case 'event':
                    if (/\b(event|program|class|recreation|evento|programa|clase|recreación)\b/i.test(combined)) score += 5;
                    break;
                case 'contact':
                    if (/\b(contact|phone|email|directory|contacto|teléfono|correo)\b/i.test(combined)) score += 4;
                    break;
            }
        });

        return score;
    }

    /**
     * Calculate semantic similarity between user input and service content
     * Enhanced with Spanish synonym support
     */
    calculateSemanticSimilarity(userText, title, content) {
        let score = 0;

        // Common phrase mappings (what users say -> what services are called)
        // English | Spanish
        const synonyms = {
            'fix': ['repair', 'maintenance', 'service'],
            'arreglar': ['reparar', 'mantenimiento', 'servicio'],
            'broken': ['damaged', 'issue', 'problem'],
            'roto': ['dañado', 'problema'],
            'trash': ['garbage', 'waste', 'recycling'],
            'basura': ['desechos', 'residuos', 'reciclaje'],
            'light': ['streetlight', 'lighting', 'illumination'],
            'luz': ['alumbrado', 'iluminación'],
            'road': ['street', 'highway', 'pavement'],
            'calle': ['camino', 'carretera', 'pavimento'],
            'house': ['home', 'residential', 'property'],
            'casa': ['hogar', 'residencial', 'propiedad'],
            'business': ['commercial', 'company', 'enterprise'],
            'negocio': ['comercial', 'empresa', 'compañía'],
            'kid': ['child', 'youth', 'junior'],
            'niño': ['hijo', 'joven', 'menor'],
            'senior': ['elderly', 'older adult'],
            'mayor': ['anciano', 'adulto mayor'],
            'dog': ['pet', 'animal'],
            'perro': ['mascota', 'animal'],
            'pool': ['aquatic', 'swimming'],
            'piscina': ['acuático', 'natación'],
            'book': ['library', 'reading'],
            'libro': ['biblioteca', 'lectura'],
            'park': ['recreation', 'outdoor'],
            'parque': ['recreación', 'aire libre']
        };

        const combined = `${title} ${content}`;
        
        // Check for synonym matches
        for (const [userWord, serviceWords] of Object.entries(synonyms)) {
            if (userText.includes(userWord)) {
                serviceWords.forEach(serviceWord => {
                    if (combined.includes(serviceWord)) {
                        score += 3;
                    }
                });
            }
        }

        // Context-aware phrases (longer phrases get bonus)
        // English | Spanish
        const contextPhrases = [
            // English phrases
            { user: 'pay my bill', service: 'pay.*bill|bill.*pay|online.*payment', score: 8 },
            { user: 'water bill', service: 'water.*bill|utility.*billing', score: 8 },
            { user: 'trash pickup', service: 'trash.*service|waste.*collection', score: 8 },
            { user: 'job opening', service: 'job.*opportunit|career|employment', score: 8 },
            { user: 'building permit', service: 'building.*permit|construction.*permit', score: 8 },
            { user: 'police report', service: 'police.*report|non.*emergency', score: 8 },
            { user: 'park program', service: 'park|recreation.*program', score: 7 },
            { user: 'street light', service: 'streetlight|street.*light|lighting', score: 7 },
            // Spanish phrases
            { user: 'pagar mi factura', service: 'pay.*bill|bill.*pay|online.*payment|utility.*billing', score: 8 },
            { user: 'factura de agua', service: 'water.*bill|utility.*billing', score: 8 },
            { user: 'recogida de basura', service: 'trash.*service|waste.*collection', score: 8 },
            { user: 'recolección de basura', service: 'trash.*service|waste.*collection', score: 8 },
            { user: 'oportunidad de trabajo', service: 'job.*opportunit|career|employment', score: 8 },
            { user: 'permiso de construcción', service: 'building.*permit|construction.*permit', score: 8 },
            { user: 'reporte policial', service: 'police.*report|non.*emergency', score: 8 },
            { user: 'programa del parque', service: 'park|recreation.*program', score: 7 },
            { user: 'luz de la calle', service: 'streetlight|street.*light|lighting', score: 7 },
            { user: 'adoptar un perro', service: 'animal.*service|pet.*adoption|adopt', score: 8 },
            { user: 'adopt a dog', service: 'animal.*service|pet.*adoption|adopt', score: 8 }
        ];

        contextPhrases.forEach(phrase => {
            if (userText.includes(phrase.user)) {
                const regex = new RegExp(phrase.service, 'i');
                if (regex.test(combined)) {
                    score += phrase.score;
                }
            }
        });

        return score;
    }

    handleServiceSearch(transcript) {
        console.log('🎤 Processing voice search:', transcript);
        
        // Check if this is the same transcript as last time (duplicate)
        if (transcript === this.lastTranscript) {
            console.log('🔄 Duplicate transcript, ignoring...');
            return;
        }
        
        // Check cooldown to prevent rapid-fire commands
        const now = Date.now();
        if (now - this.lastCommandTime < this.commandCooldown) {
            console.log('⏳ Command cooldown active, ignoring...');
            return;
        }
        
        const lower = transcript.toLowerCase().trim();
        
        // Analyze intent from the full context
        const intent = this.analyzeIntent(lower);
        console.log('🧠 Detected intent:', intent);
        
        // Extract meaningful words (remove stopwords - English & Spanish)
        const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                                     'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
                                     'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'can', 'could', 'would',
                                     'should', 'will', 'want', 'need', 'like', 'have', 'has', 'had', 'is', 'am',
                                     'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'doing',
                                     'this', 'that', 'these', 'those', 'some', 'any',
                                     // Spanish stopwords
                                     'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero',
                                     'en', 'de', 'del', 'al', 'con', 'por', 'para', 'desde', 'hasta', 'sobre',
                                     'yo', 'mi', 'mis', 'nosotros', 'nuestro', 'tu', 'tus', 'puede', 'podría',
                                     'debería', 'quiero', 'necesito', 'tengo', 'tiene', 'hay', 'soy', 'estoy',
                                     'es', 'está', 'son', 'están', 'era', 'fue', 'ser', 'estar', 'hacer',
                                     'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'algo', 'algún']);
        
        const words = lower.split(/\s+/).filter(word => 
            word.length >= 2 && !stopwords.has(word)
        );
        
        console.log('🔤 Keywords extracted:', words);
        console.log('📝 Original transcript:', transcript);
        
        // Get all visible service cards
        const visibleCards = Array.from(document.querySelectorAll('.service-card'));
        console.log(`🔍 Searching ${visibleCards.length} visible cards`);
        
        let bestCard = null;
        let bestScore = 0;
        let bestTitle = '';
        let bestUrl = null;
        
        // Score each visible card based on keyword matches AND intent
        visibleCards.forEach(card => {
            const titleEl = card.querySelector('h4, h3');
            const title = titleEl ? titleEl.innerText.toLowerCase() : '';
            const textContent = (card.innerText || '').toLowerCase();
            let score = 0;
            
            // Intent-based scoring boost
            score += this.scoreByIntent(intent, title, textContent);
            
            // High-value service keywords get major boost
            const serviceKeywords = ['permits', 'permit', 'water', 'trash', 'job', 'jobs', 'police', 'court', 'meeting', 'records', 'alert', 'shelter', 'adopt', 'vision', 'events', 'bid'];
            words.forEach(word => {
                if (serviceKeywords.includes(word) && title.includes(word)) {
                    score += 10; // Major boost for direct service keyword match
                    console.log(`  🎯 Service keyword "${word}" matched in title "${title}" (+10)`);
                }
            });
            
            // Score based on word matches
            words.forEach(word => {
                // Higher score for title matches
                if (title.includes(word)) score += 3;
                // Medium score for text matches
                else if (textContent.includes(word)) score += 1;
                // Bonus for exact word boundary in title
                if (title.match(new RegExp('\\b' + word + '\\b'))) score += 2;
            });
            
            // Semantic similarity bonus
            score += this.calculateSemanticSimilarity(lower, title, textContent);
            
            // Must have a link
            const link = card.querySelector('a.service-link, a.card-link, a[href]');
            if (!link || !link.href) score = 0;
            
            if (score > bestScore) {
                bestScore = score;
                bestCard = card;
                bestTitle = title;
                bestUrl = link ? link.href : null;
            }
            
            if (score > 0) {
                console.log(`  Card "${title}" score: ${score}`);
            }
        });
        
        // Also search comprehensive cards (not yet rendered)
        if (typeof window.serviceCards !== 'undefined') {
            console.log('🔍 Also searching comprehensive cards catalog...');
            Object.entries(window.serviceCards).forEach(([id, card]) => {
                const title = (card.title || '').toLowerCase();
                const desc = (card.description || '').toLowerCase();
                const keywords = (card.keywords || []).map(k => k.toLowerCase());
                let score = 0;
                
                // Intent-based scoring boost
                score += this.scoreByIntent(intent, title, desc);
                
                // High-value service keywords get major boost (same as visible cards)
                const serviceKeywords = ['permits', 'permit', 'water', 'trash', 'job', 'jobs', 'police', 'court', 'meeting', 'records', 'alert', 'shelter', 'adopt', 'vision', 'events', 'bid', 'airport', 'parking', 'library', 'pool', 'park'];
                words.forEach(word => {
                    if (serviceKeywords.includes(word) && title.includes(word)) {
                        score += 10; // Major boost for direct service keyword match
                        console.log(`  🎯 Service keyword "${word}" matched in comprehensive card "${title}" (+10)`);
                    }
                });
                
                words.forEach(word => {
                    // Score title matches
                    if (title.includes(word)) score += 3;
                    if (title.match(new RegExp('\\b' + word + '\\b'))) score += 2;
                    
                    // Score keyword matches (high priority)
                    if (keywords.some(k => k.includes(word))) score += 4;
                    
                    // Score description matches
                    if (desc.includes(word)) score += 1;
                });
                
                // Semantic similarity bonus
                score += this.calculateSemanticSimilarity(lower, title, desc);
                
                if (card.url && score > bestScore) {
                    bestScore = score;
                    bestCard = null; // Not visible yet
                    bestTitle = card.title;
                    bestUrl = card.url;
                    console.log(`  Comprehensive card "${card.title}" score: ${score}`);
                }
            });
        }
        
        console.log(`🎯 Best match: "${bestTitle}" (score: ${bestScore})`);
        
        // Open the best match if score is high enough
        if (bestScore >= 2 && bestUrl) {
            this.lastCommandTime = now; // Update last command time
            this.lastTranscript = transcript; // Store this transcript to prevent duplicates
            
            // Clear the last transcript after cooldown expires
            setTimeout(() => {
                this.lastTranscript = '';
            }, this.commandCooldown);
            
            // Keep recognition running - just open the link
            console.log('🔗 Opening link while keeping voice recognition active...');
            
            // Open the link in overlay instead of new tab
            if (bestCard) {
                this.highlightAndOpenCard(bestCard, bestTitle);
            } else {
                console.log('✅ Opening comprehensive card:', bestTitle, '->', bestUrl);
                // Use overlay if available, otherwise fall back to new tab
                if (window.websiteOverlay) {
                    window.websiteOverlay.open(bestUrl, bestTitle);
                } else {
                    // Fallback: open in new tab
                    const tempLink = document.createElement('a');
                    tempLink.href = bestUrl;
                    tempLink.target = '_blank';
                    tempLink.rel = 'noopener noreferrer';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                }
                console.log('✅ Link opened via overlay or temporary anchor element');
            }
            
            this.showResult(`✅ Opening ${bestTitle}`, true);
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Recognition continues running - no need to restart!
            console.log('✅ Voice recognition still active and listening...');
        } else {
            console.log('❌ No good matches found');
            this.showResult(`🔍 No matches for "${transcript}"`);
        }
    }

    highlightAndOpenCard(card, title) {
        console.log('✨ Highlighting card:', title);
        
        // Add highlight class
        card.classList.add('service-card-opening');
        
        // Scroll into view
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Find the link
        const link = card.querySelector('a.service-link, a.card-link, a[href]');
        if (link && link.href) {
            console.log(`✅ Opening link: ${link.href}`);
            
            // Use overlay if available, otherwise open in new tab
            if (window.websiteOverlay) {
                window.websiteOverlay.open(link.href, title);
            } else {
                // Fallback: create temporary link element
                const tempLink = document.createElement('a');
                tempLink.href = link.href;
                tempLink.target = '_blank';
                tempLink.rel = 'noopener noreferrer';
                tempLink.style.display = 'none';
                document.body.appendChild(tempLink);
                
                try {
                    tempLink.click();
                    console.log('✅ Link clicked successfully via temporary anchor');
                } catch (err) {
                    console.error('❌ Failed to click link:', err);
                    window.location.href = link.href;
                } finally {
                    setTimeout(() => document.body.removeChild(tempLink), 100);
                }
            }
        } else {
            console.warn('⚠️ No link found in card');
        }
        
        // Remove highlight after animation
        setTimeout(() => {
            card.classList.remove('service-card-opening');
        }, 2000);
    }

    highlightServiceCard(cardId) {
        console.log('🔍 Looking for card with ID:', cardId);
        
        // Find and highlight the card
        const cards = document.querySelectorAll('.service-card');
        let matched = false;
        
        cards.forEach(card => {
            card.classList.remove('voice-matched');
            
            // Match by data-card-id attribute or title content
            const dataCardId = card.getAttribute('data-card-id');
            const cardTitle = card.querySelector('h4')?.textContent.toLowerCase() || '';
            const searchTerm = cardId.replace(/-/g, ' ').toLowerCase();
            
            console.log('Checking card:', { dataCardId, cardTitle, searchTerm, matches: dataCardId === cardId });
            
            // Match by ID or title containing search term
            if (dataCardId === cardId || cardTitle.includes(searchTerm)) {
                console.log('✅ Match found! Highlighting card:', dataCardId);
                card.classList.add('voice-matched');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                matched = true;
                
                // Find and click the link in the card
                const link = card.querySelector('a.service-link, a.card-link, a[href]');
                if (link && link.href) {
                    console.log('✅ Opening link:', link.href);
                    setTimeout(() => {
                        try {
                            window.open(link.href, '_blank', 'noopener,noreferrer');
                        } catch (err) {
                            console.error('❌ Failed to open link:', err);
                            window.location.href = link.href;
                        }
                    }, 500); // Small delay for visual feedback
                } else {
                    console.warn('⚠️ No link found in card');
                }
                
                // Remove highlight after animation
                setTimeout(() => {
                    card.classList.remove('voice-matched');
                }, 3000);
            }
        });
        
        if (!matched) {
            console.warn('❌ No card found for ID:', cardId);
        }
        
        return matched;
    }

    openService(serviceName) {
        // Find matching service card
        const cards = document.querySelectorAll('.service-card');
        for (const card of cards) {
            const title = card.querySelector('h3')?.textContent.toLowerCase();
            if (title?.includes(serviceName.toLowerCase())) {
                const button = card.querySelector('button');
                if (button) {
                    button.click();
                    this.showResult(`✅ Opening ${serviceName}`, true);
                    return true;
                }
            }
        }
        return false;
    }

    showResult(message, isSuccess = false) {
        if (!this.resultDisplay) return;
        
        this.resultDisplay.textContent = message;
        this.resultDisplay.classList.remove('hidden');
        
        if (isSuccess) {
            this.resultDisplay.classList.add('success');
        } else {
            this.resultDisplay.classList.remove('success');
        }

        // Auto-hide all messages after 1.5 seconds
        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.hideResult();
        }, 1500);
    }

    hideResult() {
        if (!this.resultDisplay) return;
        this.resultDisplay.classList.add('hidden');
        this.resultDisplay.classList.remove('success');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOM loaded, initializing Ambient Voice Recognition...');
        window.ambientVoice = new AmbientVoiceRecognition();
    });
} else {
    console.log('✅ DOM already loaded, initializing Ambient Voice Recognition immediately...');
    window.ambientVoice = new AmbientVoiceRecognition();
}
