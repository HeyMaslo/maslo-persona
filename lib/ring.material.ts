import * as THREE from 'three';
import Resources from './resources';

export function RingMaterial(id: any) {
  const textureUrl = Resources.Current.textures.noise.url;
  const texture = new THREE.TextureLoader().load(textureUrl);

  return new THREE.ShaderMaterial({
    uniforms: {
      tx: { value: texture },
      id: { value: id },
      opacity: { value: 1 },
    },
    vertexShader: Resources.Current.shaders.PersonaVertex.raw,
    fragmentShader: Resources.Current.shaders.PersonaFragment.raw,
    transparent: true,
  });
}
