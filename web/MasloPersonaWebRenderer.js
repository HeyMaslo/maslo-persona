import { MasloPersona } from '../lib';
import * as THREE from 'three';

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
        const width = 2.5 * radius;
        const height = 2.5 * radius;

        this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this._renderer.setSize(width, height, false);

        this._scene = new THREE.Scene();
        this._camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1000);
        this._camera.position.z = 100;

        this._persona = new MasloPersona(this._scene, options.persona);

        this._element.appendChild(this._renderer.domElement);

        this._persona.setState('init');

        this.step();

        this._element.onclick = () => {
            this._persona.setState('joy');
        }
    }

    onResize = () => {

    }

    step = time => {
        requestAnimationFrame(this.step);

        try {
            this._persona.step(time);
        } catch (err) {
            console.error(err);
        }

        this._renderer.render(this._scene, this._camera);
    }
}