// Main Maslo Persona Application
import { MasloPersona } from './core/persona.js';
import { States } from './core/states.js';
import { AnthropicAPI } from './api/anthropic.js';
import { OpenAIAPI } from './api/openai.js';
import { OllamaAPI } from './api/ollama.js';
import { SettingsUI } from './ui/settings.js';
import { VoiceInteraction } from './ui/voice.js';

class MasloApp {
    constructor() {
        this.persona = null;
        this.api = null;
        this.settings = null;
        this.voice = null;

        this.init();
    }

    async init() {
        // Initialize settings UI
        this.settingsUI = new SettingsUI((settings) => {
            this.onSettingsChanged(settings);
        });

        // Get initial settings
        this.settings = this.settingsUI.getSettings();

        // Initialize persona
        const canvas = document.getElementById('persona-canvas');
        this.persona = new MasloPersona(canvas, {
            radius: this.getOptimalRadius(),
            baseHue: this.settings.visual.colorHue,
            audioEnabled: true,
            audioPath: './assets/audio/'
        });

        // Initialize API
        this.updateAPI();

        // Initialize voice
        this.voice = new VoiceInteraction(
            (transcript) => this.onVoiceTranscript(transcript),
            () => this.onSpeechStart(),
            () => this.onSpeechEnd()
        );

        // Setup UI event handlers
        this.setupUIHandlers();

        // Apply feature settings
        this.applyFeatureSettings();

        // Start persona
        this.persona.start();

        this.updateStatus('Ready');
    }

    getOptimalRadius() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const minDimension = Math.min(width, height);

        // Scale radius based on screen size
        if (minDimension < 480) {
            return 150;
        } else if (minDimension < 768) {
            return 200;
        } else {
            return 300;
        }
    }

    setupUIHandlers() {
        // Microphone button
        const micBtn = document.getElementById('mic-btn');
        micBtn.addEventListener('click', () => {
            if (this.settings.features.voice && this.voice.isSupported()) {
                const started = this.voice.startListening();
                if (started) {
                    micBtn.classList.add('active');
                }
            } else {
                this.updateStatus('Voice interaction disabled. Enable in settings.');
            }
        });

        // Chat interface
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message) {
                this.handleUserMessage(message);
                chatInput.value = '';
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Canvas interaction (tap to trigger emotion)
        const canvas = document.getElementById('persona-canvas');
        canvas.addEventListener('click', () => {
            // Random friendly response
            const states = [States.HEY, States.TAP, States.YES];
            const randomState = states[Math.floor(Math.random() * states.length)];
            this.persona.setState(randomState);
        });
    }

    applyFeatureSettings() {
        const chatInterface = document.getElementById('chat-interface');
        chatInterface.classList.toggle('hidden', !this.settings.features.chat);
    }

    onSettingsChanged(settings) {
        this.settings = settings;

        // Update persona color
        this.persona.setColor(settings.visual.colorHue);

        // Update API
        this.updateAPI();

        // Apply feature settings
        this.applyFeatureSettings();

        this.updateStatus('Settings updated');
    }

    updateAPI() {
        const { provider } = this.settings;

        // Clear existing API
        if (this.api) {
            this.api.clearHistory();
        }

        // Create new API instance
        switch (provider) {
            case 'anthropic':
                this.api = new AnthropicAPI({
                    apiKey: this.settings.anthropic.apiKey,
                    model: this.settings.anthropic.model
                });
                break;

            case 'openai':
                this.api = new OpenAIAPI({
                    apiKey: this.settings.openai.apiKey,
                    model: this.settings.openai.model
                });
                break;

            case 'ollama':
                this.api = new OllamaAPI({
                    serverUrl: this.settings.ollama.serverUrl,
                    model: this.settings.ollama.model
                });
                break;

            default:
                this.api = null;
                break;
        }
    }

    async handleUserMessage(message) {
        this.updateStatus('Thinking...');
        this.addMessageToChat('user', message);

        if (!this.api) {
            const response = {
                text: "I'm running in visual-only mode. Configure an AI provider in settings to chat with me!",
                emotion: 'calm',
                intensity: 0.5
            };
            this.handleAssistantResponse(response);
            return;
        }

        try {
            const response = await this.api.sendMessage(message);
            this.handleAssistantResponse(response);
        } catch (error) {
            console.error('API error:', error);
            this.updateStatus(`Error: ${error.message}`);
            this.addMessageToChat('assistant', `Sorry, I encountered an error: ${error.message}`);
        }
    }

    handleAssistantResponse(response) {
        this.addMessageToChat('assistant', response.text);

        // Update persona mood and state
        this.persona.setMood(response.emotion, response.intensity);

        // Trigger appropriate state
        const stateMap = {
            joy: States.JOY,
            surprise: States.SURPRISE,
            anger: States.UPSET,
            sadness: States.UPSET,
            love: States.HEY,
            calm: States.IDLE,
            terror: States.SHAKE,
            sleepy: States.IDLE
        };

        const state = stateMap[response.emotion] || States.IDLE;
        this.persona.setState(state);

        // Speak response if voice enabled
        if (this.settings.features.voice) {
            this.voice.speak(response.text, {
                onStart: () => {
                    this.persona.setState(States.LISTEN);
                },
                onEnd: () => {
                    this.persona.setState(States.IDLE);
                }
            });
        }

        this.updateStatus('Ready');
    }

    onVoiceTranscript(transcript) {
        const micBtn = document.getElementById('mic-btn');
        micBtn.classList.remove('active');

        this.handleUserMessage(transcript);
    }

    onSpeechStart() {
        this.persona.setState(States.LISTEN);
        this.updateStatus('Listening...');
    }

    onSpeechEnd() {
        const micBtn = document.getElementById('mic-btn');
        micBtn.classList.remove('active');
    }

    addMessageToChat(role, text) {
        if (!this.settings.features.chat) return;

        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messageEl.textContent = text;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Limit chat history to 50 messages
        while (messagesContainer.children.length > 50) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }
    }

    updateStatus(text) {
        const statusText = document.getElementById('status-text');
        statusText.textContent = text;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.masloApp = new MasloApp();
    });
} else {
    window.masloApp = new MasloApp();
}
