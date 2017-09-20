var TrailGeometry = function( parent ){
	this.parent = parent;
	this.geoData = new THREE.BufferGeometry();

	// positions
	var positions = [];
	for( var i = 0 ; i < this.parent.parent.ringRes * 2 ; i++ ) positions.push( 0, 0, - this.parent.id );
	this.geoData.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

	// indices
	var indices = [];
	for( var i = 0 ; i < this.parent.parent.ringRes - 1 ; i++ ) indices.push( i, this.parent.parent.ringRes + i, i + 1, this.parent.parent.ringRes + i, this.parent.parent.ringRes + i + 1, i + 1 );
	indices.push( 0, this.parent.parent.ringRes * 2 - 1, this.parent.parent.ringRes, 0, this.parent.parent.ringRes - 1, this.parent.parent.ringRes * 2 - 1)
	this.geoData.setIndex( indices );
}

TrailGeometry.prototype.step = function( time ){
	// this.points = this.parent.parent.rings[ 0 ].ringGeometry.points;
	this.points = [];
	for( var i = 0 ; i < this.parent.parent.ringRes ; i++ ){
		var vector = new THREE.Vector2( Math.cos( Math.PI * 2 * i / this.parent.parent.ringRes ), Math.sin( Math.PI * 2 * i / this.parent.parent.ringRes ) );

		var dim1 = ( vector.x + this.parent.id / 10 ) / ( 1 / this.parent.intensity );
		var dim2 = ( vector.y + time ) / ( 1 / this.parent.intensity );
		var n = ( this.parent.parent.simplex.noise2D( dim1, dim2 ) + 1 ) / 2 * this.parent.osc;

		var pps = new THREE.Vector2( vector.x * ( 1 - n ), vector.y * ( 1 - n ) ).multiply(this.parent.scale);

		// this.points[i].multiply(this.parent.parent.rings[ 0 ].scale)
		


		this.geoData.attributes.position.setXY( i, pps.x, pps.y );
		this.geoData.attributes.position.setXY( i + this.parent.parent.ringRes, pps.x + vector.x * this.parent.width, pps.y + vector.y * this.parent.width );
	}
	
	this.geoData.attributes.position.needsUpdate = true;
}

module.exports = TrailGeometry;