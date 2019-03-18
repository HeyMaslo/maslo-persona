import * as THREE from 'three';

const Shaders = {
    vertex: require('../app/shaders/ringVertex.glsl'),
    frag: require('../app/shaders/ringFragment.glsl'),
};

const Textures = {
    noise: require('../app/img/noise.png'),
};

export function RingMaterial(id) {
    const texture = new THREE.TextureLoader().load(Textures.noise);

    return new THREE.ShaderMaterial({
        uniforms: {
            tx: { value: texture },
            id: { value: id },
            opacity: { value: 1 },
        },
        vertexShader: Shaders.vertex,
        fragmentShader: Shaders.vertex,
        transparent: true,
    });
}
