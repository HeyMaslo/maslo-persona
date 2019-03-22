import { autorun } from 'mobx';
import * as THREE from 'three';
import { MasloPersona } from '../../web';
import { LineController } from './lineController';
import { CircleController } from './circleController';

export class Main {
    constructor() {

        this.element = document.getElementById('main');
        this.debugBut = document.getElementById('debugBut');
        this.debugEl = document.getElementById('debug');
        this.listeningBut = document.getElementById('listeningBut');

        this.mouseIsDown = false;
        this.startAngle = 0;
        this.angleSpeed = 0;
        this.debugActive = false;

        window.addEventListener('resize', this.resize.bind(this));
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this));

        if (this.debugBut) {
            this.debugBut.addEventListener('mousedown', this.debugToggle.bind(this));
        }

        this.controls = document.getElementsByClassName('controlBut');
        for (let i = 0; i < this.controls.length; i++) {
            if (this.controls[i].getAttribute('id') !== 'listeningBut') {
                this.controls[i].addEventListener('click', this.controlClicked.bind(this));
            }
        }

        if (this.listeningBut) {
            this.listeningBut.addEventListener('mousedown', this.questionMouseDown.bind(this));
        }
        if (this.listeningBut) {
            this.listeningBut.addEventListener('mouseup', this.questionMouseUp.bind(this));
        }
        if (this.listeningBut) {
            this.listeningBut.addEventListener('mouseleave', this.questionMouseUp.bind(this));
        }

        this.circleController = new CircleController();
        this.lineController = new LineController();

        this._persona = new MasloPersona({
            scale: 3,
            element: this.element,
            persona: {
                ringRes: 80,
                radius: 350,
                glow: false,
            },
        });

        autorun(() => {
            const state = this._persona.core.state;
            for (let i = 0; i < this.controls.length; i++) {
                this.controls[i].classList.remove('active');
                if (this.controls[i].getAttribute('data-reaction') === state) {
                    this.controls[i].classList.add('active');
                }
            }
        });

        // this._addBackground();
    }

    _addBackground() {
        const scene = this._persona.scene;
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

    questionMouseDown = e => {
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

    onMouseDown = e => {
        this.mouseIsDown = true;
        this.tapTimeout = setTimeout(() => {
            this._persona.core.setState('tap');
        }, 100);

        const personaPos = this._persona.core._settings.position;
        this.startAngle = Math.atan2(e.clientY - (this.element.offsetHeight / 2 + personaPos.y), e.clientX - (this.element.offsetWidth / 2 + personaPos.x)) / (Math.PI * 2);
        this.lastAngle = this.startAngle;
    }

    onMouseUp = e => {
        this.mouseIsDown = false;
        // var angle = Math.atan2(e.clientY - (this.element.offsetHeight / 2 + this.persona.position.y), e.clientX -(this.element.offsetWidth / 2 + this.persona.position.x))/ (Math.PI * 2);
        if (Math.abs(this.angleSpeed) > 0.01) {
            this._persona.core.audio.play('swipe');
        }
    }

    onMouseMove = (e) => {
        if (this.mouseIsDown) {
            clearInterval(this.tapTimeout);
        }

        const personaPos = this._persona.core._settings.position;
        const angle = Math.atan2(
            e.clientY - (this.element.offsetHeight / 2 + personaPos.y),
            e.clientX - (this.element.offsetWidth / 2 + personaPos.x),
        ) / (Math.PI * 2);

        if (this.mouseIsDown) {
            this.angleSpeed += (Math.min(Math.max(-0.05, this.lastAngle - angle), 0.05) - this.angleSpeed) * 0.15;
            this._persona.core._settings.rotation += this.angleSpeed;
            this.lastAngle = angle;
        }
    }

    controlClicked = e => {
        const nextState = e.target.dataset.reaction;
        if (nextState) {
            this._persona.core.setState(nextState);
        }
    }

    resize = e => {
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
        window.requestAnimationFrame(this.step);

        this.angleSpeed -= this.angleSpeed * 0.05;
        this._persona.core._data.rotation += this.angleSpeed;

        // this.debug && this.debug.step(time);
        this.circleController.step();
        this.lineController.step();

        // const logMoods = [];
        Object.keys(this.circleController.vals).forEach(key => {
            let val = this.circleController.vals[key] + this.lineController.vals[key];

            val = Math.round(val * 10000) / 10000;

            this._persona.core.mood[key] = val;
            // if (Math.abs(val) > 0) {
            //     logMoods.push({ key, val });
            // }
        });

        // if (logMoods.length > 0) {
        //     console.log(...logMoods);
        // }

        this._persona.step();
    };
}
