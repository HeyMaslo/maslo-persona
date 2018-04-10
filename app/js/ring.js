var RingGeometry = require('./ringGeometry');
var RingMaterial = require('./ringMaterial');

var Ring = function( parent, id ){
	this.parent = parent;
	this.id = id;
	this.seed = new THREE.Vector3( ( Math.random() - 0.5 ) * 2, ( Math.random() - 0.5 ) * 2, ( Math.random() - 0.5 ) * 2 );
	
	this.osc = 0.05;
	this.intensity = 1;
	this.frequency = 0.2;
	this.gaussIt = 0;
	this.weightIn = 0;
	this.shadowSpread = 0.01;
	this.shadowColor = 0;
	this.shadowIntensity = 0.15;
	this.theta = Math.random();
	this.gaussAmplitude = 0.3;
	this.opacity = 0;
	this.color;
	this.scaleInc = new THREE.Vector3( 0, 0, 0 );
	this.scale = new THREE.Vector3( 1, 1, 1 );
	this.position = new THREE.Vector3( 0, 0, 0 );
	this.easingFactor = 0;

	this.ringGeometry = new RingGeometry( this );
	this.ringMaterial = new RingMaterial( this );

	this.mesh = new THREE.Mesh( this.ringGeometry.geoData, this.ringMaterial.matData );

	this.translationGroup = new THREE.Object3D();
	this.rotationGroup = new THREE.Object3D();

	this.rotationGroup.add( this.translationGroup );
	this.translationGroup.add( this.mesh );
	this.parent.group.add( this.rotationGroup );
}

Ring.prototype.step = function( time ){
	this.ringGeometry.step( time );
	this.rotationGroup.rotation.z = this.theta * Math.PI * 2;
	this.rotationGroup.scale.set( this.scale.x + this.scaleInc.x, this.scale.y + this.scaleInc.y, 1 )
	this.translationGroup.position.set(this.position.x,this.position.y,this.position.z)
	this.ringMaterial.matData.uniforms.opacity.value = this.opacity;
}

module.exports = Ring;