/**
 * Cinematic Page Transitions System
 * - Transcript messages slide in with staggered timing
 * - Panel transitions with blur and scale effects
 * - Smooth reveal animations on scroll
 * - State change transitions with cinematic effects
 */

class CinematicTransitions {
    constructor() {
        this.observer = null;
        this.messageQueue = [];
        this.isProcessingQueue = false;
        this.init();
    }

    init() {
        this.initScrollReveal();
        this.initTranscriptAnimations();
        this.initPanelTransitions();
        this.initStateTransitions();
    }

    /**
     * Scroll Reveal Animations
     * Elements fade and slide in as they enter viewport
     */
    initScrollReveal() {
        // Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Unobserve after reveal
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe service cards
        document.querySelectorAll('.service-card').forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.05}s`;
            card.classList.add('reveal-on-scroll');
            this.observer.observe(card);
        });

        // Observe other elements
        document.querySelectorAll('.panel, .control-panel, .language-switcher').forEach(el => {
            el.classList.add('reveal-on-scroll');
            this.observer.observe(el);
        });
    }

    /**
     * Transcript Message Animations
     * Messages slide in from side with stagger effect
     */
    initTranscriptAnimations() {
        // Watch for new messages added to transcript
        const transcriptContainer = document.getElementById('transcript');
        if (!transcriptContainer) return;

        // MutationObserver to detect new messages
        const messageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('message')) {
                        this.animateMessage(node);
                    }
                });
            });
        });

        messageObserver.observe(transcriptContainer, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Animate individual transcript message
     */
    animateMessage(messageElement) {
        // Determine message type for direction
        const isUser = messageElement.classList.contains('user-message');
        const isAgent = messageElement.classList.contains('agent-message');

        // Set initial state
        messageElement.style.opacity = '0';
        messageElement.style.transform = isUser 
            ? 'translateX(50px) scale(0.95)' 
            : 'translateX(-50px) scale(0.95)';
        messageElement.style.filter = 'blur(5px)';

        // Trigger animation after small delay
        setTimeout(() => {
            messageElement.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0) scale(1)';
            messageElement.style.filter = 'blur(0)';

            // Add entrance effect
            if (isUser) {
                messageElement.style.animation = 'slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            } else if (isAgent) {
                messageElement.style.animation = 'slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }
        }, 50);

        // Auto-scroll with smooth easing
        const transcriptContainer = document.getElementById('transcript');
        if (transcriptContainer) {
            this.smoothScrollToBottom(transcriptContainer);
        }
    }

    /**
     * Smooth scroll to bottom of transcript
     */
    smoothScrollToBottom(container) {
        if (!container) return;
        
        const targetScroll = container.scrollHeight;
        const startScroll = container.scrollTop;
        const distance = targetScroll - startScroll;
        const duration = 600;
        const startTime = performance.now();

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);

            container.scrollTop = startScroll + (distance * eased);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }

    /**
     * Panel Transition Effects
     * Panels blur and scale on hide/show
     */
    initPanelTransitions() {
        const panels = document.querySelectorAll('.panel, .control-panel');

        panels.forEach(panel => {
            // Add transition watcher
            const originalDisplay = window.getComputedStyle(panel).display;

            // Override display changes with transitions
            const panelObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                        const isHidden = panel.classList.contains('hidden') || 
                                       window.getComputedStyle(panel).display === 'none';
                        
                        if (isHidden && !panel.hasAttribute('data-hiding')) {
                            this.hidePanel(panel);
                        } else if (!isHidden && panel.hasAttribute('data-hiding')) {
                            this.showPanel(panel);
                        }
                    }
                });
            });

            panelObserver.observe(panel, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        });
    }

    /**
     * Hide panel with blur and scale
     */
    hidePanel(panel) {
        panel.setAttribute('data-hiding', 'true');
        panel.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        panel.style.transform = 'scale(0.95)';
        panel.style.opacity = '0';
        panel.style.filter = 'blur(10px)';

        setTimeout(() => {
            panel.style.display = 'none';
            panel.removeAttribute('data-hiding');
        }, 400);
    }

    /**
     * Show panel with blur and scale
     */
    showPanel(panel) {
        panel.style.display = '';
        panel.style.transform = 'scale(0.95)';
        panel.style.opacity = '0';
        panel.style.filter = 'blur(10px)';

        requestAnimationFrame(() => {
            panel.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            panel.style.transform = 'scale(1)';
            panel.style.opacity = '1';
            panel.style.filter = 'blur(0)';
        });
    }

    /**
     * State Transition Effects
     * Loading states with cinematic blur and fade
     */
    initStateTransitions() {
        // Watch for loading overlay changes
        const loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) return;

        const overlayObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    const isHidden = loadingOverlay.classList.contains('hidden');
                    
                    if (!isHidden) {
                        this.showLoadingState(loadingOverlay);
                    } else {
                        this.hideLoadingState(loadingOverlay);
                    }
                }
            });
        });

        overlayObserver.observe(loadingOverlay, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    /**
     * Show loading state with cinematic effect
     */
    showLoadingState(overlay) {
        overlay.style.opacity = '0';
        overlay.style.backdropFilter = 'blur(0px)';
        overlay.style.display = 'flex';

        requestAnimationFrame(() => {
            overlay.style.transition = 'all 0.4s ease-out';
            overlay.style.opacity = '1';
            overlay.style.backdropFilter = 'blur(20px)';
        });
    }

    /**
     * Hide loading state with fade
     */
    hideLoadingState(overlay) {
        overlay.style.transition = 'all 0.3s ease-in';
        overlay.style.opacity = '0';
        overlay.style.backdropFilter = 'blur(0px)';

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }

    /**
     * Page entrance animation
     */
    playPageEntrance() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        appContainer.style.opacity = '0';
        appContainer.style.transform = 'scale(0.98)';
        appContainer.style.filter = 'blur(10px)';

        setTimeout(() => {
            appContainer.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            appContainer.style.opacity = '1';
            appContainer.style.transform = 'scale(1)';
            appContainer.style.filter = 'blur(0)';
        }, 100);
    }

    /**
     * Service card grid entrance
     */
    playServiceCardsEntrance() {
        const cards = document.querySelectorAll('.service-card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';
            card.style.filter = 'blur(5px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.filter = 'blur(0)';
            }, 100 + (index * 50));
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cinematicTransitions = new CinematicTransitions();
        // Play entrance animation
        setTimeout(() => {
            window.cinematicTransitions.playPageEntrance();
            window.cinematicTransitions.playServiceCardsEntrance();
        }, 100);
    });
} else {
    window.cinematicTransitions = new CinematicTransitions();
    // Play entrance animation
    setTimeout(() => {
        window.cinematicTransitions.playPageEntrance();
        window.cinematicTransitions.playServiceCardsEntrance();
    }, 100);
}
