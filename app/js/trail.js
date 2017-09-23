var Trail = function( parent, id ){
	this.parent = parent;
	this.id = id;
	this.seed = new THREE.Vector3( ( Math.random() - 0.5 ) * 2, ( Math.random() - 0.5 ) * 2, ( Math.random() - 0.5 ) * 2 );
	
	this.opacity = 0;
	this.osc = 0.1;
	this.width = 0.006;
	this.color = 0x000000;
	this.intensity = 0.6;
	this.scale = new THREE.Vector3(1,1,1);
	this.position = new THREE.Vector3(0,0,0);
	this.theta = Math.random()

	this.trailGeometry = this.makeGeometry();
	this.trailMaterial = new THREE.MeshBasicMaterial({ wireframe : false, transparent : true, depthTest : false });
	
	this.mesh = new THREE.Mesh( this.trailGeometry, this.trailMaterial );
	this.parent.group.add( this.mesh );
}

Trail.prototype.makeGeometry = function(){
	var geometry = new THREE.BufferGeometry();

	// positions
	var positions = [];
	for( var i = 0 ; i < this.parent.ringRes * 2 ; i++ ) positions.push( 0, 0, - this.id );
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

	// indices
	var indices = [];
	for( var i = 0 ; i < this.parent.ringRes - 1 ; i++ ) indices.push( i, this.parent.ringRes + i, i + 1, this.parent.ringRes + i, this.parent.ringRes + i + 1, i + 1 );
	indices.push( 0, this.parent.ringRes * 2 - 1, this.parent.ringRes, 0, this.parent.ringRes - 1, this.parent.ringRes * 2 - 1)
	geometry.setIndex( indices );

	return geometry;
}

Trail.prototype.updateGeometry = function( time ){
	this.points = [];
	for( var i = 0 ; i < this.parent.ringRes ; i++ ){
		var vector = new THREE.Vector2( Math.cos( Math.PI * 2 * i / this.parent.ringRes ), Math.sin( Math.PI * 2 * i / this.parent.ringRes ) );

		var dim1 = ( vector.x + this.id / 10 ) / ( 1 / this.intensity );
		var dim2 = ( vector.y + time ) / ( 1 / this.intensity );
		var n = ( this.parent.simplex.noise2D( dim1, dim2 ) + 1 ) / 2 * this.osc;

		var pps = new THREE.Vector2( vector.x * ( 1 - n ), vector.y * ( 1 - n ) ).multiply(this.scale);

		this.trailGeometry.attributes.position.setXY( i, pps.x, pps.y );
		this.trailGeometry.attributes.position.setXY( i + this.parent.ringRes, pps.x + vector.x * this.width, pps.y + vector.y * this.width );
	}
	
	this.trailGeometry.attributes.position.needsUpdate = true;
}

Trail.prototype.step = function( time ){
	// this.trailGeometry.step( time );
	this.updateGeometry( time );
	
	this.trailMaterial.color.setHex(this.color)
	this.trailMaterial.opacity = this.opacity;

	this.position = this.parent.rings[0].position;
	this.mesh.rotation.z = this.theta * Math.PI * 2;

}

module.exports = Trail;