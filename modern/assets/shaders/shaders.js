// Shader source code as ES module exports

export const vertexShader = `
attribute vec4 color;
attribute float mat;
varying vec4 vColor;
varying vec2 vUv;
varying float vMat;

void main() {
    vUv = uv;
    vMat = mat;
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = `
varying vec4 vColor;
varying vec2 vUv;
varying float vMat;

uniform sampler2D tx;
uniform float id;
uniform float opacity;

void main() {
    vec4 nt1 = texture2D(tx, (vUv + vec2(1.0, 1.0)) * 0.2);
    vec4 nt = texture2D(tx, (vUv + vec2(1.2, 1.2)) * 0.2);
    vec4 color = vColor;

    if(vMat == 0.0) color.rgb -= nt1.r * 0.05;
    color.a = vColor.a * opacity;

    if(vMat == 1.0) color.a *= 0.5 + nt.r * 0.5;

    gl_FragColor = color;
}
`;
