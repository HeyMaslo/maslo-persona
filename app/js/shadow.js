// var SimplexNoise = require('simplex-noise');

var Shadow = function( parent ){
	this.parent = parent;


	this.points = [];
	

	var geometry = new THREE.BufferGeometry();
	var ps = [0,0,0];
	var is = [];
	for( var i = 0 ; i < this.parent.circleRes ; i++ ) ps.push( 0, 0, 0 );

	for( var i = 0 ; i < this.parent.circleRes ; i++ ) is.push( 0, i, i+1 );
	is.push( 0, this.parent.circleRes, 1 );

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ps ), 3 ) );
	geometry.setIndex( is );

	var material = new THREE.MeshBasicMaterial({ color : 0x00ff00, wireframe : false, transparent : true });


	this.mesh = new THREE.Mesh( geometry, material );
	// this.mesh.scale.set(0.001,0.001,1) 
	this.parent.group.add( this.mesh );



	this.mesh.position.z = -10;
}


Shadow.prototype.step = function( time ){

	this.fps = this.parent.rings[0].fps;

	for( var i = 0 ; i < this.parent.circleRes ; i++ ){
	
		this.mesh.geometry.attributes.position.setXYZ( ( i + 1 ), this.fps[i][0], this.fps[i][1], 0 );
	}
	
	this.mesh.rotation.z = this.parent.rings[0].mesh.rotation.z;
	this.mesh.scale = this.parent.rings[0].scale;
	this.mesh.geometry.attributes.position.needsUpdate = true;
}

module.exports = Shadow;