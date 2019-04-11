import * as THREE from 'three';

/** @typedef {(import ('./ring.data').PersonaRingData)} PersonaRingData */

export class RingGeometry {
  /** @param {PersonaRingData} data */
  constructor(data) {
    this.data = data;

    this.geoData = new THREE.BufferGeometry();

    this.gauss = [];

    const { ringRes } = this.data.settings;

    // positions
    const positions = [];
    for (let i = 0; i < ringRes * 3 + 1; i++) {
      positions.push(0, 0, this.data.id * 10);
    }

    this.geoData.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    // indices
    const indices = [];
    for (let i = 0; i < ringRes; i++) {
      indices.push(0, i, i + 1);
    }
    for (let i = 0; i < ringRes - 1; i++) {
      indices.push(
        ringRes + 1 + i,
        ringRes * 2 + 1 + i,
        ringRes + 2 + i,
        ringRes + 2 + i,
        ringRes * 2 + 1 + i,
        ringRes * 2 + 2 + i,
      );
    }
    indices.push(
      0,
      ringRes,
      1,
      ringRes * 2,
      ringRes * 3,
      ringRes + 1,
      ringRes + 1,
      ringRes * 3,
      ringRes * 2 + 1,
    );
    this.geoData.setIndex(indices);

    // color
    const colors = [];
    for (let i = 0; i < ringRes + 1; i++) {
      colors.push(0, 0, 0, 1);
    }

    for (let i = ringRes + 1; i < ringRes * 2 + 1; i++) {
      colors.push(this.data.shadowColor, this.data.shadowColor, this.data.shadowColor, this.data.shadowIntensity);
    }

    for (let i = ringRes * 2 + 1; i < ringRes * 3 + 1; i++) {
      colors.push(this.data.shadowColor, this.data.shadowColor, this.data.shadowColor, 0);
    }

    this.geoData.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 4));

    // uvs
    const uv = [];
    for (let i = 0; i < ringRes * 3 + 1; i++) {
      uv.push(0, 0);
    }

    this.geoData.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));

    // matID
    const matId = [];
    for (let i = 0; i < ringRes + 1; i++) {
      matId.push(0);
    }

    for (let i = ringRes + 1; i < ringRes * 3 + 1; i++) {
      matId.push(1);
    }
    this.geoData.addAttribute('mat', new THREE.BufferAttribute(new Float32Array(matId), 1));

    this.setGauss();
  }

  setGauss() {
    const { ringRes } = this.data.settings;

    const points = Math.round(ringRes * this.data.gaussAmplitude);
    const minDiv = 0.1;
    for (let i = 0; i <= points; i++) {
      this.gauss[i] = (Math.sin(2 * Math.PI * ((i / points) - 0.25)) + 1) / 2 + minDiv;
    }
    for (let i = 0; i < Math.round(ringRes - points) / 2; i++) {
      this.gauss.unshift(minDiv);
    }
    for (let i = this.gauss.length; i < ringRes; i++) {
      this.gauss.push(minDiv);
    }
  }

  /**
   * @param {number} time
   * @param {RingGeometry} prevRingGeometry
   */
  step(time, prevRingGeometry) {
    const { ringRes, simplex } = this.data.settings;

    /** @type {THREE.Vector2[]} */
    this.points = [];
    if (prevRingGeometry) {
      this.oldPoints = prevRingGeometry.points;
    } else {
      this.oldPoints = [];
    }

    const colGL = this.data.color.gl();
    const colGLDark = this.data.color.darken(0.5).gl();

    this.geoData.attributes.color.setXYZ(0, colGLDark[0], colGLDark[1], colGLDark[2]);

    for (let i = 0; i < ringRes; i++) {
      const vector = new THREE.Vector2(Math.cos(Math.PI * 2 * i / ringRes), Math.sin(Math.PI * 2 * i / ringRes));

      const dim1 = (vector.x + this.data.id / 10) / (1 / this.data.intensity);
      const dim2 = (vector.y + time) / (1 / this.data.frequency);

      // const dim3 = time;

      let n = (simplex.noise2D(dim1, dim2) + 1) / 2 * this.data.osc;

      // gaussian
      n *= 1 - ((1 - this.gauss[i]) * this.data.gaussIt);

      // sinusoidal
      // n *= ( 1 + Math.sin( Math.PI * 2 * i / this.data.ringRes ) ) / 2 * 0.3;

      const pps = new THREE.Vector2(vector.x * (1 - n), vector.y * (1 - n));

      // get previous position
      if (this.data.id === 0) {
        this.points.push(pps);
      } else {
        this.points.push(this.oldPoints[i].sub(vector.clone().multiplyScalar(n)));
      }

      // cummulative noise2D
      this.points[i] = pps.clone().add(this.points[i].clone().sub(pps.clone()).multiplyScalar(this.data.weightIn));

      this.geoData.attributes.color.setXYZ((i + 1), colGL[0], colGL[1], colGL[2]);

      this.geoData.attributes.uv.setXY((i + 1), this.points[i].x, this.points[i].y);
      this.geoData.attributes.uv.setXY((ringRes + i + 1), this.points[i].x, this.points[i].y);
      this.geoData.attributes.uv.setXY(
        ringRes * 2 + i + 1,
        this.points[i].x + vector.x * 0.1, this.points[i].y + vector.y * 0.1,
      );

      this.geoData.attributes.position.setXY((i + 1), this.points[i].x, this.points[i].y);
      this.geoData.attributes.position.setXY(
        (ringRes + i + 1),
        this.points[i].x,
        this.points[i].y,
      );
      this.geoData.attributes.position.setXY(
        ringRes * 2 + i + 1,
        this.points[i].x + vector.x * this.data.shadowSpread,
        this.points[i].y + vector.y * this.data.shadowSpread,
      );
    }

    for (let i = ringRes + 1; i < ringRes * 2 + 1; i++) {
      this.geoData.attributes.color.setXYZW(
        i,
        this.data.shadowColor,
        this.data.shadowColor,
        this.data.shadowColor,
        this.data.shadowIntensity,
      );
    }
    for (let i = ringRes * 2 + 1; i < ringRes * 3 + 1; i++) {
      this.geoData.attributes.color.setXYZW(i, this.data.shadowColor, this.data.shadowColor, this.data.shadowColor, 0);
    }

    this.geoData.attributes.color.needsUpdate = true;
    this.geoData.attributes.position.needsUpdate = true;
  }
}
