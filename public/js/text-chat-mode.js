/**
 * Text-Only Chat Mode using ElevenLabs Chat API
 * - Simple HTTP requests to backend
 * - Uses ElevenLabs Chat Mode (text-only, no audio)
 * - No audio/video involvement
 * - Completely isolated from voice conversation
 */

class TextChatMode {
    constructor() {
        this.isActive = false;
        this.conversationId = null; // Track conversation for context
        
        this.elements = {
            container: document.getElementById('text-chat-input-container'),
            input: document.getElementById('text-chat-input'),
            sendBtn: document.getElementById('text-send-btn'),
            transcript: document.getElementById('transcript'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn')
        };
        
        this.init();
    }

    init() {
        if (!this.elements.container || !this.elements.input) {
            console.warn('Text chat elements not found');
            return;
        }

        // Add text mode toggle button to controls
        this.addTextModeToggle();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    addTextModeToggle() {
        const controlsContainer = document.querySelector('.controls-container');
        if (!controlsContainer) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'text-mode-toggle';
        toggleBtn.className = 'control-btn secondary-btn';
        toggleBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                <line x1="8" y1="10" x2="16" y2="10"></line>
                <line x1="8" y1="14" x2="14" y2="14"></line>
            </svg>
            <span data-i18n="textMode">Text Mode</span>
        `;
        toggleBtn.title = 'Switch to text-only chat (audio muted)';
        
        // Insert after start button
        controlsContainer.insertBefore(toggleBtn, this.elements.startBtn.nextSibling);
        
        toggleBtn.addEventListener('click', () => this.toggleTextMode());
    }

    setupEventListeners() {
        // Send button click
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        this.elements.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async toggleTextMode() {
        if (this.isActive) {
            await this.stopTextMode();
        } else {
            await this.startTextMode();
        }
    }

    async startTextMode() {
        try {
            console.log('🔤 Starting text-only mode...');
            
            // Set global flag to prevent ANAM from processing messages
            window.TEXT_MODE_ACTIVE = true;
            
            this.isActive = true;
            this.conversationId = null; // Reset conversation ID
            
            // Update UI
            this.elements.container.classList.remove('hidden');
            this.elements.startBtn.style.display = 'none';
            document.getElementById('text-mode-toggle').style.display = 'none';
            this.elements.stopBtn.style.display = 'inline-flex';
            
            // Clear welcome message
            if (this.elements.transcript) {
                const welcomeMsg = this.elements.transcript.querySelector('.welcome-message');
                if (welcomeMsg) welcomeMsg.remove();
            }
            
            // Show welcome message
            this.addMessage('agent', 'Hello! I\'m Jett, your City of Odessa assistant. How can I help you today?');
            
            this.showStatus('Text mode active - Type your message', 'success');
            this.elements.input.focus();
            
            console.log('✅ Text mode started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start text mode:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
            await this.stopTextMode();
        }
    }

    async stopTextMode() {
        console.log('🛑 Stopping text mode...');
        
        // Clear global flag - ANAM can speak again
        window.TEXT_MODE_ACTIVE = false;
        
        this.isActive = false;
        this.conversationId = null; // Clear conversation ID
        
        // Update UI
        this.elements.container.classList.add('hidden');
        this.elements.startBtn.style.display = 'inline-flex';
        document.getElementById('text-mode-toggle').style.display = 'inline-flex';
        this.elements.stopBtn.style.display = 'none';
        this.elements.input.value = '';
        
        console.log('✅ Text mode stopped');
    }

        const text = this.elements.input.value.trim();
        
        if (!text || !this.isActive) {
            console.warn('Cannot send: no text or not active');
            return;
        }
        
        console.log('📤 Sending text message:', text);
        
        try {
            // Add user message to transcript
            this.addMessage('user', text);
            
            // Clear input
            this.elements.input.value = '';
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Send to backend API with conversation ID for context
            const response = await fetch('/api/text-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    conversationId: this.conversationId // Send conversation ID for context
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success || !data.response) {
                throw new Error('Invalid response from server');
            }
            
            // Store conversation ID for next message
            if (data.conversationId) {
                this.conversationId = data.conversationId;
                console.log('💾 Conversation ID:', this.conversationId);
            }
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add agent response to transcript
            this.addMessage('agent', data.response);
            
            console.log('✅ Response received from ElevenLabs');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showStatus('Failed to send message. Please try again.', 'error');
        }
    }

    addMessage(role, text) {
        if (!this.elements.transcript) return;
        
        // Remove typing indicator
        this.hideTypingIndicator();
        
        // Use the main app's addTranscriptMessage function if available
        // This ensures consistent UI styling between voice and text modes
        if (typeof window.addTranscriptMessage === 'function') {
            // Detect and show relevant cards for agent messages
            let cards = null;
            if (role === 'agent' && window.detectCardsFromContext) {
                cards = window.detectCardsFromContext(this.lastUserMessage || '', text);
            }
            
            // Use the main app's message rendering with full styling
            window.addTranscriptMessage(role, text, cards);
        } else {
            // Fallback: simple message (shouldn't happen but just in case)
            console.warn('addTranscriptMessage not available, using fallback');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}-message`;
            messageDiv.textContent = text;
            this.elements.transcript.appendChild(messageDiv);
        }
        
        // Scroll to bottom
        this.elements.transcript.scrollTop = this.elements.transcript.scrollHeight;
        
        if (role === 'user') {
            this.lastUserMessage = text;
        }
    }

    showTypingIndicator() {
        if (!this.elements.transcript) return;
        
        // Remove existing indicator
        this.hideTypingIndicator();
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'text-typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        this.elements.transcript.appendChild(indicator);
        this.elements.transcript.scrollTop = this.elements.transcript.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('text-typing-indicator');
        if (indicator) indicator.remove();
    }

    showStatus(message, type = 'info') {
        console.log(`[${type}] ${message}`);
        
        // Could add a toast notification here
        if (window.showToast) {
            window.showToast(message, type);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.textChatMode = new TextChatMode();
    });
} else {
    window.textChatMode = new TextChatMode();
}
