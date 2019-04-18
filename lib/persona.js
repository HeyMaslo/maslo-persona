import { observable, observe } from 'mobx';
import * as THREE from 'three';
import * as Chroma from 'chroma-js';
import logger from './utils/logger';

import { AudioPlayer } from './audio';
import { PersonaRing } from './ring';
import { DefaultInternalSettings, DefaultSettings } from './persona.settings';
import { createStates } from './persona.states';
import { getRingMoodModifiers, getMoodModifiers } from './persona.mood';

import { AnalyticsManager } from './analytics';

/** @typedef {(import ('./persona.settings').PersonaSettings)} PersonaSettings */
/** @typedef {(import ('./persona.settings').PersonaConfig)} PersonaConfig */

/** @typedef {(persona: PersonaCore) => void} PersonaStateRunner */

/** @typedef {(import ('./persona.states').StateTypes)} States */
/** @typedef {(import ('./persona.states').ContinualStatesType)} ContinualStates */
/** @typedef {(import ('./persona.states').PersonaListeningState)} PersonaListeningState */
/** @typedef {(import ('./persona.states').StateRunnerArgs)} StateRunnerArgs */

/** @typedef {(import ('./persona.mood').MoodTypes)} MoodTypes */
/** @typedef {(import ('./persona.mood').MoodModifiersMap)} MoodModifiersMap */
/** @typedef {(import ('./persona.mood').MoodIntensitysMap)} MoodIntensitysMap */

const Colors = [
  '#C3C3C3',
  '#DADADA',
  '#FDFDFD',
  '#9E9EFF',
  '#A9A9FF',
  '#B9B9FF',
  '#DCDCFF',
  '#DCFFFF',
];

export class PersonaCore {

  /**
   * @private
   * @type {States}
   * */
  @observable
  _state;

  /** @type {MoodIntensitysMap} */
  @observable
  _mood = {};

  /** @type {Partial<PersonaListeningState>} */
  @observable
  _listening = {};

  /**
   * @param {THREE.Scene} scene
   * @param {Partial<PersonaSettings>} settings=
  */
  constructor(scene, settings = null) {
    /** @type {PersonaConfig} */
    this._settings = Object.assign({}, DefaultSettings, settings, DefaultInternalSettings);

    this.audio = new AudioPlayer();

    this._data = {
      time: 0,
      timeInc: 0.005,

      position: new THREE.Vector3(0, 0, 0),
      rotation: 0,
      scale: new THREE.Vector3(1, 1, 1),
      hsl: new THREE.Vector3(198, 1, 0.6),

      rotationSpeed: 0,

      modifierTime: 0,
      modifierTimestep: 0,

      /** @type {import ('gsap').TimelineMax} */
      currentTimeline: null,

      simplex: this._settings.simplex,
    };

    this._globalContainer = new THREE.Object3D();
    this._group = new THREE.Object3D();
    this._globalContainer.add(this._group);
    this._group.scale.set(this._settings.radius, this._settings.radius, 1);

    scene.add(this._globalContainer);

    this._states = createStates(this);

    /** @type {PersonaRing[]} */
    this.rings = [];
    for (let i = 0; i < this._settings.ringCount; i++) {
      const ring = new PersonaRing(i, this._settings);
      this._group.add(ring.theGroup);

      this.rings.push(ring);

      // get color
      {
        const colorIndex = (i + 1) % Colors.length;
        const color = Chroma(Colors[colorIndex]).hsl();
        const originalColor = new THREE.Vector3(color[0] || 0, color[1], color[2]);

        ring.data.originalColor = originalColor;
        ring.data.hsl = originalColor;
      }
    }

    this._computeColors();

    this._moodDirty = false;
    this._disposeUpdateMoodReaction = observe(this._mood, (change) => {
      if (change.type === 'update' || change.type === 'add') {
        logger.log('Mood', change.name, change.type, change.oldValue, '=>', change.newValue);
        this.analytics.trackMoodChange(change.name, change.newValue || 0);
      }
      this._moodDirty = true;
    });
  }

  /** Returns current Persona state. Observable via `mobx's autorun`. */
  get state() { return this._state; }
  get mood() { return this._mood; }

  get rotation() { return this._data.rotation; }
  set rotation(value) { this._data.rotation = value; }

  get position() { return this._data.position; }
  set position(value) { this._data.position = value; }

  get scale() { return this._data.scale; }
  set scale(value) { this._data.scale = value; }

  get analytics() {
    if (!this._analytics) {
      this._analytics = new AnalyticsManager();
    }
    return this._analytics;
  }

  dispose() {
    this._disposeUpdateMoodReaction();
  }

  /** @param {AnalyticsManager} analytics */
  setAnalytics(analytics) {
    this._analytics = analytics;
  }

  step() {

    const { radius } = this._settings;
    const {
      scale, rotation, timeInc, modifierTimestep,
    } = this._data;

    // update roatation
    this._group.rotation.z = rotation * Math.PI * 2;
    // update scale
    this._group.scale.set(
      radius * scale.x,
      radius * scale.y,
      1,
    );

    // update time
    this._data.time += timeInc;
    this._data.modifierTime += modifierTimestep;

    this._computeColors();

    // this._updateStates(time);

    if (this._moodDirty) {
      // logger.log('Updating mood:', mobxToJS(this._mood));
      this._updateMood();
      this._moodDirty = false;
    }

    // update rings
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];
      const prevRing = (i > 0 && this.rings[i - 1]) || null;
      ring.step(this._data.time, prevRing);
    }
  }


  /** @param {States} state */
  setState(state) {
    // do not allow to use the reset of `_setState`'s parameters
    this._setState(state);
  }

  /**
   * @param {States} state
   * @param {StateRunnerArgs} stateArgs
   * */
  _setState(state, force = false, stateArgs = null) {
    if (!force && this._state === state) {
      return;
    }

    // find next state runner
    const nextState = this._states[state];
    if (!nextState) {
      return;
    }

    // stop current state
    const tl = this._data.currentTimeline;
    this._data.currentTimeline = null;
    if (tl) {
      tl.progress(1).kill();
    }

    // call next state runner

    const prevState = this._state;
    this._state = state;
    logger.log('setState', (force && 'FORCE') || '', prevState, '->', state);

    this.analytics.trackStateChange(state);

    try {
      this._data.currentTimeline = nextState(stateArgs);
    } catch (err) {
      logger.error('Persona: state change error', err);
    }
  }

  /** @param {ContinualStates} state */
  beginState(state) {
    this.endState();

    const continualPromise = new Promise((resolve) => {
      this._continualResolve = resolve;
    });

    /** @type {StateRunnerArgs} */
    const continualArgs = {
      finishPromise: continualPromise,
      used: false,
    };

    this._setState(state, false, continualArgs);

    if (!continualArgs.used) {
      logger.error(`Tried to begin state "${state}", but its runner doesn't support it.`);
      this.endState();
    }
  }

  endState() {
    if (this._continualResolve) {
      this._continualResolve();
      this._continualResolve = null;
    }
  }

  /**
   * @param {boolean} active
   */
  activateRenderingDebug(active) {
    this.rings.forEach((ring) => {
      ring.activateDebbugRendering(active);
    });
  }

  _computeColors() {
    const { ringCount, glow } = this._settings;
    const { hsl } = this._data;

    this.colorHSL = Chroma.hsl(hsl.x, hsl.y, hsl.z);
    this.rings[0].data.color = Chroma.hsl(0, 0, hsl.z * 2);
    this.rings[1].data.color = this.rings[0].data.color.darken(0.5);
    this.rings[2].data.color = this.rings[1].data.color.darken(0.3);
    for (let i = 3; i < ringCount; i++) {
      this.rings[i].data.color = this.colorHSL.darken(i - 3.5);
    }

    if (glow) {
      for (let i = 0; i < Colors.length; i++) {
        this.rings[i].data.color = Chroma(Colors[i]);
      }
      this.rings[0].data.shadowColor = 1;
      this.rings[0].data.shadowSpread = 0.1;
      this.rings[0].data.shadowIntensity = 0.3;
    }
  }

  _updateMood() {
    const { modifierTime, simplex } = this._data;

    for (let i = 0; i < this.rings.length; i++) {
      const ringPos = i / this.rings.length;
      const n = simplex.noise2D(i / 8 * 10, modifierTime);
      const n2 = simplex.noise2D(modifierTime, i / 8 * 10);

      const ringModifiers = {
        joy: {
          gaussIt: -0.98,
          weightIn: -0.9,
          theta: ringPos,
          intensity: 2,
          osc: 0.04,
        },
        love: {
          gaussIt: -0.98,
          weightIn: -0.9,
          theta: ringPos,
          intensity: 1,
          osc: 0.04,
          scaleInc: 0,
          positionX: 0.2 + 0.01 * i * Math.sin(Math.PI * 2 * modifierTime),
          positionY: 0.2 + 0.01 * i * Math.cos(Math.PI * 2 * modifierTime),
        },
        surprise: {
          gaussIt: -0.98,
          weightIn: -0.3,
          intensity: 2,
          theta: ringPos,
          osc: 0.03,
          scaleInc: 0.15 * (1 - ringPos),
        },
        terror: {
          gaussIt: -0.98,
          weightIn: -0.9,
          rotation: ringPos,
          intensity: 0.8,
          osc: 0.1,
          scaleInc: 0.1 * 0.5 * (1 - ringPos),
          positionX: n * 0.1,
          positionY: n2 * 0.1,
        },
        anger: {
          gaussIt: -0.98,
          weightIn: -0.9,
          intensity: 2,
          theta: ringPos,
          osc: 0.1,
          scaleInc: 0.25 * ringPos,
          positionX: n * 0.1 * 2 * (1 - ringPos),
          positionY: n2 * 0.1 * 2 * (1 - ringPos),
        },
        sadness: {
          gaussIt: -0.8,
          weightIn: -0.2,
          osc: 0.04,
        },
        sleepy: {
          theta: ringPos,
          scaleInc: 0.15 * (1 - ringPos) * Math.cos(Math.PI * 2 * modifierTime),
        },
        calm: {
          gaussIt: -0.6,
          weightIn: -0.5,
          scaleInc: 0.15 * ringPos * Math.cos(Math.PI * 2 * modifierTime),
        },
      };

      const ringMods = getRingMoodModifiers(ringModifiers, this._mood);
      const ringData = this.rings[i].data;

      ringData.gaussIt = 0.98 + ringMods.gaussIt;
      ringData.weightIn = 1 + ringMods.weightIn;
      ringData.intensity = 0.21 + ringMods.intensity;
      ringData.theta = i * 0.01 + ringMods.theta;
      ringData.osc = 0.06 + ringMods.osc;
      ringData.scaleInc = new THREE.Vector3(ringMods.scaleInc, ringMods.scaleInc, 0);
      ringData.position.x = ringMods.positionX;
      ringData.position.y = ringMods.positionY;
    }

    const moodModifiers = getMoodModifiers(this._mood);

    this._data.timeInc = 0.01 + (moodModifiers.timeInc || 0);
    this._data.modifierTimestep = moodModifiers.modifierTimestep || 0;
  }

}
