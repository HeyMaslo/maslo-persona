import * as THREE from 'three';
import {
  PersonaCore,
  UseResources as UseMasloResources,
  States,
  AllStates,
} from '../lib';

/** @typedef {(import ('lib').PersonaSettings)} PersonaSettings */
/** @typedef {(import ('lib').ResourcesData)} ResourcesConfig */

/**
 * @typedef {Object} PersonaWebOptions
 * @property {HTMLElement} element target HTML container that will hold WebGL canvas
 * @property {number} [size=600] size of the canvas, in pixels. Recommended is `persona.radius` multiplied by 3
 * @property {Partial<PersonaSettings>=} persona settings for Persona
 * @property {ResourcesConfig=} resources overrides Persona Resources links
 */

export default class MasloPersonaWebRenderer {

  /** @param {PersonaWebOptions} options */
  constructor(options) {
    this._element = options.element;

    const radius = (options.persona && options.persona.radius) || 200;
    const size = options.size || (3 * radius);
    const width = size;
    const height = size;

    this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this._renderer.setSize(width, height, false);

    this._scene = new THREE.Scene();
    this._camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1000);
    this._camera.position.z = 100;

    UseMasloResources(options.resources);
    this._persona = new PersonaCore(this._scene, options.persona);
    this._element.appendChild(this._renderer.domElement);

    MasloPersonaWebRenderer._initGA();
    this._init();
  }

  _init() {

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
  get domElemenet() { return this._renderer.domElement; }

  /** Starts Persona update via `window.requestAnimationFrame` */
  run() {
    this._autoStep();
  }

  stop() {
    if (this._rafId) {
      window.cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
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

  /** @private */
  _autoStep = () => {
    this._rafId = window.requestAnimationFrame(this._autoStep);

    this.step();
  }

  /** Manually updates Persona */
  step = () => {

    try {
      this._persona.step();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Persona step error', err);
    }

    this._renderer.render(this._scene, this._camera);
  }

  /** Sets random state of Persona */
  randomState() {
    const randomIndex = Math.floor(Math.random() * AllStates.length);
    const randomState = AllStates[randomIndex] || States.Idle;
    this._persona.setState(randomState);
  }

  dispose() {
    this.stop();
    this._element.removeChild(this._renderer.domElement);
    this._renderer.dispose();
  }

  static _initGA() {
    const el = document.createElement('script');
    el.async = true;
    el.src = 'https://www.googletagmanager.com/gtag/js?id=UA-106568684-2';
    document.body.appendChild(el);

    /** @type {any[]} */
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line prefer-rest-params
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'UA-106568684-2');
  }
}
