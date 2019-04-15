varying vec4 vColor;
varying vec2 vUv;
varying float vMat;

uniform sampler2D tx;
uniform float id;
uniform float opacity;

void main() {
	vec4 nt1 = texture2D( tx, ( vUv + vec2( 1.0, 1.0 ) ) * 0.2 );
	vec4 nt = texture2D( tx, ( vUv + vec2( 1.2, 1.2 ) ) * 0.2 );
	vec4 color = vColor;
	
	if( vMat == 0.0 ) color.rgb -=  nt1.r * 0.05;
	color.a = vColor.a * opacity;

	if( vMat == 1.0 ) color.a *= 0.5 + nt.r * 0.5;


	gl_FragColor = color;
}