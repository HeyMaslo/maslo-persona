var RingGeometry = require('./ringGeometry');
var RingMaterial = require('./ringMaterial');

var Ring = function( parent, id ){
	this.parent = parent;
	this.seed = new THREE.Vector3( ( Math.random() - 0.5 ) * 2, ( Math.random() - 0.5 ) * 2, ( Math.random() - 0.5 ) * 2 );
	this.id = id;
	this.osc = 0.1;
	this.intensity = 1;
	this.gaussIt = 1;
	this.weightIn = 1;
	this.shadowSpread = 0.;
	this.theta = 0;
	this.gaussAmplitude = 0.3;
	this.opacity = 0;
	this.color;

	this.ringGeometry = new RingGeometry( this );
	this.ringMaterial = new RingMaterial( this );

	this.mesh = new THREE.Mesh( this.ringGeometry.geoData, this.ringMaterial.matData );
	this.parent.group.add( this.mesh );

}

Ring.prototype.step = function( time ){
	this.ringGeometry.step( time );
	this.mesh.rotation.z = this.theta * Math.PI * 2;
	this.ringMaterial.matData.uniforms.opacity.value = this.opacity;
}

module.exports = Ring;