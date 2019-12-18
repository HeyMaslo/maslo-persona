import * as THREE from 'three';
import Resources from './resources';
import { isRawResource } from './abstractions';

export function RingMaterial(id: any) {
  const res = Resources.Current.textures.noise;

  let texture: THREE.Texture;
  if (isRawResource(res)) {
    texture = res.raw;
  } else {
    texture = new THREE.TextureLoader().load(res.url);
  }

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
