import { MasloPersona, UseResources as UseMasloResources } from 'lib';
import * as THREE from 'three';

import { States, AllStates } from 'lib/persona.states';

/** @typedef {(import ('lib').MasloPersonaSettings)} MasloPersonaSettings */
/** @typedef {(import ('lib').ResourcesData)} MasloResources */

/**
 * @typedef {Object} MasloPersonaWebRendererOptions
 * @property {number} [scale=3]
 * @property {HTMLElement} element
 * @property {Partial<MasloPersonaSettings>=} persona
 * @property {MasloResources=} resources
 */

export default class MasloPersonaWebRenderer {

    /** @param {MasloPersonaWebRendererOptions} options */
    constructor(options) {
        this._element = options.element;

        const radius = (options.persona && options.persona.radius) || 200;
        const scale = options.scale || 3;
        const width = scale * radius;
        const height = scale * radius;

        this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this._renderer.setSize(width, height, false);

        this._scene = new THREE.Scene();
        this._camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1000);
        this._camera.position.z = 100;

        UseMasloResources(options.resources);
        this._persona = new MasloPersona(this._scene, options.persona);

        this._element.appendChild(this._renderer.domElement);

        this._persona.setState('init');

        // an example how to begin/end listening
        // let isListening = false;
        // const toggleListening = () => {
        //     if (!isListening) {
        //         this._persona.beginState('listen');
        //     } else {
        //         this._persona.endState();
        //     }
        //     isListening = !isListening;
        // };

        // this._element.onclick = () => {
        //     this.randomState();
        //     // this._persona.setState('listen');
        //     // toggleListening();
        // };

        // an example how to demonstrate mood update
        // setTimeout(() => {
        //     this._persona.mood.joy = 0.5;
        //     setTimeout(() => {
        //         this._persona.mood.joy = 0;
        //     }, 2000);
        // }, 5000);
    }

    get core() { return this._persona; }
    get scene() { return this._scene; }

    run() {
        this._autoStep();
    }

    resize = () => {
        // const width = this._element.offsetWidth;
        // const height = this._element.offsetHeight;

        // this._renderer.setSize(width * 2, height * 2);
        // this._renderer.domElement.width = width;
        // this._renderer.domElement.height = height;

        // this._camera.left = width / -2;
        // this._camera.right = width / 2;
        // this._camera.top = height / 2;
        // this._camera.bottom = height / -2;

        // this._camera.position.z = 1000;
        // this._camera.updateProjectionMatrix();
    }

    _autoStep = () => {
        requestAnimationFrame(this._autoStep);

        this.step();
    }

    step = () => {

        try {
            this._persona.step();
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
