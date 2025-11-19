// OpenAI API integration
import { BaseAPI } from './base.js';

export class OpenAIAPI extends BaseAPI {
    constructor(config = {}) {
        super(config);
        this.apiKey = config.apiKey;
        this.model = config.model || 'gpt-4-turbo-preview';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async sendMessage(message) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        this.addToHistory('user', message);

        try {
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...this.conversationHistory
            ];

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: 1024,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            this.addToHistory('assistant', assistantMessage);

            return this.parseEmotionalResponse(assistantMessage);
        } catch (error) {
            console.error('OpenAI API error:', error);
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
