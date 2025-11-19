// Ring geometry and visualization for Maslo Persona
import { vertexShader, fragmentShader } from '../../assets/shaders/shaders.js';

export class PersonaRing {
    constructor(index, totalRings, config) {
        this.index = index;
        this.totalRings = totalRings;
        this.config = config;

        // Ring data (animated properties)
        this.data = {
            scale: { x: 0, y: 0 },
            position: { x: 0, y: 0 },
            theta: 0,
            gaussIt: 0,
            weightIn: 0,
            intensity: 0,
            osc: 0,
            scaleInc: 0,
            opacity: 0,
            hsl: { x: 0.5, y: 0.5, z: 0.5 },
            originalColor: { x: 0.5, y: 0.5, z: 0.5 },
            seed: {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random() * 2 - 1,
            },
        };

        // Create Three.js objects
        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }

    createGeometry() {
        const segments = this.config.ringResolution || 256;
        const innerRadius = 0.85;
        const outerRadius = 1.0;

        this.geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments, 1);

        // Add custom attributes for shader
        const count = this.geometry.attributes.position.count;
        const colors = new Float32Array(count * 4);
        const mats = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            colors[i * 4] = 1;
            colors[i * 4 + 1] = 1;
            colors[i * 4 + 2] = 1;
            colors[i * 4 + 3] = 1;
            mats[i] = 0;
        }

        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
        this.geometry.setAttribute('mat', new THREE.BufferAttribute(mats, 1));
    }

    createMaterial() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                tx: { value: null }, // Will be set by persona
                id: { value: this.index },
                opacity: { value: 1.0 },
            },
            transparent: true,
            side: THREE.DoubleSide,
        });
    }

    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Create container hierarchy for transformations
        this.translationGroup = new THREE.Object3D();
        this.rotationGroup = new THREE.Object3D();

        this.translationGroup.add(this.mesh);
        this.rotationGroup.add(this.translationGroup);
    }

    update(radius, moodModifiers = {}) {
        // Apply scale
        const scale = 1 + this.data.scaleInc + (moodModifiers.scaleInc || 0);
        this.rotationGroup.scale.set(
            this.data.scale.x * scale,
            this.data.scale.y * scale,
            1
        );

        // Apply position
        const posX = (this.data.position.x + (moodModifiers.positionX || 0)) * radius;
        const posY = (this.data.position.y + (moodModifiers.positionY || 0)) * radius;
        this.translationGroup.position.set(posX, posY, 0);

        // Apply rotation
        const theta = this.data.theta + (moodModifiers.theta || 0);
        this.rotationGroup.rotation.z = theta;

        // Apply opacity
        this.material.uniforms.opacity.value = this.data.opacity;

        // Update colors
        this.updateColors();
    }

    updateColors() {
        const colors = this.geometry.attributes.color.array;
        const positions = this.geometry.attributes.position.array;
        const count = this.geometry.attributes.position.count;

        const h = this.data.hsl.x;
        const s = this.data.hsl.y;
        const l = this.data.hsl.z;

        // Convert HSL to RGB
        const color = new THREE.Color();
        color.setHSL(h, s, l);

        for (let i = 0; i < count; i++) {
            // Darken based on ring index
            const darkening = 1 - (this.index / this.totalRings) * 0.3;

            colors[i * 4] = color.r * darkening;
            colors[i * 4 + 1] = color.g * darkening;
            colors[i * 4 + 2] = color.b * darkening;
            colors[i * 4 + 3] = 1;
        }

        this.geometry.attributes.color.needsUpdate = true;
    }

    setTexture(texture) {
        this.material.uniforms.tx.value = texture;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

// Ring configuration for each index
export function getRingConfig(index, totalRings, baseHue = 30) {
    const isGrayscale = index < 2;
    const ringRadius = 300; // Base radius

    return {
        index,
        totalRings,
        ringRadius: ringRadius * (1 - index * 0.02),
        isGrayscale,
        hue: isGrayscale ? 0 : baseHue,
        saturation: isGrayscale ? 0 : 0.7,
        lightness: 0.5,
    };
}

// Ring mood modifiers per ring
export function createRingModifiers() {
    const ringModifiers = [];

    for (let i = 0; i < 8; i++) {
        ringModifiers[i] = {
            joy: {
                scaleInc: 0.1 * (1 - i / 8),
                osc: 0.02,
            },
            love: {
                scaleInc: 0.05,
                osc: 0.03,
            },
            surprise: {
                scaleInc: 0.15 * (1 - i / 8),
            },
            terror: {
                scaleInc: -0.1,
                osc: 0.05,
            },
            anger: {
                scaleInc: 0.2,
                theta: 0.1,
            },
            sadness: {
                scaleInc: -0.05,
                osc: 0.01,
            },
            sleepy: {
                scaleInc: -0.02,
                osc: 0.005,
            },
            calm: {
                scaleInc: 0,
                osc: 0.01,
            },
        };
    }

    return ringModifiers;
}
