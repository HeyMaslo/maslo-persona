import * as THREE from 'three';
import { Color as ChromaColor } from 'chroma-js';
import { PersonaConfig } from './persona.settings';

export class PersonaRingData {

  originalColor: THREE.Vector3;
  hsl: THREE.Vector3;

  color: ChromaColor;

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

  constructor(readonly id: number, readonly settings: PersonaConfig) { }
}
