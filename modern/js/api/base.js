// Base API class for AI providers
export class BaseAPI {
    constructor(config = {}) {
        this.config = config;
        this.conversationHistory = [];
        this.systemPrompt = `You are Maslo, an expressive and empathetic AI companion.
You communicate with warmth and personality. Keep responses concise and natural.
When appropriate, you can express emotions through your visual form.

For each response, analyze the emotional content and provide:
1. Your text response
2. An emotion indicator (joy, love, surprise, terror, anger, sadness, sleepy, calm)
3. An intensity value (0-1)

Format your response as JSON:
{
    "text": "your response here",
    "emotion": "joy",
    "intensity": 0.8
}`;
    }

    async sendMessage(message) {
        throw new Error('sendMessage must be implemented by subclass');
    }

    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });

        // Keep only last 10 messages to avoid token limits
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    parseEmotionalResponse(response) {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(response);
            return {
                text: parsed.text || response,
                emotion: parsed.emotion || 'calm',
                intensity: parsed.intensity || 0.5
            };
        } catch (e) {
            // Fallback: simple sentiment analysis
            return {
                text: response,
                ...this.detectEmotion(response)
            };
        }
    }

    detectEmotion(text) {
        const lower = text.toLowerCase();

        // Simple keyword-based emotion detection
        const emotions = {
            joy: ['happy', 'great', 'wonderful', 'amazing', 'excited', '!', '😊', '😄'],
            love: ['love', 'adore', 'care', '❤️', '💕'],
            surprise: ['wow', 'oh', 'really', '!?', '😮', '😲'],
            terror: ['scared', 'afraid', 'terrified', 'horror'],
            anger: ['angry', 'mad', 'furious', 'annoyed'],
            sadness: ['sad', 'sorry', 'unfortunately', 'disappointed'],
            sleepy: ['tired', 'sleepy', 'exhausted'],
            calm: ['calm', 'peaceful', 'relaxed', 'okay']
        };

        let maxScore = 0;
        let detectedEmotion = 'calm';

        Object.keys(emotions).forEach(emotion => {
            let score = 0;
            emotions[emotion].forEach(keyword => {
                if (lower.includes(keyword)) {
                    score++;
                }
            });

            if (score > maxScore) {
                maxScore = score;
                detectedEmotion = emotion;
            }
        });

        return {
            emotion: detectedEmotion,
            intensity: Math.min(maxScore * 0.3, 1.0)
        };
    }
}
