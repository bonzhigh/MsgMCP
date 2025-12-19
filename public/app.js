// Telegram MCP Server Web Interface
class TelegramMCPInterface {
    constructor() {
        this.init();
        this.loadStatus();
        this.loadConfiguration();
        this.setupEventListeners();
    }

    init() {
        this.configForm = document.getElementById('configForm');
        this.testForm = document.getElementById('testForm');
        this.configMessage = document.getElementById('configMessage');
        this.testMessage = document.getElementById('testMessage');
        this.statusBar = document.getElementById('statusBar');
    }

    setupEventListeners() {
        // Configuration form
        this.configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfiguration();
        });

        // Test form
        this.testForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendTestMessage();
        });

        // Periodic status updates
        setInterval(() => this.loadStatus(), 5000);
    }

    async loadStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();

            this.updateStatusDisplay(status);
        } catch (error) {
            console.error('Failed to load status:', error);
            this.updateStatusDisplay({ server: 'error', bot: 'error', config: { hasToken: false, hasDefaultUser: false } });
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();

            // Pre-populate form fields if configuration exists
            if (config.telegramBotTokenConfigured) {
                // Don't show the actual token, but indicate it's configured
                document.getElementById('botToken').placeholder = 'Bot token is configured (enter new token to update)';
            }

            if (config.telegramDefaultUser) {
                document.getElementById('defaultUser').value = config.telegramDefaultUser;
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    updateStatusDisplay(status) {
        const serverStatus = document.getElementById('serverStatus');
        const botStatus = document.getElementById('botStatus');
        const tokenStatus = document.getElementById('tokenStatus');
        const defaultUserStatus = document.getElementById('defaultUserStatus');

        // Server status
        serverStatus.textContent = status.server === 'running' ? 'Running' : 'Error';
        serverStatus.className = status.server === 'running' ? 'status-value status-good' : 'status-value status-error';

        // Bot status - show polling status if available
        let botStatusText = status.bot === 'initialized' ? 'Initialized' : 'Not Initialized';
        if (status.pollingActive === 'yes') {
            botStatusText += ' (Polling Active)';
        }
        botStatus.textContent = botStatusText;
        botStatus.className = status.bot === 'initialized' ? 'status-value status-good' : 'status-value status-error';

        // Token status
        tokenStatus.textContent = status.config.hasToken ? 'Configured' : 'Not Set';
        tokenStatus.className = status.config.hasToken ? 'status-value status-good' : 'status-value status-warn';

        // Default user status
        defaultUserStatus.textContent = status.config.hasDefaultUser ? 'Set' : 'Not Set';
        defaultUserStatus.className = status.config.hasDefaultUser ? 'status-value status-good' : 'status-value status-warn';
    }

    async saveConfiguration() {
        const botToken = document.getElementById('botToken').value.trim();
        const defaultUser = document.getElementById('defaultUser').value.trim();

        const configData = {};

        if (botToken) {
            configData.telegramBotToken = botToken;
        }

        if (defaultUser) {
            configData.telegramDefaultUser = defaultUser;
        }

        if (Object.keys(configData).length === 0) {
            this.showMessage('configMessage', 'Please enter at least one configuration value.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData),
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('configMessage', 'Configuration saved successfully!', 'success');
                // Clear the token field (for security), keep default user if it was saved
                document.getElementById('botToken').value = '';
                // Reload configuration to show updated values
                this.loadConfiguration();
                // Reload status
                this.loadStatus();
            } else {
                this.showMessage('configMessage', result.message || 'Failed to save configuration.', 'error');
            }
        } catch (error) {
            console.error('Failed to save configuration:', error);
            this.showMessage('configMessage', 'Failed to save configuration. Please try again.', 'error');
        }
    }

    async sendTestMessage() {
        const message = document.getElementById('testMessage').value.trim();

        if (!message) {
            this.showMessage('testMessage', 'Please enter a message to send.', 'error');
            return;
        }

        const testData = { message };

        // Disable form during sending
        const submitButton = this.testForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('testMessage', result.message || 'Message sent successfully!', 'success');
                // Clear the form
                document.getElementById('testMessage').value = '';
            } else {
                this.showMessage('testMessage', result.message || 'Failed to send message.', 'error');
            }
        } catch (error) {
            console.error('Failed to send test message:', error);
            this.showMessage('testMessage', 'Failed to send message. Please check your configuration.', 'error');
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
}

// Toggle chat ID help section
function toggleChatIdHelp() {
    const helpContent = document.getElementById('chatIdHelp');
    const button = event.target;
    
    if (helpContent.style.display === 'none') {
        helpContent.style.display = 'block';
        button.textContent = 'Hide Help';
    } else {
        helpContent.style.display = 'none';
        button.textContent = 'How to get Chat ID?';
    }
}

// Initialize the interface when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TelegramMCPInterface();
});
