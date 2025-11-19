# Maslo Persona 2025 🌟

A modern, modular, pure HTML/JS implementation of the Maslo Persona - an expressive, empathetic AI companion with beautiful visual animations and emotional intelligence.

## ✨ Features

### 🎨 Visual Expression
- **8 Concentric Animated Rings** - Procedurally generated with Three.js
- **12 Emotional States** - init, idle, joy, surprise, upset, yes, no, hey, shake, tap, listen, question
- **8 Mood Types** - joy, love, surprise, terror, anger, sadness, sleepy, calm
- **Dynamic Colors** - Customizable HSL-based color scheme
- **Smooth Animations** - GSAP-powered transitions
- **Mobile Responsive** - Optimized for all screen sizes

### 🤖 AI Integration
Easy integration with multiple AI providers:
- **Anthropic Claude** - Claude 3.5 Sonnet, Haiku, Opus
- **OpenAI** - GPT-4, GPT-3.5 Turbo
- **Ollama** - Local models (Llama 2, Mistral, etc.)

### 🎤 Voice Interaction
- **Speech Recognition** - Using Web Speech API
- **Text-to-Speech** - Natural voice responses
- **Real-time Transcription** - Instant voice-to-text

### 💬 Chat Interface
- **Text Chat** - Type messages directly
- **Conversation History** - Maintains context
- **Emotional Responses** - Visual and auditory feedback

## 🚀 Quick Start

### 1. Setup

No build tools required! Just serve the files with any static server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

### 2. Open in Browser

Navigate to `http://localhost:8000` and you'll see Maslo come to life!

### 3. Configure AI (Optional)

Click the settings icon (⚙️) and configure your preferred AI provider:

#### For Anthropic Claude:
1. Get API key from [console.anthropic.com](https://console.anthropic.com/)
2. Select "Anthropic Claude" as provider
3. Paste your API key
4. Choose model (recommended: Claude 3.5 Sonnet)

#### For OpenAI:
1. Get API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Select "OpenAI" as provider
3. Paste your API key
4. Choose model (recommended: GPT-4 Turbo)

#### For Ollama (Local):
1. Install [Ollama](https://ollama.ai/) locally
2. Run `ollama pull llama2` (or your preferred model)
3. Select "Ollama (Local)" as provider
4. Ensure server URL is `http://localhost:11434`

### 4. Enable Features

In settings, you can enable:
- **Voice Interaction** - Speak with Maslo
- **Chat Interface** - Text-based conversation
- **Custom Colors** - Adjust the persona's hue

## 📁 Project Structure

```
modern/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Responsive styles
├── js/
│   ├── app.js             # Main application
│   ├── core/
│   │   ├── persona.js     # Core persona engine
│   │   ├── ring.js        # Ring visualization
│   │   ├── states.js      # Emotional states
│   │   └── moods.js       # Mood system
│   ├── api/
│   │   ├── base.js        # Base API class
│   │   ├── anthropic.js   # Anthropic integration
│   │   ├── openai.js      # OpenAI integration
│   │   └── ollama.js      # Ollama integration
│   └── ui/
│       ├── settings.js    # Settings UI
│       └── voice.js       # Voice interaction
└── assets/
    ├── audio/             # Sound effects
    ├── img/              # Textures
    └── shaders/          # GLSL shaders
```

## 🎮 Usage

### Interacting with Maslo

**Click/Tap the Persona:**
- Triggers friendly reactions (hey, tap, yes)

**Voice Interaction:**
1. Enable voice in settings
2. Click the microphone button
3. Speak your message
4. Maslo will respond with voice and animation

**Text Chat:**
1. Enable chat in settings
2. Type in the input box
3. Send message
4. Watch Maslo's emotional response

### Programmatic Control

You can also control Maslo programmatically:

```javascript
// Access the app instance
const app = window.masloApp;

// Change persona state
app.persona.setState('joy');

// Set mood
app.persona.setMood('happy', 0.8);

// Change color
app.persona.setColor(180); // 0-360 hue

// Send a message
app.handleUserMessage('Hello Maslo!');
```

## 🎨 Customization

### Changing Colors

In settings, adjust the "Persona Color (Hue)" slider:
- 0° = Red
- 30° = Orange (default)
- 120° = Green
- 240° = Blue
- 300° = Purple

### Custom Emotional States

Edit `js/core/states.js` to create new animations:

```javascript
[States.CUSTOM]() {
    const timeline = createTimeline();

    persona.rings.forEach((ring, i) => {
        timeline.to(ring.data.scale, {
            x: 1.2,
            y: 1.2,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
        });
    });

    return timeline;
}
```

### Custom Moods

Edit `js/core/moods.js` to add new mood types and behaviors.

## 🔒 Privacy & Security

- **API Keys**: Stored in `sessionStorage` (cleared on browser close)
- **Settings**: Saved in `localStorage` (API keys excluded)
- **No Tracking**: No analytics or telemetry
- **Local First**: Works completely offline in visual-only mode

## 🌐 Browser Compatibility

**Recommended:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Features by Browser:**
- Voice Recognition: Chrome, Edge, Safari
- Speech Synthesis: All modern browsers
- WebGL: All modern browsers
- ES Modules: All modern browsers

## 📱 Mobile Support

Fully responsive and touch-optimized:
- Adaptive canvas sizing
- Touch-friendly controls
- Mobile-optimized UI
- Reduced motion support

## 🛠️ Technical Details

### Core Technologies
- **Three.js** (r128) - WebGL rendering
- **GSAP** (3.12.5) - Animation engine
- **ES Modules** - Native browser modules
- **Web Speech API** - Voice interaction
- **CSS Grid/Flexbox** - Responsive layout

### No Build Tools Required
- Pure HTML/JS/CSS
- No webpack, babel, or npm needed
- Direct ES module imports
- Works with any static server

### Performance
- 60 FPS animations
- Optimized ring geometry
- Efficient shader rendering
- Minimal memory footprint

## 🎓 Learning Resources

### Understanding the Persona
- Rings represent emotional depth
- Inner rings (0-1): Core/grayscale
- Outer rings (2-7): Colored/emotional
- Animations reflect mood states

### API Integration
Each API class extends `BaseAPI` with:
- `sendMessage(text)` - Send user message
- `parseEmotionalResponse()` - Extract emotion
- `addToHistory()` - Maintain context

### Creating Custom Integrations
```javascript
import { BaseAPI } from './api/base.js';

class CustomAPI extends BaseAPI {
    async sendMessage(message) {
        // Your implementation
        const response = await yourAPICall(message);
        return this.parseEmotionalResponse(response);
    }
}
```

## 🐛 Troubleshooting

**Persona doesn't appear:**
- Check browser console for errors
- Ensure WebGL is enabled
- Try a different browser

**Voice doesn't work:**
- Only works in Chrome/Edge/Safari
- Requires HTTPS (or localhost)
- Check microphone permissions

**API errors:**
- Verify API key is correct
- Check network connection
- Ensure API provider is accessible

**Ollama connection fails:**
- Make sure Ollama is running (`ollama serve`)
- Check server URL is correct
- Verify model is downloaded

## 📄 License

MIT License - See original project for details

## 🙏 Credits

Based on the original [Maslo Persona](https://github.com/HeyMaslo/maslo-persona) by HeyMaslo.

Modernized for 2025 with:
- Pure HTML/JS architecture
- Multiple AI provider support
- Enhanced mobile experience
- Modern Web APIs

## 🤝 Contributing

This is a modernization of the Maslo Persona. Feel free to:
- Add new AI providers
- Create custom emotional states
- Improve animations
- Enhance mobile experience

## 📞 Support

For issues with:
- Original persona concept: See [original repo](https://github.com/HeyMaslo/maslo-persona)
- Modern implementation: Check browser console and troubleshooting section

---

**Enjoy your new AI companion! 🌟**
