attribute vec4 color;
attribute float mat;
varying vec4 vColor;
varying vec2 vUv;
varying float vMat;

void main() {
	vUv = uv;
	vMat = mat;
	vColor = color;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}