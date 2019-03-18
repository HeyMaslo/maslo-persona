import { observable } from 'mobx';
import * as THREE from 'three';
import * as Chroma from 'chroma-js';

import { AudioPlayer } from './audio';
import { PersonaRing } from './ring';
import { DefaultSettings } from './persona.settings';
import createStates from './persona.states';

/** @typedef {(import ('./persona.settings').MasloPersonaSettings)} MasloPersonaSettings */

/** @typedef {(persona: MasloPersona) => void} PersonaStateRunner */

/** @typedef {(import ('./persona.states').States)} States */
/** @typedef {(import ('./persona.states').PersonaListeningState)} PersonaListeningState */

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

    mood = {};

    /** @type {Partial<PersonaListeningState>} */
    _listening = {};

    /**
     * @param {THREE.Scene} scene
     * @param {Partial<MasloPersonaSettings>} settings=
     **/
    constructor(scene, settings = null) {
        /** @type {MasloPersonaSettings} */
        this._settings = Object.assign({}, DefaultSettings, settings);

        this.audio = new AudioPlayer();

        this._time = 0;
        this._timeInc = this._settings.timeInc;
        this._rotationSpeed = 0;

        this._modifierTime = 0;
        this._modifierTimestep = 0;

        this._globalContainer = new THREE.Object3D();
        this._group = new THREE.Object3D();
        this._globalContainer.add(this._group);
        scene.add(this._globalContainer);
        this._group.scale.set(this._settings.radius, this._settings.radius, 1);

        this._states = createStates(this);

        /** @type {PersonaRing[]} */
        this.rings = [];
        for (let i = 0; i < this._settings.ringCount; i++) {
            const ring = new PersonaRing(i, this._settings);
            this._group.add(ring.theGroup);

            this.rings.push(ring);
        }

        for (let i = 0; i < Colors.length; i++) {
            const color = Chroma(Colors[i]).hsl();
            const originalColor = new THREE.Vector3(color[0] || 0, color[1], color[2]);
            this.rings[i].data.originalColor = originalColor;
            this.rings[i].data.hsl = originalColor;
        }

        this.computeColors();
    }

    get state() { return this.state; }
    get settings() { return this._settings; }
    get container() { return this._globalContainer; }

    computeColors() {
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

    step(time) {
        this._group.rotation.z = this._settings.rotation * Math.PI * 2;
        this._group.scale.set(this._settings.radius * this._settings.scale.x, this._settings.radius * this._settings.scale.y, 1);
        this._time += this._timeInc;
        this._modifierTime += this._modifierTimestep;

        this.computeColors();

        if (this._state === 'idle') {
            this._states.idle();
        }

        // this.updateStates(time);

        for (let i = 0; i < this.rings.length; i++) {
            const ring = this.rings[i];
            const prevRing = (i > 0 && this.rings[i - 1]) || null;
            ring.step(this._time, prevRing);
        }
    }

    /** @param {States} state */
    setState(state) {
        if (this._state === state) {
            return;
        }

        // console.log('setState', this._state, '->', state);

        this._state = state;
        const nextState = this._states[state];
        if (nextState) {
            nextState();
        }
    }

}
