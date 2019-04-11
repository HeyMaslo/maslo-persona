import { autorun } from 'mobx';
import * as THREE from 'three';
import { Persona, States } from '../../web';
import { LineController } from './lineController';
import { CircleController } from './circleController';

export class Main {
  constructor() {

    this.element = document.getElementById('main');
    this.debugBut = document.getElementById('debugBut');
    this.debugEl = document.getElementById('debug');
    this.listeningBut = document.getElementById('listeningBut');
    this.controls = document.getElementsByClassName('controlBut');

    this.mouseIsDown = false;
    this.startAngle = 0;
    this.angleSpeed = 0;
    this.debugActive = false;

    this.circleController = new CircleController();
    this.lineController = new LineController();

    this._persona = new Persona({
      // target HTML container that will hold WebGL canvas
      element: this.element,

      // size of the canvas, in pixels. Recommended is `persona.radius` multiplied by 3
      size: 900,

      persona: {
        // amount of vertices per ring. Bigger value increases quality, smaller increases performance
        ringRes: 100,

        // radius of Persona view, in pixels
        radius: 300,
      },
    });

    autorun(() => {
      const { state } = this._persona.core;
      for (let i = 0; i < this.controls.length; i++) {
        const control = this.controls[i];
        control.classList.remove('active');
        if (control.getAttribute('data-reaction') === state) {
          control.classList.add('active');
        }
      }
    });

    this._subscribe();

    // this._addBackground();
  }

  _subscribe() {
    window.addEventListener('resize', this.resize);
    this.element.addEventListener('mousedown', this.onMouseDown);
    this.element.addEventListener('mouseup', this.onMouseUp);
    this.element.addEventListener('mousemove', this.onMouseMove);

    if (this.debugBut) {
      this.debugBut.addEventListener('mousedown', this.debugToggle);
    }

    for (let i = 0; i < this.controls.length; i++) {
      const control = this.controls[i];
      if (control.getAttribute('id') !== 'listeningBut') {
        control.addEventListener('click', this.controlClicked);
      }
    }

    if (this.listeningBut) {
      this.listeningBut.addEventListener('mousedown', this.questionMouseDown);
      this.listeningBut.addEventListener('mouseup', this.questionMouseUp);
      this.listeningBut.addEventListener('mouseleave', this.questionMouseUp);
    }
  }

  _unsubscribe() {
    window.removeEventListener('resize', this.resize);
    this.element.removeEventListener('mousedown', this.onMouseDown);
    this.element.removeEventListener('mouseup', this.onMouseUp);
    this.element.removeEventListener('mousemove', this.onMouseMove);

    if (this.debugBut) {
      this.debugBut.removeEventListener('mousedown', this.debugToggle);
    }

    for (let i = 0; i < this.controls.length; i++) {
      const control = this.controls[i];
      if (control.getAttribute('id') !== 'listeningBut') {
        control.removeEventListener('click', this.controlClicked);
      }
    }

    if (this.listeningBut) {
      this.listeningBut.removeEventListener('mousedown', this.questionMouseDown);
      this.listeningBut.removeEventListener('mouseup', this.questionMouseUp);
      this.listeningBut.removeEventListener('mouseleave', this.questionMouseUp);
    }
  }

  _addBackground() {
    const { scene } = this._persona;
    {
      const geometry = new THREE.PlaneBufferGeometry(1, 1);

      // if (window.pageMode) fs = 'varying vec2 vUv; void main() { gl_FragColor = vec4( 0.37, 0.73, 0.98, 1.0 ); }';

      const material = new THREE.ShaderMaterial({
        vertexShader: `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
        // flat background
        fragmentShader: `
varying vec2 vUv;

void main() {
    float intensity = smoothstep( 0.0, 0.3, vUv.x * vUv.y );
    float r = 0.215686274509804 * (1.0 - intensity) + 0.6352941176 * intensity;
    float g = 0.733333333333333 * (1.0-intensity) + 0.43921568627451 * intensity;
    float b = 1.0 * (1.0-intensity) + 1.0 * intensity;

    gl_FragColor = vec4(r, g, b, 1.0);
}`,
      });

      material.transparent = true;
      material.blending = THREE.MultiplyBlending;
      this.plane = new THREE.Mesh(geometry, material);
      this.plane.position.z = -10;
      scene.add(this.plane);
    }

    {
      const geometry = new THREE.PlaneBufferGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.background = new THREE.Mesh(geometry, material);
      this.background.position.z = -100;
      scene.add(this.background);
    }
  }

  run() {
    this.resize();
    this.step();
  }

  questionMouseDown = (e) => {
    e.preventDefault();
    this._persona.core.beginState('listen');
  }

  questionMouseUp = () => {
    this._persona.core.endState();
  }

  debugToggle = () => {
    this.debugActive = !this.debugActive;
    if (this.debugActive) {
      this.debugEl.classList.add('active');
    } else {
      this.debugEl.classList.remove('active');
    }

    this._persona.core.activateRenderingDebug(this.debugActive);
  }

  // changeColor = e => {
  //     this.colorScheme = e.target.getAttribute('color-scheme');
  //     for(var i = 0 ; i < this.colorButs.length ; i++) this.colorButs[i].classList.remove('active')
  //     e.target.classList.add('active');
  // }

  onMouseDown = (e) => {
    this.mouseIsDown = true;
    this.tapTimeout = setTimeout(() => {
      this._persona.core.setState(States.Tap);
    }, 100);

    const personaPos = this._persona.core.position;
    this.startAngle = Math.atan2(
      e.clientY - (this.element.offsetHeight / 2 + personaPos.y),
      e.clientX - (this.element.offsetWidth / 2 + personaPos.x),
    ) / (Math.PI * 2);
    this.lastAngle = this.startAngle;
  }

  onMouseUp = () => {
    this.mouseIsDown = false;
    // const angle = Math.atan2(
    //   e.clientY - (this.element.offsetHeight / 2 + this._persona.core.position.y),
    //   e.clientX - (this.element.offsetWidth / 2 + this._persona.core.position.x),
    // ) / (Math.PI * 2);
    if (Math.abs(this.angleSpeed) > 0.01) {
      this._persona.core.audio.play('swipe');
    }
  }

  onMouseMove = (e) => {
    if (this.mouseIsDown) {
      clearInterval(this.tapTimeout);
    }

    const personaPos = this._persona.core.position;
    const angle = Math.atan2(
      e.clientY - (this.element.offsetHeight / 2 + personaPos.y),
      e.clientX - (this.element.offsetWidth / 2 + personaPos.x),
    ) / (Math.PI * 2);

    if (this.mouseIsDown) {
      this.angleSpeed += (Math.min(Math.max(-0.05, this.lastAngle - angle), 0.05) - this.angleSpeed) * 0.15;
      this._persona.core.rotation += this.angleSpeed;
      this.lastAngle = angle;
    }
  }

  controlClicked = (e) => {
    const nextState = e.target.dataset.reaction;
    if (nextState) {
      this._persona.core.setState(nextState);
    }
  }

  resize = () => {
    const width = this.element.offsetWidth;
    const height = this.element.offsetHeight;

    if (this.background) {
      this.background.scale.set(width, height, 1);
    }
    if (this.plane) {
      this.plane.scale.set(this.element.offsetWidth, this.element.offsetHeight, 1);
    }
    this._persona.resize();
  }

  step = () => {
    this.rafId = window.requestAnimationFrame(this.step);

    this.angleSpeed -= this.angleSpeed * 0.05;
    this._persona.core.rotation += this.angleSpeed;

    // this.debug && this.debug.step(time);
    this.circleController.step();
    this.lineController.step();

    Object.keys(this.circleController.vals).forEach((key) => {
      let val = this.circleController.vals[key] + this.lineController.vals[key];

      val = Math.round(val * 10000) / 10000;

      this._persona.core.mood[key] = val;
    });

    this._persona.step();
  }

  dispose() {
    window.cancelAnimationFrame(this.rafId);
    this._unsubscribe();

    this.circleController.dispose();
    this.lineController.dispose();
    this._persona.dispose();
  }
}
