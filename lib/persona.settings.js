import * as THREE from 'three';
import * as SimplexNoise from 'simplex-noise';

export const DefaultSettings = {
    ringCount: 8,
    ringRes: 256,
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    scale: new THREE.Vector3(1, 1, 1),
    hsl: new THREE.Vector3(198, 1, 0.6),
    timeInc: 0.005,
    radius: 300,
    simplex: new SimplexNoise(Math.random),
    glow: false,
};

/** @typedef {typeof DefaultSettings} MasloPersonaSettings */
