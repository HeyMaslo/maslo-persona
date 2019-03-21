import * as THREE from 'three';
import ResourcesManager from './resources';

export function RingMaterial(id) {
    const textureUrl = ResourcesManager.Current.textures.noise.url;
    const texture = new THREE.TextureLoader().load(textureUrl);

    return new THREE.ShaderMaterial({
        uniforms: {
            tx: { value: texture },
            id: { value: id },
            opacity: { value: 1 },
        },
        vertexShader: ResourcesManager.Current.shaders.PersonaVertex.raw,
        fragmentShader: ResourcesManager.Current.shaders.PersonaFragment.raw,
        transparent: true,
    });
}
