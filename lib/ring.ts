import * as THREE from 'three';
import { PersonaRingData } from './ring.data';
import { RingGeometry } from './ring.geometry';
import { RingMaterial } from './ring.material';
import { PersonaConfig } from './persona.settings';
import { IPersonaRing } from './abstractions';

export type RingSettings = { id: number, config: PersonaConfig };

export class PersonaRing implements IPersonaRing {

  readonly data: PersonaRingData;
  private readonly _geometry: RingGeometry;
  private readonly _material: THREE.ShaderMaterial;
  private readonly _originalMaterial: THREE.ShaderMaterial;
  private readonly mesh: THREE.Mesh;

  private readonly translationGroup: THREE.Object3D;
  private readonly rotationGroup: THREE.Object3D;

  private _debugMaterial: THREE.MeshBasicMaterial;

  constructor(id: number, config: PersonaConfig, skipTexture = false) {
    this.data = new PersonaRingData(id, config);

    this._geometry = new RingGeometry(this.data);
    this._material = RingMaterial(id, skipTexture);
    this._originalMaterial = this._material;

    this.mesh = new THREE.Mesh(this._geometry.geoData, this._material);

    this.translationGroup = new THREE.Object3D();
    this.rotationGroup = new THREE.Object3D();

    this.rotationGroup.add(this.translationGroup);
    this.translationGroup.add(this.mesh);
  }

  get theGroup() { return this.rotationGroup; }

  step(time: number, prevRing: PersonaRing) {
    this._geometry.step(time, prevRing && prevRing._geometry);
    this.rotationGroup.rotation.z = this.data.theta * Math.PI * 2;
    this.rotationGroup.scale.set(this.data.scale.x + this.data.scaleInc.x, this.data.scale.y + this.data.scaleInc.y, 1);
    this.translationGroup.position.set(this.data.position.x, this.data.position.y, this.data.position.z);
    this._material.uniforms.opacity.value = this.data.opacity;
  }

  activateDebbugRendering(active: boolean) {
    if (!active) {
      this.mesh.material = this._originalMaterial;
      return;
    }

    if (!this._debugMaterial) {
      this._debugMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      });
    }

    this.mesh.material = this._debugMaterial;
  }
}
