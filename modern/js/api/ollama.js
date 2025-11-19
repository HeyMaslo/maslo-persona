// Ollama API integration (local models)
import { BaseAPI } from './base.js';

export class OllamaAPI extends BaseAPI {
    constructor(config = {}) {
        super(config);
        this.serverUrl = config.serverUrl || 'http://localhost:11434';
        this.model = config.model || 'llama2';
        this.apiUrl = `${this.serverUrl}/api/chat`;
    }

    async sendMessage(message) {
        this.addToHistory('user', message);

        try {
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...this.conversationHistory
            ];

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage = data.message.content;

            this.addToHistory('assistant', assistantMessage);

            return this.parseEmotionalResponse(assistantMessage);
        } catch (error) {
            console.error('Ollama API error:', error);
            // Provide helpful error message if Ollama isn't running
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to Ollama. Make sure Ollama is running locally.');
            }
            throw error;
        }
    }

    setServerUrl(url) {
        this.serverUrl = url;
        this.apiUrl = `${url}/api/chat`;
    }

    setModel(model) {
        this.model = model;
    }

    // Check if Ollama is available
    async checkAvailability() {
        try {
            const response = await fetch(`${this.serverUrl}/api/tags`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Get list of available models
    async getAvailableModels() {
        try {
            const response = await fetch(`${this.serverUrl}/api/tags`);
            if (!response.ok) return [];

            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Error fetching Ollama models:', error);
            return [];
        }
    }
}
