var TrailGeometry = require('./trailGeometry');

var Trail = function( parent, id ){
	this.parent = parent;
	this.id = id;
	
	this.opacity = 0;
	this.osc = 0.1;
	this.width = 0.005;
	this.color = 0x000000;
	this.intensity = 0.6;
	this.scale = new THREE.Vector3(0.8,0.8,1);
	this.position = new THREE.Vector3(0,0,0);
	this.theta = Math.random()

	this.trailGeometry = new TrailGeometry( this );
	this.trailMaterial = new THREE.MeshBasicMaterial({ color : 0xff0000, wireframe : false, transparent : true, opacity : 0.5 });
	
	this.mesh = new THREE.Mesh( this.trailGeometry.geoData, this.trailMaterial );
	
	this.parent.group.add( this.mesh );
}

Trail.prototype.step = function( time ){
	this.trailGeometry.step( time );
	
	this.trailMaterial.color.setHex(this.color)
	this.trailMaterial.opacity = this.opacity;

	this.position = this.parent.rings[0].position;
	this.mesh.rotation.z = this.theta * Math.PI * 2;

}

module.exports = Trail;