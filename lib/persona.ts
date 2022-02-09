import { observable, observe } from 'mobx';
import * as THREE from 'three';
import Chroma from 'chroma-js';
import SimplexNoise from 'simplex-noise';
import GSAP from 'gsap';

import { createLogger } from './utils/logger';

import { PersonaRing } from './ring';
import { DefaultInternalSettings, DefaultSettings, PersonaSettings, PersonaInternalSettings } from './persona.settings';
import { createStates, States, PersonaListeningState, StateRunners, StateRunnerArgs, ContinualStates, ContinualStatesTypes } from './persona.states';
import { getRingMoodModifiers, getMoodModifiers, MoodIntensityMap } from './persona.mood';
import { PersonaViewState } from './persona.view';

import { AnalyticsManager, LoggerAnalyticsManager } from './analytics';
import { IAudioPlayer, PersonCoreAnimationData, IPersonaCore, IPersonaRing } from './abstractions';
import { RandomStates } from './randomStates';

const logger = createLogger('[MasloPersona]');

export class PersonaCore implements IPersonaCore {

  private readonly _settings: PersonaSettings & PersonaInternalSettings;

  @observable
  private _state: States;

  @observable
  private _mood: MoodIntensityMap = {};

  // @observable
  // private _listening: Partial<PersonaListeningState> = {};

  private readonly _data = {
    time: 0,
    timeInc: 0.02,

    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    scale: new THREE.Vector3(1, 1, 1),
    hsl: new THREE.Vector3(198, 1, 0.6),

    rotationSpeed: 0,

    modifierTime: 0,
    modifierTimestep: 0,

    currentTimeline: null as TimelineMax,

    simplex: null as SimplexNoise,
  };

  private readonly _view: PersonaViewState = PersonaViewState.createEmptyViewState();

  private readonly _globalContainer = new THREE.Object3D();
  private readonly _group = new THREE.Object3D();

  private readonly _rings: PersonaRing[];
  private readonly _states: StateRunners;

  private _moodDirty = false;
  private _disposeUpdateMoodReaction: () => void;

  private _analytics: AnalyticsManager;
  private _continualResolve: () => void = null;

  private colorHSL: Chroma.Color;

  constructor(scene: THREE.Scene, settings: Partial<PersonaSettings> = null) {
    this._settings = {
      ...DefaultSettings,
      ...settings,
      ...DefaultInternalSettings,
    };

    if (settings.disableSound) {
      delete this._settings.audio;
    }

    const { skipTextures, ringsCount, radius } = this._settings;

    logger.log('Initilalizing with settings:', { ...this._settings, audio: '<...>', simplex: '<...>' });

    this._globalContainer.add(this._group);
    this._group.scale.set(radius, radius, 1);

    scene.add(this._globalContainer);

    this._states = createStates(this);

    this._rings = [];
    for (let i = 0; i < ringsCount; i++) {
      const skipT = skipTextures && (skipTextures === 'all'
        ? true
        : i !== this._settings.ringsCount - 1
      );
      const ring = new PersonaRing(i, this._settings, skipT);
      this._group.add(ring.theGroup);

      this._rings.push(ring);

      // get color
      {
        const colorIndex = i; // (i + 1) % this._settings.colors.length;
        const chromaColor = Chroma(this._settings.colors[colorIndex]);
        const color = chromaColor.hsl();
        const originalColor = new THREE.Vector3(color[0] || 0, color[1], color[2]);

        ring.data.color = chromaColor;
        ring.data.originalColor = originalColor;
        ring.data.hsl = originalColor;
      }
    }

    // this._computeColors();

    this._disposeUpdateMoodReaction = observe(this._mood, (change) => {
      if (change.type === 'update' || change.type === 'add') {
        // logger.log('Mood', change.name, change.type, change.oldValue, '=>', change.newValue);
        this.analytics.trackMoodChange(change.name && change.name.toString(), change.newValue || 0);
      }
      this._moodDirty = true;
    });

    if (settings.randonStates) {
      this._startRandonStates();
    }
  }

  public get settings(): Readonly<PersonaSettings> { return this._settings; }

  public get audio(): IAudioPlayer { return this._settings.audio; }
  public get animationData(): PersonCoreAnimationData { return this._data; }

  public get rings(): ReadonlyArray<IPersonaRing> { return this._rings; }
  public get currentView(): Readonly<PersonaViewState> { return this._view; }

  /** Returns current Persona state. Observable via `mobx's autorun`. */
  get state() { return this._state; }
  get mood() { return this._mood; }

  get rotation() { return this._data.rotation; }
  set rotation(value) { this._data.rotation = value; }

  get position() { return this._data.position; }
  set position(value) { 
    this._data.position = value; 
  }

  get scale() { return this._data.scale; }
  set scale(value) { this._data.scale = value; }

  get radius() { return this._settings.radius; }
  set radius(r: number) {
    this._settings.radius = r;
  }

  get randonStatesArray() {
    return RandomStates;
  }

  @observable
  private _randonStates = true;

  get randonStates() {
    return this._randonStates;
  }
  set randonStates(value) {
    this._randonStates = value;
  }

  get analytics() {
    if (!this._analytics) {
      this._analytics = new LoggerAnalyticsManager();
    }
    return this._analytics;
  }

  dispose() {
    this._disposeUpdateMoodReaction();
  }

  setAnalytics(analytics: AnalyticsManager) {
    this._analytics = analytics;
  }

  setViewState(view: PersonaViewState) {
    console.log("SVST ************************************************");

    const v = view || PersonaViewState.createEmptyViewState();
    const transition = v.transition || { };
    const ease = transition.ease || 'power4.inOut';
    const duration = transition.duration != null ? transition.duration : 1;
    const delay = transition.delay != null ? transition.delay : 0;

    GSAP.killTweensOf(this._view);
    GSAP.to(this._view, { rotation: v.rotation, duration, ease, delay });
    GSAP.to(this._view, { scale: Math.max(v.scale, 0.0001), duration, ease, delay });
    GSAP.to(this._view, { transparency: v.transparency || 0, duration, ease, delay });

    GSAP.killTweensOf(this._view.anchorPoint);
    const ap = v.anchorPoint || { x: 0, y: 0 };
    GSAP.to(this._view.anchorPoint, { x: ap.x, y: ap.y, duration, ease, delay });

    GSAP.killTweensOf(this._view.position);
    const pos = v.position || { x: 0, y: 0 };
    GSAP.to(this._view.position, { x: pos.x, y: pos.y, duration, ease, delay });    
  }

  step() {
    const { radius } = this._settings;
    const {
      scale, rotation, timeInc, modifierTimestep,
    } = this._data;

    const anchor = this._view.anchorPoint;

    // update position
    this._group.position.x = +this._view.position.x + anchor.x * radius;
    this._group.position.y = +this._view.position.y + anchor.y * radius;

    const twoPi = Math.PI * 2;
    const toRadians = (deg: number) => twoPi * deg / 360;

    // update roatation
    this._group.rotation.z = toRadians(this._view.rotation) + rotation * twoPi;

    // update scale
    this._group.scale.x = radius * scale.x * this._view.scale;
    this._group.scale.y = radius * scale.y * this._view.scale;

    // update time
    this._data.time += timeInc;
    this._data.modifierTime += modifierTimestep;

    // this._computeColors();

    if (this._moodDirty) {
      // logger.log('Updating mood:', mobxToJS(this._mood));
      this._updateMood();
      this._moodDirty = false;
    }

    const opacity = 1 - this._view.transparency || 0;

    // update rings
    for (let i = 0; i < this._rings.length; i++) {
      const ring = this._rings[i];
      ring.data.opacity = opacity;
      const prevRing = (i > 0 && this._rings[i - 1]) || null;
      ring.step(this._data.time, prevRing);
    }
  }

  setState(state: States, autoContinual = false) {
    if (autoContinual && ContinualStates.includes(state as ContinualStatesTypes)) {
      this.beginContinualState(state as ContinualStatesTypes);
    } else {
      this.endContinualState();
      this._setState(state);
    }
  }

  private _setState(state: States, force = false, stateArgs: StateRunnerArgs = null) {
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
      // FIX: if persona transitions from 'undfined' -> 'idle' – need to call manual setup
      if (!prevState && state === States.Idle) {
        this._data.currentTimeline = this._states.undefinedToIdle();
      } else {
        this._data.currentTimeline = nextState(stateArgs);
      }
    } catch (err) {
      logger.error('Persona: state change error', err);
    }
  }

  beginContinualState(state: ContinualStatesTypes) {
    if (this._state === state) {
      return;
    }

    this.endContinualState();

    logger.log('beginning continual state:', state);

    const continualPromise = new Promise((resolve: any) => {
      this._continualResolve = resolve;
    });

    const continualArgs: StateRunnerArgs = {
      finishPromise: continualPromise,
      used: false,
    };

    this._setState(state, false, continualArgs);

    if (!continualArgs.used) {
      logger.error(`Tried to begin state "${state}", but its runner doesn't support it.`);
      this.endContinualState();
    }
  }

  endContinualState() {
    if (this._continualResolve) {
      logger.log('ending continual state:', this._state);

      this._continualResolve();
      this._continualResolve = null;
    }
  }

  activateRenderingDebug(active: boolean) {
    this._rings.forEach((ring) => {
      ring.activateDebbugRendering(active);
    });
  }

  private _computeColors() {
    const { ringsCount, glow } = this._settings;
    const { hsl } = this._data;

    this.colorHSL = Chroma.hsl(hsl.x, hsl.y, hsl.z);
    this.rings[0].data.color = Chroma.hsl(0, 0, hsl.z * 2);
    this.rings[1].data.color = this.rings[0].data.color.darken(0.5);
    this.rings[2].data.color = this.rings[1].data.color.darken(0.3);
    for (let i = 3; i < ringsCount; i++) {
      this.rings[i].data.color = this.colorHSL.darken(i - 3.5);
    }

    if (glow) {
      for (let i = 0; i < this._settings.colors.length; i++) {
        this.rings[i].data.color = Chroma(this._settings.colors[i]);
      }
      this.rings[0].data.shadowColor = 1;
      this.rings[0].data.shadowSpread = 0.1;
      this.rings[0].data.shadowIntensity = 0.3;
    }
  }

  _generateRandonState(time: any) {
    const statesIndex = this.randonStatesArray.length - 1;
    console.log(`got ${this.randonStatesArray.length} states`);

    const random = Math.floor(Math.random() * (statesIndex - 0 + 1) + 0);
    const state = this.randonStatesArray[random];

    console.log(`got ${state} from random function ${time} seconds`);

    return state;
  }

  _startRandonStates() {
    if (this._randonStates) {
      console.log('starting randon States... ');

      setInterval(() => {
        setTimeout(() => {
          const state = this._generateRandonState(10);
          // @ts-ignore
          this.setState(state);
        }, 10000);
        setTimeout(() => {
          const state = this._generateRandonState(20);
          // @ts-ignore
          this.setState(state);
        }, 20000);
      }, 30000);
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
