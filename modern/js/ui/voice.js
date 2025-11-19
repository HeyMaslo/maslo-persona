// Voice interaction using Web Speech API
export class VoiceInteraction {
    constructor(onTranscript, onSpeechStart, onSpeechEnd) {
        this.onTranscript = onTranscript;
        this.onSpeechStart = onSpeechStart;
        this.onSpeechEnd = onSpeechEnd;

        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;

        this.initRecognition();
    }

    initRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            if (this.onSpeechStart) {
                this.onSpeechStart();
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Recognized:', transcript);

            if (this.onTranscript) {
                this.onTranscript(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.isListening = false;

            if (this.onSpeechEnd) {
                this.onSpeechEnd();
            }
        };
    }

    isSupported() {
        return this.recognition !== null;
    }

    startListening() {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return false;
        }

        if (this.isListening) {
            this.stopListening();
            return false;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not available');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.lang = options.lang || 'en-US';

        // Use a more natural voice if available
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.lang === 'en-US' && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang === 'en-US');

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            if (options.onStart) options.onStart();
        };

        utterance.onend = () => {
            if (options.onEnd) options.onEnd();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            if (options.onError) options.onError(event);
        };

        this.synthesis.speak(utterance);
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
}
