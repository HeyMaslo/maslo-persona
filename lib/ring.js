import * as THREE from 'three';
import { PersonaRingData } from './ring.data';
import { RingGeometry } from './ring.geometry';
import { RingMaterial } from './ring.material';

/** @typedef {(import ('./persona.settings').MasloPersonaSettings)} MasloPersonaSettings */
/** @typedef {{id: number, settings: MasloPersonaSettings}} RingSettings */

export class PersonaRing {
    /**
     * @param {number} id
     * @param {MasloPersonaSettings} settings
     * */
    constructor(id, settings) {
        this.data = new PersonaRingData(id, settings);

        this._geometry = new RingGeometry(this.data);
        this._material = RingMaterial(this);

        this.mesh = new THREE.Mesh(this._geometry.geoData, this._material);

        this.translationGroup = new THREE.Object3D();
        this.rotationGroup = new THREE.Object3D();

        this.rotationGroup.add(this.translationGroup);
        this.translationGroup.add(this.mesh);
    }

    get theGroup() { return this.rotationGroup; }

    /**
     * @param {number} time
     * @param {PersonaRing} prevRing
     */
    step(time, prevRing) {
        this._geometry.step(time, prevRing && prevRing._geometry);
        this.rotationGroup.rotation.z = this.data.theta * Math.PI * 2;
        this.rotationGroup.scale.set(this.data.scale.x + this.data.scaleInc.x, this.data.scale.y + this.data.scaleInc.y, 1);
        this.translationGroup.position.set(this.data.position.x, this.data.position.y, this.data.position.z);
        this._material.uniforms.opacity.value = this.data.opacity;
    }
}
