// Main Maslo Persona Engine
import { PersonaRing, getRingConfig, createRingModifiers } from './ring.js';
import { States, createStateAnimations } from './states.js';
import { Moods, getMoodModifiers, getRingMoodModifiers } from './moods.js';

export class MasloPersona {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.config = {
            numRings: 8,
            ringResolution: 256,
            radius: 300,
            baseHue: 30,
            audioEnabled: true,
            audioPath: './assets/audio/',
            ...config
        };

        // State
        this.currentState = States.IDLE;
        this.currentAnimation = null;
        this.mood = {
            joy: 0,
            love: 0,
            surprise: 0,
            terror: 0,
            anger: 0,
            sadness: 0,
            sleepy: 0,
            calm: 1,
        };

        // Time tracking
        this.time = 0;
        this.modifierTime = 0;

        // Initialize
        this.setupRenderer();
        this.setupScene();
        this.loadTexture();
        this.createRings();
        this.setupAudio();

        // Create state animations
        this.stateAnimations = createStateAnimations(this);

        // Ring modifiers
        this.ringModifiers = createRingModifiers();

        // Start animation loop
        this.isRunning = false;
        this.animate = this.animate.bind(this);

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setClearColor(0x000000, 0);
    }

    setupScene() {
        this.scene = new THREE.Scene();

        // Orthographic camera for 2D rendering
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = this.config.radius * 3;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );
        this.camera.position.z = 100;

        // Global container
        this.container = new THREE.Object3D();
        this.scene.add(this.container);
    }

    loadTexture() {
        const loader = new THREE.TextureLoader();
        loader.load('./assets/img/noise.png', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            this.noiseTexture = texture;

            // Apply texture to all rings
            this.rings.forEach(ring => ring.setTexture(texture));
        });
    }

    createRings() {
        this.rings = [];

        for (let i = 0; i < this.config.numRings; i++) {
            const ringConfig = getRingConfig(i, this.config.numRings, this.config.baseHue);
            const ring = new PersonaRing(i, this.config.numRings, {
                ...this.config,
                ...ringConfig
            });

            // Set initial color
            ring.data.hsl.x = ringConfig.hue / 360;
            ring.data.hsl.y = ringConfig.saturation;
            ring.data.hsl.z = ringConfig.lightness;
            ring.data.originalColor = { ...ring.data.hsl };

            // Scale ring by radius
            const scale = this.config.radius * (1 - i * 0.05);
            ring.rotationGroup.scale.setScalar(scale);

            this.container.add(ring.rotationGroup);
            this.rings.push(ring);
        }
    }

    setupAudio() {
        this.audioContext = null;
        this.audioBuffers = {};
        this.currentAudio = null;

        if (this.config.audioEnabled && (window.AudioContext || window.webkitAudioContext)) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playAudio(trackName) {
        if (!this.config.audioEnabled || !this.audioContext) return;

        // Stop current audio
        if (this.currentAudio) {
            this.currentAudio.stop();
        }

        // Load and play audio
        const audioPath = this.config.audioPath + trackName;

        if (this.audioBuffers[trackName]) {
            this.playAudioBuffer(this.audioBuffers[trackName]);
        } else {
            fetch(audioPath)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    this.audioBuffers[trackName] = audioBuffer;
                    this.playAudioBuffer(audioBuffer);
                })
                .catch(err => console.warn('Audio playback failed:', err));
        }
    }

    playAudioBuffer(buffer) {
        if (!this.audioContext) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        this.currentAudio = source;
    }

    setState(state) {
        if (this.currentState === state) return;

        // Stop current animation
        if (this.currentAnimation) {
            this.currentAnimation.kill();
        }

        this.currentState = state;

        // Run state animation
        const animation = this.stateAnimations[state];
        if (animation) {
            this.currentAnimation = animation();
        }
    }

    setMood(moodName, intensity) {
        if (this.mood.hasOwnProperty(moodName)) {
            this.mood[moodName] = Math.max(0, Math.min(1, intensity));
        }
    }

    setMoods(moodMap) {
        Object.keys(moodMap).forEach(mood => {
            this.setMood(mood, moodMap[mood]);
        });
    }

    setColor(hue) {
        this.config.baseHue = hue;

        this.rings.forEach((ring, i) => {
            const isGrayscale = i < 2;
            if (!isGrayscale) {
                ring.data.hsl.x = hue / 360;
                ring.data.originalColor.x = hue / 360;
            }
        });
    }

    update(deltaTime) {
        // Update time
        const moodMod = getMoodModifiers(this.mood);
        const timeInc = moodMod.timeInc || 0;
        const modifierTimestep = moodMod.modifierTimestep || 0.002;

        this.time += deltaTime * (1 + timeInc);
        this.modifierTime += deltaTime * modifierTimestep;

        // Update each ring
        this.rings.forEach((ring, i) => {
            const ringMoodMod = getRingMoodModifiers(this.ringModifiers[i], this.mood);

            // Apply breathing/idle animation
            if (this.currentState === States.IDLE || this.currentState === States.LISTEN) {
                const breathScale = 1 + Math.sin(this.time * 0.001 + i * 0.2) * 0.02;
                ring.data.scale.x = breathScale;
                ring.data.scale.y = breathScale;

                // Gentle rotation
                ring.data.theta = Math.sin(this.modifierTime + i) * 0.05 + i * 0.01;
            }

            ring.update(this.config.radius, ringMoodMod);
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        this.renderer.setSize(width, height);

        // Update camera
        const frustumSize = this.config.radius * 3;
        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;
        this.camera.updateProjectionMatrix();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.animate();
            this.setState(States.INIT);
        }
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.animate);
    }

    dispose() {
        this.stop();
        this.rings.forEach(ring => ring.dispose());
        this.renderer.dispose();

        if (this.currentAudio) {
            this.currentAudio.stop();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        window.removeEventListener('resize', this.handleResize);
    }
}
