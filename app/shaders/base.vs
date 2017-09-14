uniform sampler2D height;
uniform float time;

void main() {
	vec4 tex = texture2D( height, uv );
	vec3 nPos = position;
	nPos.z = 200.0 * (tex.r-0.5);
	// nPos.x = position.x + nPos.z * sin( 3.14 * 2.0 * time )  ;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( nPos, 1.0 );
}