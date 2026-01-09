// DeedIQ AI Chatbot
class DeedIQChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        // Create chatbot HTML
        this.createChatbotHTML();

        // Bind events
        this.bindEvents();

        // Add welcome message
        this.addMessage('ai', 'Hi! I\'m DeedIQ AI, your real estate investment assistant. I can help you analyze market data, compare properties, and understand investment metrics. What would you like to know?');
    }

    createChatbotHTML() {
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-button" id="chatbotToggle" aria-label="Open AI Assistant">
                🤖
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <div class="chatbot-header-icon">🤖</div>
                        <div class="chatbot-header-text">
                            <h3>DeedIQ AI</h3>
                            <p>Real Estate Assistant</p>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbotClose" aria-label="Close">×</button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages"></div>
                <div class="chatbot-input-container">
                    <form class="chatbot-input-form" id="chatbotForm">
                        <textarea
                            class="chatbot-input"
                            id="chatbotInput"
                            placeholder="Ask me anything about real estate..."
                            rows="1"
                        ></textarea>
                        <button type="submit" class="chatbot-send-button" id="chatbotSend" aria-label="Send">
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Store references
        this.elements = {
            toggle: document.getElementById('chatbotToggle'),
            close: document.getElementById('chatbotClose'),
            window: document.getElementById('chatbotWindow'),
            messages: document.getElementById('chatbotMessages'),
            form: document.getElementById('chatbotForm'),
            input: document.getElementById('chatbotInput'),
            send: document.getElementById('chatbotSend')
        };
    }

    bindEvents() {
        // Toggle chatbot
        this.elements.toggle.addEventListener('click', () => this.toggle());
        this.elements.close.addEventListener('click', () => this.close());

        // Form submission
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Auto-resize textarea
        this.elements.input.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
        });

        // Enter to send, Shift+Enter for new line
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.elements.window.classList.add('open');
        this.elements.toggle.classList.add('active');
        this.elements.input.focus();
    }

    close() {
        this.isOpen = false;
        this.elements.window.classList.remove('open');
        this.elements.toggle.classList.remove('active');
    }

    addMessage(type, content) {
        const message = {
            type,
            content,
            timestamp: new Date()
        };
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${message.type}`;

        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${message.type}`;
        avatar.textContent = message.type === 'ai' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = this.formatMessage(message.content);

        if (message.type === 'ai') {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
        } else {
            messageDiv.appendChild(content);
            messageDiv.appendChild(avatar);
        }

        this.elements.messages.appendChild(messageDiv);
    }

    formatMessage(text) {
        // Convert markdown-style formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chatbot-message ai';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar ai">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.elements.messages.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 100);
    }

    async sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;

        // Clear input
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';

        // Disable send button
        this.elements.send.disabled = true;

        // Add user message
        this.addMessage('user', message);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get context (current market data if available)
            const context = this.getPageContext();

            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    message,
                    context
                })
            });

            const data = await response.json();

            // Hide typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                this.addMessage('ai', data.response);
            } else {
                this.addMessage('ai', 'Sorry, I encountered an error. Please try again or contact support if the issue persists.');
                console.error('Chat error:', data.error);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ai', 'Sorry, I\'m having trouble connecting right now. Please check your internet connection and try again.');
            console.error('Chat request failed:', error);
        } finally {
            // Re-enable send button
            this.elements.send.disabled = false;
            this.elements.input.focus();
        }
    }

    getPageContext() {
        const context = {
            page: window.location.pathname,
            url: window.location.href
        };

        // Try to get market data if on main page
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            // Check if there's selected market data
            const cityName = document.getElementById('cityName')?.textContent;
            if (cityName && cityName !== 'City Name') {
                context.currentMarket = {
                    city: cityName,
                    // Add any other visible market data
                };
            }

            // Check for comparison markets
            const comparisonSection = document.getElementById('compareSection');
            if (comparisonSection && comparisonSection.style.display !== 'none') {
                context.comparingMarkets = true;
            }
        }

        // Check for calculator context
        if (window.location.search.includes('tool=calculator')) {
            context.usingCalculator = true;
        }

        return context;
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.deediqChatbot = new DeedIQChatbot();
    });
} else {
    window.deediqChatbot = new DeedIQChatbot();
}
