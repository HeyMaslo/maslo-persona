import * as THREE from 'three';

const Shaders = {
    vertex: require('./assets/shaders/ringVertex.glsl'),
    frag: require('./assets/shaders/ringFragment.glsl'),
};

const Textures = {
    noise: require('./assets/img/noise.png'),
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
        fragmentShader: Shaders.frag,
        transparent: true,
    });
}
