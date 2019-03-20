import { MasloPersona } from '../lib';
import * as THREE from 'three';

import { States, AllStates } from '../lib/persona.states';

/** @typedef {(import ('lib').MasloPersonaSettings)} MasloPersonaSettings */

/** @typedef {Object} MasloPersonaWebRendererOptions
 * @property {HTMLElement} element
 * @property {Partial<MasloPersonaSettings>=} persona
 */

export default class MasloPersonaWebRenderer {

    /** @param {MasloPersonaWebRendererOptions} options */
    constructor(options) {
        this._element = options.element;

        const radius = (options.persona && options.persona.radius) || 200;
        const width = 2.8 * radius;
        const height = 2.8 * radius;

        this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this._renderer.setSize(width, height, false);

        this._scene = new THREE.Scene();
        this._camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1000);
        this._camera.position.z = 100;

        this._persona = new MasloPersona(this._scene, options.persona);

        this._element.appendChild(this._renderer.domElement);

        this._persona.setState('init');

        this._step();

        let isListening = false;
        // an example how to begin/end listening
        const toggleListening = () => {
            if (!isListening) {
                this._persona.beginState('listen');
            } else {
                this._persona.endState();
            }
            isListening = !isListening;
        };

        this._element.onclick = () => {
            // this.randomState();
            // this._persona.setState('listen');
            toggleListening();
        }

        // an example how to demonstrate mood update
        // setTimeout(() => {
        //     this._persona.mood.joy = 0.5;
        //     setTimeout(() => {
        //         this._persona.mood.joy = 0;
        //     }, 2000);
        // }, 5000);
    }

    get persona() { return this._persona; }

    _onResize = () => {

    }

    _step = time => {
        requestAnimationFrame(this._step);

        try {
            this._persona.step(time);
        } catch (err) {
            console.error('Persona step error', err);
        }

        this._renderer.render(this._scene, this._camera);
    }

    randomState() {
        const randomIndex = Math.floor(Math.random() * AllStates.length);
        const randomState = AllStates[randomIndex] || States.Idle;
        this._persona.setState(randomState);
    }
}