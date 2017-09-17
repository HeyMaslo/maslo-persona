var RingGeometry = require('./ringGeometry');
var RingMaterial = require('./ringMaterial');

var Ring = function( parent, id ){
	this.parent = parent;
	this.id = id;
	this.osc = 0.03;
	this.intensity = 1;
	this.gaussIt = 1;
	this.weightIn = 1;
	this.shadowSpread = 0.02;
	this.theta = 0;
	this.gaussAmplitude = 0.3;

	this.ringGeometry = new RingGeometry( this );
	this.ringMaterial = new RingMaterial( this );

	this.mesh = new THREE.Mesh( this.ringGeometry.geoData, this.ringMaterial.matData );
	this.parent.group.add( this.mesh );

}

Ring.prototype.step = function( time ){
	
	
	this.ringGeometry.step( time );
	this.mesh.rotation.z = this.theta * Math.PI * 2;
	
}

module.exports = Ring;