import * as THREE from 'three';

/** @typedef {(import ('chroma-js').Color)} ChromaColor */

/** @typedef {(import ('./persona.settings').PersonaConfig)} PersonaConfig */

export class PersonaRingData {

    /** @type {THREE.Vector3} */
    originalColor;
    /** @type {THREE.Vector3} */
    hsl;

    /** @type {ChromaColor} */
    color;

    seed = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);

    osc = 0.05;
    intensity = 1;
    frequency = 0.2;
    gaussIt = 0;
    weightIn = 0;
    shadowSpread = 0.01;
    shadowColor = 0;
    shadowIntensity = 0.15;
    theta = Math.random();
    gaussAmplitude = 0.3;
    opacity = 0;
    scaleInc = new THREE.Vector3(0, 0, 0);
    scale = new THREE.Vector3(1, 1, 1);
    position = new THREE.Vector3(0, 0, 0);
    easingFactor = 0;

    /** @param {number} id */
    /** @param {PersonaConfig} settings */
    constructor(id, settings) {
        this.id = id;
        this.settings = settings;
    }
}
