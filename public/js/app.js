/**
 * Jett - City of Odessa AI Assistant
 * Custom UI Integration with ElevenLabs Conversational AI
 */

// Application state
const state = {
    config: null,
    elevenLabsSocket: null,
    audioStream: null,
    audioContext: null,
    audioProcessor: null,
    isStreaming: false,
    isMuted: false,
    audioQueue: [],
    isPlayingAudio: false
};

// DOM Elements
const elements = {
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    muteBtn: document.getElementById('mute-btn'),
    statusIndicator: document.getElementById('status-indicator'),
    statusDot: document.querySelector('.status-dot'),
    statusText: document.querySelector('.status-text'),
    loadingOverlay: document.getElementById('loading-overlay'),
    errorModal: document.getElementById('error-modal'),
    errorMessage: document.getElementById('error-message'),
    closeErrorModal: document.getElementById('close-error-modal'),
    retryBtn: document.getElementById('retry-btn')
};

/**
 * Initialize the application
 */
async function init() {
    try {
        console.log('🚀 Initializing Jett...');
        updateStatus('Initializing...', 'connecting');
        
        // Load configuration from server
        state.config = await fetchConfig();
        console.log('✅ Configuration loaded');
        
        // Setup event listeners
        setupEventListeners();
        
        // Mark as ready
        updateStatus('Ready', 'connected');
        elements.loadingOverlay.classList.add('hidden');
        
        console.log('✅ Jett initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize Jett. Please refresh the page and try again.');
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
 * Setup event listeners for UI controls
 */
function setupEventListeners() {
    // Start conversation button
    elements.startBtn.addEventListener('click', startConversation);
    
    // Stop conversation button
    elements.stopBtn.addEventListener('click', stopConversation);
    
    // Mute button
    elements.muteBtn.addEventListener('click', toggleMute);
    
    // Error modal controls
    elements.closeErrorModal.addEventListener('click', () => {
        elements.errorModal.style.display = 'none';
    });
    
    elements.retryBtn.addEventListener('click', () => {
        elements.errorModal.style.display = 'none';
        init();
    });
}

/**
 * Start a conversation with ElevenLabs Conversational AI
 */
async function startConversation() {
    try {
        console.log('🎙️ Starting ElevenLabs conversation...');
        updateStatus('Starting...', 'connecting');
        elements.startBtn.disabled = true;
        
        // Step 1: Get ElevenLabs signed URL from our server
        console.log('Getting ElevenLabs signed URL...');
        const response = await fetch('/api/conversation/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to start ElevenLabs session');
        }
        
        const { signedUrl } = await response.json();
        console.log('✅ ElevenLabs signed URL received');
        console.log('WebSocket URL:', signedUrl);
        
        // Step 2: Get microphone access
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
        
        // Step 3: Connect to ElevenLabs WebSocket
        console.log('Connecting to ElevenLabs WebSocket...');
        state.elevenLabsSocket = new WebSocket(signedUrl);
        
        // Setup ElevenLabs event handlers
        setupElevenLabsEventHandlers();
        
        // Wait for connection to open
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('WebSocket connection timeout'));
            }, 10000);
            
            state.elevenLabsSocket.addEventListener('open', () => {
                clearTimeout(timeout);
                console.log('✅ Connected to ElevenLabs WebSocket');
                resolve();
            }, { once: true });
            
            state.elevenLabsSocket.addEventListener('error', (error) => {
                clearTimeout(timeout);
                console.error('WebSocket error:', error);
                reject(new Error('WebSocket connection failed'));
            }, { once: true });
        });
        
        // Step 4: Start audio streaming
        console.log('🎵 Starting audio streaming...');
        startAudioStreaming();
        
        state.isStreaming = true;
        
        // Update UI
        elements.startBtn.style.display = 'none';
        elements.stopBtn.style.display = 'inline-flex';
        elements.muteBtn.style.display = 'inline-flex';
        updateStatus('Connected', 'connected');
        
        console.log('✅ Conversation started successfully');
        console.log('🎤 Speak now - Jett is listening via ElevenLabs!');
        
    } catch (error) {
        console.error('❌ Error starting conversation:', error);
        showError(`Failed to start conversation: ${error.message}`);
        updateStatus('Error', 'error');
        elements.startBtn.disabled = false;
        
        // Cleanup on error
        if (state.elevenLabsSocket) {
            try {
                state.elevenLabsSocket.close();
            } catch (e) {
                console.error('Error during cleanup:', e);
            }
            state.elevenLabsSocket = null;
        }
        if (state.audioStream) {
            state.audioStream.getTracks().forEach(track => track.stop());
            state.audioStream = null;
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
    
    state.audioProcessor.onaudioprocess = (event) => {
        if (state.elevenLabsSocket && state.elevenLabsSocket.readyState === WebSocket.OPEN && !state.isMuted) {
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
            
            // Send audio in ElevenLabs expected format
            const audioMessage = {
                user_audio_chunk: base64Audio
            };
            
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
        
        // Clear audio queue
        state.audioQueue = [];
        state.isPlayingAudio = false;
        
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
            state.isStreaming = false;
        }
        
        // Reset UI
        elements.stopBtn.style.display = 'none';
        elements.muteBtn.style.display = 'none';
        elements.startBtn.style.display = 'inline-flex';
        elements.startBtn.disabled = false;
        updateStatus('Ready', 'connected');
        
        console.log('✅ Conversation stopped');
        
    } catch (error) {
        console.error('❌ Error stopping conversation:', error);
        showError('Failed to stop conversation properly');
    }
}

/**
 * Toggle mute/unmute
 */
function toggleMute() {
    // Note: ElevenLabs handles muting through the WebSocket protocol
    // For now, we'll just toggle the UI state
    state.isMuted = !state.isMuted;
    
    if (state.isMuted) {
        elements.muteBtn.textContent = '🔇 Unmute';
        console.log('🔇 Muted (Note: ElevenLabs muting to be implemented)');
    } else {
        elements.muteBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            Mute
        `;
        console.log('🔊 Unmuted');
    }
}

/**
 * Setup ElevenLabs WebSocket event handlers
 */
function setupElevenLabsEventHandlers() {
    if (!state.elevenLabsSocket) return;
    
    state.elevenLabsSocket.addEventListener('message', (event) => {
        // Handle binary audio data
        if (event.data instanceof ArrayBuffer) {
            playAudioChunk(event.data);
            return;
        }
        
        try {
            const data = JSON.parse(event.data);
            console.log('📩 ElevenLabs message:', data);
            
            // Handle different message types
            switch (data.type) {
                case 'conversation_initiation_metadata':
                    console.log('� Conversation initiated:', data);
                    break;
                    
                case 'audio':
                    console.log('🔊 Audio data received');
                    // If audio data is in the message, play it
                    if (data.audio_event && data.audio_event.audio_base_64) {
                        const audioData = base64ToArrayBuffer(data.audio_event.audio_base_64);
                        playAudioChunk(audioData);
                    }
                    break;
                    
                case 'user_transcript':
                    console.log('👤 You said:', data.user_transcript || data.transcript);
                    break;
                    
                case 'agent_response':
                    console.log('🤖 Jett said:', data.agent_response || data.transcript);
                    break;
                    
                case 'interruption':
                    console.log('🚫 User interrupted - clearing audio queue');
                    // Clear audio queue when user interrupts
                    state.audioQueue = [];
                    state.isPlayingAudio = false;
                    break;
                    
                case 'agent_chat_response_part':
                    // Agent is speaking (text part)
                    if (data.text_response_part && data.text_response_part.text) {
                        console.log('🤖 Jett:', data.text_response_part.text);
                    }
                    break;
                    
                case 'ping':
                    // Respond to ping with pong
                    console.log('🏓 Ping received, sending pong...');
                    if (state.elevenLabsSocket.readyState === WebSocket.OPEN) {
                        const pongMessage = {
                            type: 'pong',
                            event_id: data.ping_event?.event_id || Date.now()
                        };
                        state.elevenLabsSocket.send(JSON.stringify(pongMessage));
                        console.log('🏓 Pong sent');
                    }
                    break;
                    
                case 'error':
                    console.error('❌ ElevenLabs error:', data);
                    showError(`Conversation error: ${data.message || 'Unknown error'}`);
                    break;
                    
                default:
                    console.log('ℹ️ Other message type:', data.type, data);
            }
        } catch (error) {
            console.error('Error parsing message:', error, event.data);
        }
    });
    
    state.elevenLabsSocket.addEventListener('close', (event) => {
        console.log('� ElevenLabs connection closed:', event.code, event.reason);
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
 * Helper function to convert base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Play audio chunk from ElevenLabs
 */
function playAudioChunk(arrayBuffer) {
    // Add to queue
    state.audioQueue.push(arrayBuffer);
    
    // Start playing if not already playing
    if (!state.isPlayingAudio) {
        playNextAudioChunk();
    }
}

/**
 * Play next audio chunk from queue
 */
function playNextAudioChunk() {
    if (state.audioQueue.length === 0) {
        state.isPlayingAudio = false;
        return;
    }
    
    state.isPlayingAudio = true;
    const arrayBuffer = state.audioQueue.shift();
    
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // ElevenLabs sends PCM16 audio at 16kHz, mono
    const sampleRate = 16000;
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    
    // Convert Int16 PCM to Float32 for Web Audio API
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
    }
    
    // Create audio buffer
    const audioBuffer = state.audioContext.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);
    
    // Play the audio
    const source = state.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(state.audioContext.destination);
    
    // When this chunk finishes, play the next one
    source.onended = () => {
        playNextAudioChunk();
    };
    
    source.start(0);
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

// Initialize on page load
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
});

// Export for debugging
window.JettApp = {
    state,
    startConversation,
    stopConversation,
    toggleMute
};
