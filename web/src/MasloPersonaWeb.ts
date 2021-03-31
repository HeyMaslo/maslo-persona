import * as THREE from 'three';
import {
  PersonaCore,
  UseResources as UseMasloResources,
  States,
  PersonaSettings,
  IResourcesProvider,
  AnalyticsConfig,
  getRequireResources,
} from '../../lib/index';
import { AnalyticsManagerGA } from './analytics.ga';

export type PersonaWebOptions = {
  element: HTMLElement,
  size?: number,
  persona: Partial<PersonaSettings>,
  resources?: IResourcesProvider,
  analytics: AnalyticsConfig,
};

export default class MasloPersonaWebRenderer {

  private readonly _element: HTMLElement;
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _scene: THREE.Scene;
  private readonly _camera: THREE.Camera;

  private readonly _persona: PersonaCore;

  private _rafId: number;

  constructor(private readonly options: PersonaWebOptions) {
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

    UseMasloResources(options.resources || getRequireResources());

    this._persona = new PersonaCore(this._scene, options.persona);
    this._element.appendChild(this._renderer.domElement);

    this._persona.setAnalytics(new AnalyticsManagerGA(options.analytics));
    this._persona.analytics.init();

    // this._init();
  }

  // _init() {
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
  // }

  get core() { return this._persona; }
  get scene() { return this._scene; }
  get domElemenet() { return this._renderer.domElement; }

  /** Starts Persona update via `window.requestAnimationFrame` */
  run() {
    this._persona.setState(States.Init);
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

  private _autoStep = () => {
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
    const allStates = States.Helper.Values;
    const randomIndex = Math.floor(Math.random() * allStates.length);
    const randomState = allStates[randomIndex] || States.Idle;
    this._persona.setState(randomState);
  }

  dispose() {
    this.stop();
    this._element.removeChild(this._renderer.domElement);
    this._renderer.dispose();
  }
}
