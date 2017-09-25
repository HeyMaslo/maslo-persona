var THREE = require('three');

var vs = require('../shaders/ringVertex.glsl');
var fs = require('../shaders/ringFragment.glsl');

var RingMaterial = function( parent ){
	this.parent = parent;
	var texture = new THREE.TextureLoader().load( 'img/noise.png' );

	this.matData = new THREE.ShaderMaterial( {
		uniforms: {
			tx : { value : texture },
			id : { value : this.parent.id },
			opacity : { value : 1 }
		},
		vertexShader: vs,
		fragmentShader: fs,
		transparent : true,
		// premultipliedAlpha : true

	} );

}
module.exports = RingMaterial;