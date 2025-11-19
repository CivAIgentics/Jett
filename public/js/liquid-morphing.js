/**
 * Liquid Morphing Animations System
 * - Service cards morph with fluid blob shapes
 * - Avatar container breathes with conversation rhythm
 * - Buttons have elastic squish effects
 * - Smooth SVG path morphing using custom easing
 */

class LiquidMorphing {
    constructor() {
        this.morphingElements = [];
        this.avatarBreathing = null;
        this.conversationActive = false;
        this.init();
    }

    init() {
        this.initCardMorphing();
        this.initAvatarBreathing();
        this.initElasticButtons();
    }

    /**
     * Service Cards with Blue Fire/Plasma Edge Glow
     * Cards get surrounded by flickering blue plasma flames on hover
     */
    initCardMorphing() {
        const cards = document.querySelectorAll('.service-card');

        // Helper: ensure a given card has a plasma canvas and handlers
        const ensurePlasmaForCard = (card) => {
            if (!card || card.querySelector('.card-plasma-canvas')) return;

            // Create canvas for plasma effect
            const canvas = document.createElement('canvas');
            canvas.className = 'card-plasma-canvas';
            canvas.width = 600;
            canvas.height = 600;
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.4s ease;
                z-index: 10;
                mix-blend-mode: screen;
                border-radius: inherit;
            `;

            const ctx = canvas.getContext('2d');
            card.style.position = 'relative';
            card.style.overflow = 'hidden'; // Contain plasma within card
            card.insertBefore(canvas, card.firstChild);

            let animationFrame = null;
            let particles = [];
            const numParticles = 100; // Slightly reduced for better edge focus

            // Create plasma particles
            const createParticles = () => {
                particles = [];
                const rect = { width: canvas.width, height: canvas.height };
                
                for (let i = 0; i < numParticles; i++) {
                    // Distribute particles around the edges
                    const edge = Math.floor(Math.random() * 4);
                    let x, y;
                    
                    switch(edge) {
                        case 0: // Top
                            x = Math.random() * rect.width;
                            y = 0;
                            break;
                        case 1: // Right
                            x = rect.width;
                            y = Math.random() * rect.height;
                            break;
                        case 2: // Bottom
                            x = Math.random() * rect.width;
                            y = rect.height;
                            break;
                        case 3: // Left
                            x = 0;
                            y = Math.random() * rect.height;
                            break;
                    }
                    
                    particles.push({
                        x,
                        y,
                        baseX: x,
                        baseY: y,
                        size: 3 + Math.random() * 6, // Larger particles
                        speed: 0.5 + Math.random() * 1.5,
                        angle: Math.random() * Math.PI * 2,
                        opacity: 0.6 + Math.random() * 0.4, // Brighter
                        colorShift: Math.random() * 60,
                        flickerSpeed: 0.03 + Math.random() * 0.07 // Faster flicker
                    });
                }
            };

            // Animate plasma effect
            const animatePlasma = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach((particle, i) => {
                    // Flicker effect - more dramatic
                    particle.opacity += (Math.random() - 0.5) * particle.flickerSpeed;
                    particle.opacity = Math.max(0.4, Math.min(1, particle.opacity));
                    
                    // Organic movement - tighter to edges
                    particle.angle += 0.03;
                    const wobble = Math.sin(particle.angle) * 4; // Reduced wobble for tighter effect
                    particle.x = particle.baseX + wobble;
                    particle.y = particle.baseY + wobble;
                    
                    // Color shift (blue plasma: cyan → blue → purple)
                    particle.colorShift += 0.8;
                    const hue = 190 + (Math.sin(particle.colorShift * 0.1) * 50); // 190-240 range (more cyan/blue)
                    
                    // Draw particle with stronger glow
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size * 4 // Larger glow radius
                    );
                    gradient.addColorStop(0, `hsla(${hue}, 100%, 85%, ${particle.opacity})`); // Even brighter center
                    gradient.addColorStop(0.4, `hsla(${hue}, 100%, 65%, ${particle.opacity * 0.7})`);
                    gradient.addColorStop(1, `hsla(${hue}, 100%, 45%, 0)`);
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add extra glow layer for visibility
                    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${particle.opacity * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Connect nearby particles with plasma arcs - more visible
                    particles.slice(i + 1).forEach(other => {
                        const dx = particle.x - other.x;
                        const dy = particle.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) { // Increased connection distance
                            const opacity = (1 - distance / 100) * 0.7; // Even brighter connections
                            ctx.strokeStyle = `hsla(${hue}, 100%, 75%, ${opacity})`;
                            ctx.lineWidth = 2.5; // Even thicker lines
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${opacity})`;
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(other.x, other.y);
                            ctx.stroke();
                            ctx.shadowBlur = 0; // Reset shadow
                        }
                    });
                });
                
                animationFrame = requestAnimationFrame(animatePlasma);
            };

            // Hover effect - start plasma
            card.addEventListener('mouseenter', () => {
                canvas.style.opacity = '1';
                createParticles();
                animatePlasma();
            });

            card.addEventListener('mouseleave', () => {
                canvas.style.opacity = '0';
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            });

            this.morphingElements.push({ card, canvas, particles });
        };

        // Initialize existing cards
        cards.forEach(card => ensurePlasmaForCard(card));

        // Observe container for dynamic changes (language switch may re-render cards)
        const grid = document.querySelector('.service-cards-grid') || document.getElementById('default-cards-grid');
        if (grid && grid instanceof Node) {
            const mo = new MutationObserver(mutations => {
                mutations.forEach(m => {
                    if (m.addedNodes && m.addedNodes.length) {
                        m.addedNodes.forEach(node => {
                            if (node.nodeType === 1 && node.classList && node.classList.contains('service-card')) {
                                // New card added - ensure plasma
                                ensurePlasmaForCard(node);
                            }
                        });
                    }
                });
            });

            try {
                mo.observe(grid, { childList: true, subtree: true });
            } catch (err) {
                console.error('Failed to observe grid:', err);
            }
        } else {
            console.warn('Service cards grid not found for MutationObserver');
        }

        // Re-run ensure for all cards when language changes
        document.addEventListener('languageChanged', () => {
            const updatedCards = document.querySelectorAll('.service-card');
            updatedCards.forEach(card => ensurePlasmaForCard(card));
        });
    }

    /**
     * Avatar Container Breathing Animation
     * Pulses with conversation rhythm
     */
    initAvatarBreathing() {
        const avatarContainer = document.getElementById('anam-avatar-container');
        if (!avatarContainer) return;

        this.avatarBreathing = avatarContainer;

        // Create liquid border effect
        const liquidBorder = document.createElement('div');
        liquidBorder.className = 'avatar-liquid-border';
        liquidBorder.style.cssText = `
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border-radius: 50%;
            background: linear-gradient(45deg, 
                rgba(0, 164, 228, 0.3),
                rgba(138, 43, 226, 0.3),
                rgba(0, 255, 255, 0.3)
            );
            filter: blur(15px);
            opacity: 0;
            animation: liquidPulse 3s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
        `;

        avatarContainer.style.position = 'relative';
        avatarContainer.appendChild(liquidBorder);

        // Listen for conversation events
        window.addEventListener('conversation-started', () => {
            this.conversationActive = true;
            liquidBorder.style.opacity = '1';
            avatarContainer.style.animation = 'avatarBreathing 2s ease-in-out infinite';
        });

        window.addEventListener('conversation-stopped', () => {
            this.conversationActive = false;
            liquidBorder.style.opacity = '0';
            avatarContainer.style.animation = '';
        });
    }

    /**
     * Elastic Squish Effects on Buttons
     * Buttons compress and expand on interaction (excluding toggles)
     */
    initElasticButtons() {
        const buttons = document.querySelectorAll('button:not(.dark-mode-toggle):not(.language-toggle), .btn:not(.dark-mode-toggle):not(.language-toggle)');

        buttons.forEach(button => {
            // Prevent double initialization
            if (button.hasAttribute('data-elastic-initialized')) return;
            button.setAttribute('data-elastic-initialized', 'true');

            // Mouse down - squish
            button.addEventListener('mousedown', (e) => {
                button.style.animation = 'elasticSquish 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });

            // Mouse up - bounce back
            button.addEventListener('mouseup', () => {
                button.style.animation = 'elasticBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });

            // Click - add ripple with elastic effect
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'elastic-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent);
                    transform: translate(-50%, -50%);
                    animation: elasticRipple 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    pointer-events: none;
                `;

                button.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });

            // Hover - slight inflate
            button.addEventListener('mouseenter', () => {
                if (!button.style.animation) {
                    button.style.transform = 'scale(1.05)';
                }
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    /**
     * Wave distortion effect on scroll
     */
    addScrollWaveEffect() {
        const cards = document.querySelectorAll('.service-card');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const distanceFromCenter = Math.abs(centerY - window.innerHeight / 2);
                const maxDistance = window.innerHeight / 2;
                const distortion = 1 - Math.min(distanceFromCenter / maxDistance, 1);
                
                // Apply wave distortion
                const wave = Math.sin(scrollY * 0.01 + index * 0.5) * distortion * 10;
                card.style.transform = `translateY(${wave}px)`;
            });
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.liquidMorphing = new LiquidMorphing();
    });
} else {
    window.liquidMorphing = new LiquidMorphing();
}

// Dispatch conversation events for breathing animation
// These should be called from main app when conversation starts/stops
window.dispatchConversationStarted = () => {
    window.dispatchEvent(new CustomEvent('conversation-started'));
};

window.dispatchConversationStopped = () => {
    window.dispatchEvent(new CustomEvent('conversation-stopped'));
};
