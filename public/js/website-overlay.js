/**
 * Multi-Tab Browser Overlay Manager
 * Allows opening multiple websites in tabs, covering the entire page
 */

class WebsiteBrowser {
    constructor() {
        this.browserOverlay = null;
        this.tabsContainer = null;
        this.contentContainer = null;
        this.tabs = []; // Array of tab objects: { id, url, title, iframe, container, tabElement, isLoading }
        this.activeTabId = null;
        this.nextTabId = 1;
        
        this.init();
    }

    init() {
        // Get DOM elements
        this.browserOverlay = document.getElementById('browser-overlay');
        this.tabsContainer = document.getElementById('browser-tabs');
        this.contentContainer = document.getElementById('browser-content');
        
        if (!this.browserOverlay || !this.tabsContainer || !this.contentContainer) {
            console.warn('⚠️ Browser overlay elements not found');
            return;
        }

        this.setupEventListeners();
        console.log('✅ Multi-tab browser initialized');
    }

    setupEventListeners() {
        // Close all button
        const closeAllBtn = document.getElementById('browser-close-all-btn');
        if (closeAllBtn) {
            closeAllBtn.addEventListener('click', () => this.closeAll());
        }

        // ESC key to close all tabs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.closeAll();
            }
        });

        // Listen for conversation state changes
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                setTimeout(() => this.updateBrowserMode(), 100);
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                setTimeout(() => this.updateBrowserMode(), 100);
            });
        }

        // Periodically check conversation state when browser is open
        setInterval(() => {
            if (this.isOpen()) {
                this.updateBrowserMode();
            }
        }, 1000);
    }

    /**
     * Open a new tab with the given URL
     * @param {string} url - The URL to open
     * @param {string} title - Optional title for the tab
     */
    openTab(url, title = null) {
        if (!url) {
            console.error('❌ Cannot open tab: no URL provided');
            return null;
        }

        // Check if URL is already open
        const existingTab = this.tabs.find(tab => tab.url === url);
        if (existingTab) {
            console.log('🔄 Tab already exists, switching to it:', url);
            this.switchTab(existingTab.id);
            return existingTab.id;
        }

        const tabId = this.nextTabId++;
        
        // Extract title from URL if not provided
        if (!title) {
            try {
                const urlObj = new URL(url);
                title = urlObj.hostname.replace('www.', '');
            } catch (e) {
                title = 'New Tab';
            }
        }

        console.log('🌐 Opening new tab:', tabId, url, title);

        // Don't automatically open background tab - let user decide with button
        // This avoids focus-stealing issues and gives user control
        
        // Create tab element
        const tabElement = this.createTabElement(tabId, title, url);
        this.tabsContainer.appendChild(tabElement);

        // Create iframe container
        const iframeContainer = this.createIframeContainer(tabId, url, title);
        this.contentContainer.appendChild(iframeContainer);

        // Store tab data
        const tab = {
            id: tabId,
            url,
            title,
            tabElement,
            iframeContainer,
            iframe: iframeContainer.querySelector('.browser-iframe'),
            isLoading: true
        };

        this.tabs.push(tab);

        // Show browser if it was hidden
        if (!this.isOpen()) {
            this.browserOverlay.classList.remove('hidden');
            this.updateBrowserMode();
        }

        // Switch to the new tab
        this.switchTab(tabId);

        // Announce to screen readers
        this.announceToScreenReader(`Opening ${title} in new tab`);

        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        return tabId;
    }

    /**
     * Create tab element
     */
    createTabElement(tabId, title, url) {
        const tab = document.createElement('button');
        tab.className = 'browser-tab loading';
        tab.setAttribute('data-tab-id', tabId);
        tab.setAttribute('title', title);

        tab.innerHTML = `
            <div class="browser-tab-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
            </div>
            <span class="browser-tab-title">${this.escapeHtml(title)}</span>
            <button class="browser-tab-close" title="Close tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Tab click handler
        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.browser-tab-close')) {
                this.switchTab(tabId);
            }
        });

        // Close button handler
        const closeBtn = tab.querySelector('.browser-tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });

        return tab;
    }

    /**
     * Create iframe container with toolbar
     */
    createIframeContainer(tabId, url, title) {
        const container = document.createElement('div');
        container.className = 'browser-iframe-container';
        container.setAttribute('data-tab-id', tabId);

        // Check if this URL should be proxied
        // Proxy all city-related sites including water subdomain
        const shouldProxy = (
            url.includes('midlandtexas.gov') ||
            url.includes('flymaf.com') ||
            url.includes('civicplus.com')
        );
        let iframeUrl = url;
        
        if (shouldProxy) {
            // Use proxy endpoint to bypass CSP restrictions
            iframeUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
            console.log('🔄 Using proxy for URL:', url);
        } else {
            console.log('🌐 Loading directly (no proxy):', url);
        }

        container.innerHTML = `
            <div class="browser-iframe-toolbar">
                <div class="browser-iframe-url" title="${this.escapeHtml(url)}">${this.escapeHtml(url)}</div>
                <button class="browser-open-full-tab" title="For full functionality, open in new tab" data-url="${this.escapeHtml(url)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>Open in Tab</span>
                </button>
            </div>
            <div class="browser-iframe-loading">
                <div class="spinner"></div>
                <p>Loading ${this.escapeHtml(title)}...</p>
            </div>
            <div class="browser-iframe-error" style="display: none;">
                <div class="error-icon">🚫</div>
                <h3>Unable to Load in Frame</h3>
                <p class="error-message">This website cannot be displayed inside Jacky due to security restrictions.</p>
                <p class="error-details" style="font-size: 0.85em; color: #888; margin-top: 8px;"></p>
            </div>
            <iframe 
                class="browser-iframe" 
                src="${this.escapeHtml(iframeUrl)}" 
                title="${this.escapeHtml(title)}"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation-by-user-activation"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
        `;

        // Add click handler for "Open in Tab" button
        const openTabBtn = container.querySelector('.browser-open-full-tab');
        if (openTabBtn) {
            openTabBtn.addEventListener('click', () => {
                window.open(url, '_blank', 'noopener,noreferrer');
                console.log('🔗 User opened in full tab:', url);
            });
        } else {
            console.error('❌ Open Tab button not found in toolbar');
        }

        // Iframe load and error events
        const iframe = container.querySelector('.browser-iframe');
        const loadingIndicator = container.querySelector('.browser-iframe-loading');
        const errorScreen = container.querySelector('.browser-iframe-error');
        
        // Detect CSP/iframe blocking errors
        let loadTimeout;
        let hasLoaded = false;

        iframe.addEventListener('load', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);
            
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.isLoading = false;
                tab.tabElement.classList.remove('loading');
            }
            
            // Check if this was a proxied midlandtexas.gov URL
            const isProxied = iframe.src.includes('/api/proxy?url=');
            
            // Try to access iframe content to detect CSP violations
            try {
                // This will throw an error if CSP blocks the iframe
                iframe.contentWindow.location.href;
                
                // If we get here, loading succeeded
                console.log('✅ Iframe loaded successfully:', url);
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 500);
            } catch (e) {
                // CORS/CSP restriction - keep in overlay, don't auto-open externally
                console.log('ℹ️ CORS/CSP restriction (expected for most sites):', url);
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 500);
            }
        });

        iframe.addEventListener('error', () => {
            console.error('❌ Failed to load iframe:', url);
            // Keep in overlay - show error screen instead of auto-opening
            hasLoaded = true;
            clearTimeout(loadTimeout);
            loadingIndicator.style.display = 'none';
            errorScreen.style.display = 'flex';
        });

        // Set a timeout to detect if iframe never loads (CSP block)
        // Longer timeout for proxied midlandtexas.gov pages
        const isProxiedMidland = iframeUrl.includes('/api/proxy?url=');
        const timeoutDuration = isProxiedMidland ? 8000 : 3000; // 8s for proxied sites, 3s for others
        
        loadTimeout = setTimeout(() => {
            if (!hasLoaded) {
                console.warn(`⏱️ Iframe load timeout (${timeoutDuration}ms):`, url);
                // Keep in overlay - hide loading and let iframe continue trying
                loadingIndicator.style.display = 'none';
            }
        }, timeoutDuration);

        return container;
    }

    /**
     * Switch to a specific tab
     */
    switchTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        console.log('🔄 Switching to tab:', tabId);

        // Update active states
        this.tabs.forEach(t => {
            t.tabElement.classList.remove('active');
            t.iframeContainer.classList.remove('active');
        });

        tab.tabElement.classList.add('active');
        tab.iframeContainer.classList.add('active');
        this.activeTabId = tabId;

        // Scroll tab into view
        tab.tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        // Announce to screen readers
        this.announceToScreenReader(`Switched to ${tab.title}`);
    }

    /**
     * Close a specific tab
     */
    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tab = this.tabs[tabIndex];
        console.log('❌ Closing tab:', tabId, tab.title);

        // Remove DOM elements
        tab.tabElement.remove();
        tab.iframeContainer.remove();

        // Remove from array
        this.tabs.splice(tabIndex, 1);

        // If this was the active tab, switch to another
        if (this.activeTabId === tabId && this.tabs.length > 0) {
            const newActiveIndex = Math.max(0, tabIndex - 1);
            this.switchTab(this.tabs[newActiveIndex].id);
        }

        // If no tabs left, close the browser
        if (this.tabs.length === 0) {
            this.closeAll();
        }

        // Announce to screen readers
        this.announceToScreenReader(`Closed ${tab.title}`);

        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    }

    /**
     * Close all tabs and hide browser
     */
    closeAll() {
        console.log('❌ Closing all tabs');

        // Remove all tabs
        this.tabs.forEach(tab => {
            tab.tabElement.remove();
            tab.iframeContainer.remove();
        });

        this.tabs = [];
        this.activeTabId = null;

        // Hide browser overlay
        this.browserOverlay.classList.add('hidden');
        this.browserOverlay.classList.remove('compact-mode');

        // Announce to screen readers
        this.announceToScreenReader('Browser closed');
    }

    /**
     * Update browser mode based on conversation state
     */
    updateBrowserMode() {
        // Always use compact mode for testing
        this.browserOverlay.classList.add('compact-mode');
        console.log('📱 Browser in compact mode (testing mode - always compact)');
    }

    /**
     * Open URL in a popup window sized to the compact area
     * @param {string} url - The URL to open
     * @param {string} title - Window title
     */
    openCompactWindow(url, title = 'Service') {
        // Fixed dimensions for water account portal
        const width = 1098;
        const height = 681;
        
        // Get header height to position below it (matching compact overlay)
        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 70;
        
        // Calculate position to match compact area (35% from left, below header)
        const totalWidth = window.innerWidth;
        const left = window.screenX + Math.floor(totalWidth * 0.35);
        const top = window.screenY + headerHeight;
        
        const features = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'menubar=no',
            'toolbar=no',
            'location=yes',
            'status=no',
            'resizable=yes',
            'scrollbars=yes'
        ].join(',');
        
        const popup = window.open(url, title, features);
        
        if (popup) {
            console.log('🪟 Opened compact window (1098x681):', url);
            popup.focus();
        } else {
            console.warn('⚠️ Popup blocked, opening in new tab instead');
            window.open(url, '_blank', 'noopener,noreferrer');
        }
        
        return popup;
    }

    /**
     * Check if conversation is currently active
     */
    isConversationActive() {
        // Check if stop button is visible (indicates conversation is active)
        const stopBtn = document.getElementById('stop-btn');
        return stopBtn && !stopBtn.classList.contains('hidden');
    }

    /**
     * Open current tab URL in external browser
     */
    openExternal(tabId) {
        // Disabled: No external tabs allowed
        console.log('⚠️ External tab opening is disabled');
        return;
    }

    /**
     * Check if browser is currently open
     */
    isOpen() {
        return this.browserOverlay && !this.browserOverlay.classList.contains('hidden');
    }

    /**
     * Get number of open tabs
     */
    getTabCount() {
        return this.tabs.length;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Create global instance
let websiteBrowser;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        websiteBrowser = new WebsiteBrowser();
        window.websiteBrowser = websiteBrowser; // Make globally accessible
        
        // Keep old name for backwards compatibility
        window.websiteOverlay = {
            open: (url, title) => websiteBrowser.openTab(url, title),
            isOpen: () => websiteBrowser.isOpen(),
            openCompactWindow: (url, title) => websiteBrowser.openCompactWindow(url, title)
        };
    });
} else {
    websiteBrowser = new WebsiteBrowser();
    window.websiteBrowser = websiteBrowser;
    
    // Keep old name for backwards compatibility
    window.websiteOverlay = {
        open: (url, title) => websiteBrowser.openTab(url, title),
        isOpen: () => websiteBrowser.isOpen(),
        openCompactWindow: (url, title) => websiteBrowser.openCompactWindow(url, title)
    };
}
