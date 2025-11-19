// Settings UI Controller
export class SettingsUI {
    constructor(onSettingsChange) {
        this.onSettingsChange = onSettingsChange;
        this.settings = this.loadSettings();

        this.initElements();
        this.bindEvents();
        this.applySettings();
    }

    initElements() {
        // Modal
        this.modal = document.getElementById('settings-modal');
        this.settingsBtn = document.getElementById('settings-btn');
        this.closeBtn = document.getElementById('close-settings');
        this.saveBtn = document.getElementById('save-settings');

        // AI Provider
        this.providerSelect = document.getElementById('ai-provider');
        this.anthropicSettings = document.getElementById('anthropic-settings');
        this.openaiSettings = document.getElementById('openai-settings');
        this.ollamaSettings = document.getElementById('ollama-settings');

        // Anthropic
        this.anthropicApiKey = document.getElementById('anthropic-api-key');
        this.anthropicModel = document.getElementById('anthropic-model');

        // OpenAI
        this.openaiApiKey = document.getElementById('openai-api-key');
        this.openaiModel = document.getElementById('openai-model');

        // Ollama
        this.ollamaUrl = document.getElementById('ollama-url');
        this.ollamaModel = document.getElementById('ollama-model');

        // Visual
        this.colorHue = document.getElementById('color-hue');
        this.hueValue = document.getElementById('hue-value');

        // Features
        this.enableVoice = document.getElementById('enable-voice');
        this.enableChat = document.getElementById('enable-chat');
    }

    bindEvents() {
        // Modal controls
        this.settingsBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.saveBtn.addEventListener('click', () => this.save());

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Provider selection
        this.providerSelect.addEventListener('change', () => {
            this.updateProviderVisibility();
        });

        // Color hue slider
        this.colorHue.addEventListener('input', (e) => {
            this.hueValue.textContent = `${e.target.value}°`;
        });
    }

    updateProviderVisibility() {
        const provider = this.providerSelect.value;

        this.anthropicSettings.classList.toggle('hidden', provider !== 'anthropic');
        this.openaiSettings.classList.toggle('hidden', provider !== 'openai');
        this.ollamaSettings.classList.toggle('hidden', provider !== 'ollama');
    }

    open() {
        this.modal.classList.remove('hidden');
        this.loadSettingsToUI();
    }

    close() {
        this.modal.classList.add('hidden');
    }

    save() {
        this.settings = {
            provider: this.providerSelect.value,
            anthropic: {
                apiKey: this.anthropicApiKey.value,
                model: this.anthropicModel.value
            },
            openai: {
                apiKey: this.openaiApiKey.value,
                model: this.openaiModel.value
            },
            ollama: {
                serverUrl: this.ollamaUrl.value,
                model: this.ollamaModel.value
            },
            visual: {
                colorHue: parseInt(this.colorHue.value)
            },
            features: {
                voice: this.enableVoice.checked,
                chat: this.enableChat.checked
            }
        };

        this.saveSettings();
        this.applySettings();
        this.close();

        if (this.onSettingsChange) {
            this.onSettingsChange(this.settings);
        }
    }

    loadSettingsToUI() {
        this.providerSelect.value = this.settings.provider;
        this.anthropicApiKey.value = this.settings.anthropic.apiKey;
        this.anthropicModel.value = this.settings.anthropic.model;
        this.openaiApiKey.value = this.settings.openai.apiKey;
        this.openaiModel.value = this.settings.openai.model;
        this.ollamaUrl.value = this.settings.ollama.serverUrl;
        this.ollamaModel.value = this.settings.ollama.model;
        this.colorHue.value = this.settings.visual.colorHue;
        this.hueValue.textContent = `${this.settings.visual.colorHue}°`;
        this.enableVoice.checked = this.settings.features.voice;
        this.enableChat.checked = this.settings.features.chat;

        this.updateProviderVisibility();
    }

    applySettings() {
        // Apply visual settings immediately
        document.documentElement.style.setProperty('--persona-hue', this.settings.visual.colorHue);
    }

    saveSettings() {
        // Save to localStorage (without sensitive data in production)
        const safeSettings = {
            ...this.settings,
            anthropic: { ...this.settings.anthropic, apiKey: '' },
            openai: { ...this.settings.openai, apiKey: '' }
        };
        localStorage.setItem('maslo-settings', JSON.stringify(safeSettings));

        // Store API keys in sessionStorage (cleared on browser close)
        if (this.settings.anthropic.apiKey) {
            sessionStorage.setItem('anthropic-key', this.settings.anthropic.apiKey);
        }
        if (this.settings.openai.apiKey) {
            sessionStorage.setItem('openai-key', this.settings.openai.apiKey);
        }
    }

    loadSettings() {
        const defaultSettings = {
            provider: 'none',
            anthropic: {
                apiKey: sessionStorage.getItem('anthropic-key') || '',
                model: 'claude-3-5-sonnet-20241022'
            },
            openai: {
                apiKey: sessionStorage.getItem('openai-key') || '',
                model: 'gpt-4-turbo-preview'
            },
            ollama: {
                serverUrl: 'http://localhost:11434',
                model: 'llama2'
            },
            visual: {
                colorHue: 30
            },
            features: {
                voice: false,
                chat: false
            }
        };

        try {
            const saved = localStorage.getItem('maslo-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with default settings and restore API keys from session
                return {
                    ...defaultSettings,
                    ...parsed,
                    anthropic: {
                        ...parsed.anthropic,
                        apiKey: sessionStorage.getItem('anthropic-key') || ''
                    },
                    openai: {
                        ...parsed.openai,
                        apiKey: sessionStorage.getItem('openai-key') || ''
                    }
                };
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }

        return defaultSettings;
    }

    getSettings() {
        return this.settings;
    }
}
