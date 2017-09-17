var vs = require('./../shaders/ringVertex.glsl');
var fs = require('./../shaders/ringFragment.glsl');

var RingMaterial = function( parent ){
	this.parent = parent;
	
	this.matData = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, wireframe : false, transparent : true, opacity : 1 });
	this.matData = new THREE.ShaderMaterial( {
		uniforms: {
			
		},
		vertexShader: vs,
		fragmentShader: fs,
		transparent : true,
		premultipliedAlpha : false
	} );

}
module.exports = RingMaterial;