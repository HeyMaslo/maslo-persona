import { observable, autorun } from 'mobx';
import * as THREE from 'three';
import * as Chroma from 'chroma-js';

import { AudioPlayer } from './audio';
import { PersonaRing } from './ring';
import { DefaultSettings } from './persona.settings';
import { createStates } from './persona.states';
import { getRingMoodModifiers, getMoodModifiers } from './persona.mood';

/** @typedef {(import ('./persona.settings').MasloPersonaSettings)} MasloPersonaSettings */

/** @typedef {(persona: MasloPersona) => void} PersonaStateRunner */

/** @typedef {(import ('./persona.states').StateTypes)} States */
/** @typedef {(import ('./persona.states').PersonaListeningState)} PersonaListeningState */

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

export class MasloPersona {

    /** @type {States} */
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
     * @param {Partial<MasloPersonaSettings>} settings=
     **/
    constructor(scene, settings = null) {
        /** @type {MasloPersonaSettings} */
        this._settings = Object.assign({}, DefaultSettings, settings);

        this.audio = new AudioPlayer();

        this._data = {
            time: 0,
            timeInc: this._settings.timeInc,

            rotation: this._settings.rotation || 0,
            rotationSpeed: 0,

            modifierTime: 0,
            modifierTimestep: 0,

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

        this._disposeUpdateMoodAutorun = autorun(() => this._updateMood());
    }

    get state() { return this._state; }
    get settings() { return this._settings; }
    get container() { return this._globalContainer; }
    get mood() { return this._mood; }

    dispose() {
        this._disposeUpdateMoodAutorun();
    }

    step(time) {
        // update roatation
        this._group.rotation.z = this._data.rotation * Math.PI * 2;
        // update scale
        this._group.scale.set(this._settings.radius * this._settings.scale.x, this._settings.radius * this._settings.scale.y, 1);

        // update time
        this._data.time += this._data.timeInc;
        this._data.modifierTime += this._data.modifierTimestep;

        this._computeColors();

        // this._updateStates(time);

        // update rings
        for (let i = 0; i < this.rings.length; i++) {
            const ring = this.rings[i];
            const prevRing = (i > 0 && this.rings[i - 1]) || null;
            ring.step(this._data.time, prevRing);
        }
    }

    // _updateStates(time) {
        // var n = this.simplex.noise2D( 0.5, time / 10000 );
        // this.rotationSpeed += n /1000000;
        // this.rotation += this.rotationSpeed;
    // };

    /** @param {States} state */
    setState(state, force = false, stateArgs = null) {
        if (!force && this._state === state) {
            return;
        }

        const prevState = this._state;
        console.log('setState', (force && 'FORCE') || '', prevState, '->', state);

        this._state = state;
        const nextState = this._states[state];
        if (nextState) {
            try {
                this._data.currentTimeline = nextState(stateArgs);
            } catch (err) {
                console.error('Persona: state change error', err);
            }
        }
    }

    beginListen() {
        const listeningPromise = new Promise(resolve => {
            this._listeningResolve = resolve;
        });

        this.setState('listen', false, { finishPromise: listeningPromise })
    }

    endListen() {
        if (this._listeningResolve) {
            this._listeningResolve();
            this._listeningResolve = null;
        }
        else {
            this.setState('idle');
        }
    }

    _computeColors() {
        this.colorHSL = Chroma.hsl(this._settings.hsl.x, this._settings.hsl.y, this._settings.hsl.z);
        this.rings[0].data.color = Chroma.hsl(0, 0, this._settings.hsl.z * 2);
        this.rings[1].data.color = this.rings[0].data.color.darken(0.5);
        this.rings[2].data.color = this.rings[1].data.color.darken(0.3);
        for (let i = 3; i < this._settings.ringCount; i++) {
            this.rings[i].data.color = this.colorHSL.darken(i - 3.5);
        }

        if (this._settings.glow) {
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
