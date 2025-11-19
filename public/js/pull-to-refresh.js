/**
 * Pull-to-Refresh for Mobile
 * Allows users to refresh the page by swiping down
 */

class PullToRefresh {
    constructor() {
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.threshold = 120; // Distance to trigger refresh (increased from 80 for less sensitivity)
        this.indicator = null;
        this.maxPull = 150; // Increased max pull distance
        
        // Only enable on mobile/touch devices
        if ('ontouchstart' in window) {
            this.init();
        }
    }

    init() {
        this.createIndicator();
        this.setupEventListeners();
    }

    createIndicator() {
        // Create pull-to-refresh indicator
        this.indicator = document.createElement('div');
        this.indicator.className = 'pull-to-refresh-indicator';
        this.indicator.innerHTML = `
            <div class="refresh-spinner">
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <circle cx="15" cy="15" r="12" fill="none" stroke="currentColor" stroke-width="3" 
                            stroke-dasharray="75" stroke-dashoffset="75" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="refresh-text">Pull to refresh</div>
        `;
        
        this.indicator.style.cssText = `
            position: fixed;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background: var(--glass-bg, rgba(255, 255, 255, 0.9));
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 15px 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            transition: top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            color: var(--text-primary, #333);
            font-size: 14px;
            font-weight: 500;
        `;

        document.body.appendChild(this.indicator);
    }

    setupEventListeners() {
        const container = document.getElementById('app-container') || document.body;
        let canPull = false;

        // Check if we're at the top of the page
        const checkScrollPosition = () => {
            canPull = window.scrollY === 0 || document.documentElement.scrollTop === 0;
        };

        window.addEventListener('scroll', checkScrollPosition);
        checkScrollPosition();

        // Touch start
        container.addEventListener('touchstart', (e) => {
            if (canPull) {
                this.startY = e.touches[0].clientY;
                this.isDragging = true;
            }
        }, { passive: true });

        // Touch move
        container.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            this.currentY = e.touches[0].clientY;
            const pullDistance = Math.min(this.currentY - this.startY, this.maxPull);

            if (pullDistance > 0) {
                // Prevent default scroll behavior
                e.preventDefault();
                
                // Update indicator position
                const progress = Math.min(pullDistance / this.threshold, 1);
                this.indicator.style.top = `${pullDistance - 80}px`;

                // Rotate spinner based on pull distance
                const spinner = this.indicator.querySelector('.refresh-spinner svg circle');
                const rotation = progress * 360;
                spinner.style.transform = `rotate(${rotation}deg)`;
                spinner.style.transformOrigin = 'center';
                spinner.style.strokeDashoffset = 75 - (progress * 75);

                // Update text
                const text = this.indicator.querySelector('.refresh-text');
                if (pullDistance >= this.threshold) {
                    text.textContent = 'Release to refresh';
                    this.indicator.style.background = 'rgba(0, 164, 228, 0.9)';
                    this.indicator.style.color = 'white';
                } else {
                    text.textContent = 'Pull to refresh';
                    this.indicator.style.background = 'var(--glass-bg, rgba(255, 255, 255, 0.9))';
                    this.indicator.style.color = 'var(--text-primary, #333)';
                }
            }
        }, { passive: false });

        // Touch end
        container.addEventListener('touchend', () => {
            if (!this.isDragging) return;

            const pullDistance = this.currentY - this.startY;

            if (pullDistance >= this.threshold) {
                // Trigger refresh
                this.triggerRefresh();
            } else {
                // Reset indicator
                this.resetIndicator();
            }

            this.isDragging = false;
        }, { passive: true });
    }

    triggerRefresh() {
        // Show loading state
        const text = this.indicator.querySelector('.refresh-text');
        text.textContent = 'Refreshing...';
        this.indicator.style.top = '20px';
        this.indicator.style.background = 'rgba(0, 164, 228, 0.9)';
        this.indicator.style.color = 'white';

        // Add spinning animation
        const spinner = this.indicator.querySelector('.refresh-spinner svg');
        spinner.style.animation = 'spin 1s linear infinite';

        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Reload page after brief delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    resetIndicator() {
        this.indicator.style.top = '-100px';
        this.indicator.style.background = 'var(--glass-bg, rgba(255, 255, 255, 0.9))';
        this.indicator.style.color = 'var(--text-primary, #333)';
        
        const spinner = this.indicator.querySelector('.refresh-spinner svg circle');
        spinner.style.strokeDashoffset = '75';
    }
}

// Add spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .refresh-spinner svg {
        display: block;
        color: currentColor;
    }

    body.dark-mode .pull-to-refresh-indicator {
        background: rgba(45, 45, 45, 0.9) !important;
        color: #e0e0e0 !important;
    }

    body.dark-mode .pull-to-refresh-indicator[style*="rgb(0, 164, 228)"] {
        background: rgba(0, 164, 228, 0.9) !important;
        color: white !important;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pullToRefresh = new PullToRefresh();
    });
} else {
    window.pullToRefresh = new PullToRefresh();
}
