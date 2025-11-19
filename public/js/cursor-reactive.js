/**
 * Cursor-Reactive UI System
 * - Avatar eye tracking that follows cursor
 * - Service cards with 3D tilt and magnetic attraction
 * - Buttons with magnetic hover effects
 * - Elements respond to cursor proximity with smooth animations
 */

class CursorReactiveUI {
    constructor() {
        this.mouse = { x: 0, y: 0 };
        this.elements = {
            avatar: null,
            cards: [],
            buttons: []
        };
        this.init();
    }

    init() {
        // Track mouse position globally
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Initialize all reactive elements
        this.initAvatarEyeTracking();
        this.initMagneticCards();
        this.initMagneticButtons();
    }

    /**
     * Avatar Eye Tracking
     * Eyes follow cursor with realistic constraints
     */
    initAvatarEyeTracking() {
        const avatarContainer = document.getElementById('anam-avatar-container');
        if (!avatarContainer) return;

        this.elements.avatar = avatarContainer;

        // Create eye overlay elements
        const eyeOverlay = document.createElement('div');
        eyeOverlay.className = 'avatar-eye-overlay';
        eyeOverlay.innerHTML = `
            <div class="avatar-eye left-eye">
                <div class="eye-pupil"></div>
            </div>
            <div class="avatar-eye right-eye">
                <div class="eye-pupil"></div>
            </div>
        `;
        avatarContainer.appendChild(eyeOverlay);

        // Animate eyes to follow cursor
        const animateEyes = () => {
            const rect = avatarContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate angle and distance from avatar center to cursor
            const deltaX = this.mouse.x - centerX;
            const deltaY = this.mouse.y - centerY;
            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 200);

            // Constrain eye movement (max 15px from center)
            const maxMove = 15;
            const moveX = Math.cos(angle) * Math.min(distance / 20, maxMove);
            const moveY = Math.sin(angle) * Math.min(distance / 20, maxMove);

            // Apply to both eyes
            const pupils = eyeOverlay.querySelectorAll('.eye-pupil');
            pupils.forEach(pupil => {
                pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            requestAnimationFrame(animateEyes);
        };

        animateEyes();
    }

    /**
     * Magnetic Cards with 3D Tilt
     * Cards tilt toward cursor and get attracted when close
     */
    initMagneticCards() {
        const cards = document.querySelectorAll('.service-card');
        this.elements.cards = Array.from(cards);

        cards.forEach(card => {
            // Add magnetic hover effect
            card.addEventListener('mouseenter', () => {
                card.classList.add('magnetic-active');
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('magnetic-active');
                card.style.transform = '';
            });

            // 3D tilt effect on mousemove
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate relative position (-1 to 1)
                const relX = (e.clientX - centerX) / (rect.width / 2);
                const relY = (e.clientY - centerY) / (rect.height / 2);
                
                // Calculate distance from center (0 to 1)
                const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
                
                // Dead zone in center (40% radius) - no effect when hovering center
                const deadZone = 0.4;
                if (distanceFromCenter < deadZone) {
                    card.style.transform = 'perspective(1000px) scale(1.01)';
                    return;
                }
                
                // Scale effect based on distance from dead zone
                const effectStrength = Math.min((distanceFromCenter - deadZone) / (1 - deadZone), 1);

                // Apply 3D rotation (max ±25 degrees - increased for stronger effect) with reduced strength
                const rotateX = -relY * 25 * effectStrength;
                const rotateY = relX * 25 * effectStrength;

                // Magnetic attraction (stronger pull toward cursor) with reduced strength
                const pullX = relX * 15 * effectStrength;
                const pullY = relY * 15 * effectStrength;

                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateX(${pullX}px)
                    translateY(${pullY}px)
                    scale(${1.02 + 0.08 * effectStrength})
                `;
            });
        });

        // Proximity-based glow effect
        const updateProximityEffects = () => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate distance from cursor to card center
                const deltaX = this.mouse.x - centerX;
                const deltaY = this.mouse.y - centerY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // Proximity threshold (200px)
                const proximityThreshold = 200;
                if (distance < proximityThreshold) {
                    const intensity = 1 - (distance / proximityThreshold);
                    const glowSize = 20 + intensity * 20;
                    card.style.boxShadow = `
                        0 12px 40px rgba(0, 164, 228, ${0.3 + intensity * 0.4}),
                        0 0 ${glowSize}px rgba(0, 164, 228, ${intensity * 0.6})
                    `;
                } else if (!card.matches(':hover')) {
                    card.style.boxShadow = '';
                }
            });

            requestAnimationFrame(updateProximityEffects);
        };

        updateProximityEffects();
    }

    /**
     * Magnetic Buttons
     * Buttons get attracted to cursor when nearby
     */
    initMagneticButtons() {
        const buttons = document.querySelectorAll('button:not(.dark-mode-toggle):not(.language-toggle), .btn:not(.dark-mode-toggle):not(.language-toggle)');
        this.elements.buttons = Array.from(buttons);

        buttons.forEach(button => {
            const originalPosition = { x: 0, y: 0 };

            // Track original position
            const updateOriginalPosition = () => {
                const rect = button.getBoundingClientRect();
                originalPosition.x = rect.left + rect.width / 2;
                originalPosition.y = rect.top + rect.height / 2;
            };

            updateOriginalPosition();
            window.addEventListener('resize', updateOriginalPosition);

            // Magnetic attraction effect
            const updateMagneticEffect = () => {
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Calculate distance from cursor
                const deltaX = this.mouse.x - centerX;
                const deltaY = this.mouse.y - centerY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // Attraction threshold (100px)
                const attractionRadius = 100;
                
                // Dead zone when hovering directly over button center (within 40px) - increased to reduce shake
                const deadZoneRadius = 40;
                
                if (distance < deadZoneRadius) {
                    // In dead zone - no movement, only subtle scale
                    button.style.transform = 'scale(1.01)';
                    button.style.filter = '';
                } else if (distance < attractionRadius && distance > 0) {
                    // Calculate attraction force (stronger when closer)
                    const force = 1 - (distance / attractionRadius);
                    const pullStrength = 12; // Max pixels to move

                    // Move button toward cursor
                    const pullX = (deltaX / distance) * force * pullStrength;
                    const pullY = (deltaY / distance) * force * pullStrength;

                    button.style.transform = `translate(${pullX}px, ${pullY}px) scale(${1 + force * 0.1})`;
                    button.style.filter = `brightness(${1 + force * 0.2})`;
                } else {
                    button.style.transform = '';
                    button.style.filter = '';
                }

                requestAnimationFrame(updateMagneticEffect);
            };

            updateMagneticEffect();
        });
    }

    /**
     * Add cursor trail effect (optional enhancement)
     */
    addCursorTrail() {
        const trail = [];
        const trailLength = 20;

        document.addEventListener('mousemove', (e) => {
            trail.push({ x: e.clientX, y: e.clientY, alpha: 1 });
            if (trail.length > trailLength) {
                trail.shift();
            }
        });

        const canvas = document.createElement('canvas');
        canvas.id = 'cursor-trail';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const drawTrail = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            trail.forEach((point, index) => {
                const size = ((index + 1) / trail.length) * 8;
                const alpha = (index + 1) / trail.length;

                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 164, 228, ${alpha * 0.5})`;
                ctx.fill();
            });

            requestAnimationFrame(drawTrail);
        };

        drawTrail();

        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cursorReactive = new CursorReactiveUI();
        // Uncomment to add cursor trail:
        // window.cursorReactive.addCursorTrail();
    });
} else {
    window.cursorReactive = new CursorReactiveUI();
    // Uncomment to add cursor trail:
    // window.cursorReactive.addCursorTrail();
}
