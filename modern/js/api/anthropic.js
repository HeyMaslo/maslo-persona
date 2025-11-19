// Anthropic Claude API integration
import { BaseAPI } from './base.js';

export class AnthropicAPI extends BaseAPI {
    constructor(config = {}) {
        super(config);
        this.apiKey = config.apiKey;
        this.model = config.model || 'claude-3-5-sonnet-20241022';
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    async sendMessage(message) {
        if (!this.apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        this.addToHistory('user', message);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 1024,
                    system: this.systemPrompt,
                    messages: this.conversationHistory
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage = data.content[0].text;

            this.addToHistory('assistant', assistantMessage);

            return this.parseEmotionalResponse(assistantMessage);
        } catch (error) {
            console.error('Anthropic API error:', error);
            throw error;
        }
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    setModel(model) {
        this.model = model;
    }
}
