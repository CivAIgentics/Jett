/**
 * 3D Particle Constellation Background
 * Creates floating geometric shapes that react to mouse movement
 * and connect with lines when close to each other
 */

class ParticleConstellation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.connectionDistance = 120;
        this.particleCount = 80;
        this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        
        this.init();
    }
    
    init() {
        // Style the canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1'; // Bring forward (was 0)
        this.canvas.style.opacity = '0.7'; // More visible (was 0.6)
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 1000,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                vz: (Math.random() - 0.5) * 2,
                radius: Math.random() * 2 + 1,
                color: this.getParticleColor(),
                shape: Math.random() > 0.5 ? 'circle' : 'square'
            });
        }
    }
    
    getParticleColor() {
        const colors = [
            'rgba(102, 126, 234, 0.8)',  // Purple
            'rgba(118, 75, 162, 0.8)',   // Violet
            'rgba(0, 164, 228, 0.8)',    // Blue
            'rgba(0, 242, 254, 0.8)',    // Cyan
            'rgba(240, 147, 251, 0.8)'   // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        });
        
        // Only track mouse on desktop (not mobile)
        if (!this.isMobile) {
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });
            
            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
    }
    
    drawParticle(particle) {
        // Calculate 3D perspective
        const scale = 1000 / (1000 + particle.z);
        const x = particle.x;
        const y = particle.y;
        const radius = particle.radius * scale;
        
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        
        if (particle.shape === 'circle') {
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        } else {
            const size = radius * 2;
            this.ctx.rect(x - size/2, y - size/2, size, size);
        }
        
        this.ctx.fill();
        
        // Add glow effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
        gradient.addColorStop(0, particle.color.replace('0.8', '0.3'));
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    connectParticles(particle, index) {
        for (let i = index + 1; i < this.particles.length; i++) {
            const other = this.particles[i];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.connectionDistance) {
                const opacity = 1 - (distance / this.connectionDistance);
                this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.3})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(other.x, other.y);
                this.ctx.stroke();
            }
        }
    }
    
    updateParticle(particle) {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Mouse interaction - attract particles (desktop only)
        if (!this.isMobile && this.mouse.x !== null && this.mouse.y !== null) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                particle.vx += Math.cos(angle) * force * 0.2;
                particle.vy += Math.sin(angle) * force * 0.2;
            }
        }
        
        // Apply friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.vz *= 0.98;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > this.canvas.width) {
            particle.vx *= -1;
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > this.canvas.height) {
            particle.vy *= -1;
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
        }
        
        // Loop Z position
        if (particle.z > 1000) {
            particle.z = 0;
        } else if (particle.z < 0) {
            particle.z = 1000;
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            this.updateParticle(particle);
            this.connectParticles(particle, index);
            this.drawParticle(particle);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ParticleConstellation();
    });
} else {
    new ParticleConstellation();
}
