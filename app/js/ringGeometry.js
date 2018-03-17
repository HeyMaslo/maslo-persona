var RingGeometry = function( parent ){
	this.parent = parent;
	this.geoData = new THREE.BufferGeometry();
	
	this.gauss = [];

	// positions
	var positions = [];
	for( var i = 0 ; i < this.parent.parent.ringRes * 3 + 1 ; i++ ) positions.push( 0, 0, this.parent.id * 10 );
	this.geoData.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

	// indices
	var indices = [];
	for( var i = 0 ; i < this.parent.parent.ringRes ; i++ ) indices.push( 0, i, i+1 );
	for( var i = 0 ; i < this.parent.parent.ringRes - 1; i++ ) indices.push( this.parent.parent.ringRes + 1 + i, this.parent.parent.ringRes * 2 + 1 + i, this.parent.parent.ringRes + 2 + i, this.parent.parent.ringRes + 2 + i, this.parent.parent.ringRes * 2 + 1 + i, this.parent.parent.ringRes * 2 + 2 + i );
	indices.push( 0, this.parent.parent.ringRes, 1, this.parent.parent.ringRes * 2, this.parent.parent.ringRes * 3, this.parent.parent.ringRes + 1, this.parent.parent.ringRes  + 1, this.parent.parent.ringRes * 3, this.parent.parent.ringRes * 2+ 1 );
	this.geoData.setIndex( indices );

	// color
	var colors = [];
	for( var i = 0 ; i < this.parent.parent.ringRes + 1 ; i++ ) colors.push( 0, 0, 0, 1 );
	for( var i = this.parent.parent.ringRes + 1 ; i < this.parent.parent.ringRes * 2 + 1 ; i++ ) colors.push( this.parent.shadowColor, this.parent.shadowColor, this.parent.shadowColor, this.parent.shadowIntensity );
	for( var i = this.parent.parent.ringRes * 2 + 1 ; i < this.parent.parent.ringRes * 3 + 1 ; i++ ) colors.push( this.parent.shadowColor, this.parent.shadowColor, this.parent.shadowColor, 0 );
	this.geoData.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 4 ) );

	// uvs
	var uv = [];
	for( var i = 0 ; i < this.parent.parent.ringRes * 3 + 1 ; i++ ) uv.push( 0, 0 );
	this.geoData.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uv ), 2 ) );

	// matID
	var matId = [];
	for( var i = 0 ; i < this.parent.parent.ringRes + 1 ; i++ ) matId.push( 0 );
	for( var i = this.parent.parent.ringRes + 1 ; i < this.parent.parent.ringRes * 3 + 1 ; i++ ) matId.push( 1 );
	this.geoData.addAttribute( 'mat', new THREE.BufferAttribute( new Float32Array( matId ), 1 ) );

	this.setGauss()
}

RingGeometry.prototype.setGauss = function(){
	var points = Math.round( this.parent.parent.ringRes * this.parent.gaussAmplitude );
	var minDiv = 0.1;
	for( var i = 0 ; i <= points ; i++ ) this.gauss[i] = ( Math.sin( 2 * Math.PI * ( ( i / points ) - 0.25 ) ) + 1 ) / 2 + minDiv;
	for( var i = 0 ; i < Math.round( this.parent.parent.ringRes - points ) / 2 ; i++ ) this.gauss.unshift( minDiv );
	for( var i = this.gauss.length ; i < this.parent.parent.ringRes ; i++ ) this.gauss.push( minDiv );
}

RingGeometry.prototype.step = function( time ){

	this.points = [];
	if( this.parent.id > 0 ) this.oldPoints = this.parent.parent.rings[ this.parent.id - 1 ].ringGeometry.points;

	var colGL = this.parent.color.gl();
	var colGLDark = this.parent.color.darken(0.5).gl();

	this.geoData.attributes.color.setXYZ( 0, colGLDark[0], colGLDark[1], colGLDark[2] );

	for( var i = 0 ; i < this.parent.parent.ringRes ; i++ ){
		var vector = new THREE.Vector2( Math.cos( Math.PI * 2 * i / this.parent.parent.ringRes ), Math.sin( Math.PI * 2 * i / this.parent.parent.ringRes ) );

		var dim1 = ( vector.x + this.parent.id / 10 ) / ( 1 / this.parent.intensity );
		var dim2 = ( vector.y + time ) / ( 1 / this.parent.frequency );

		var dim3 = time;

		var n = ( this.parent.parent.simplex.noise2D( dim1, dim2 ) + 1 ) / 2 * this.parent.osc;
		
		// gaussian
		n *= 1 - ( (1-this.gauss[i]) * this.parent.gaussIt );

		// sinusoidal
		// n *= ( 1 + Math.sin( Math.PI * 2 * i / this.parent.parent.ringRes ) ) / 2 * 0.3;

		var pps = new THREE.Vector2( vector.x * ( 1 - n ), vector.y * ( 1 - n ) );

		// get previous position
		if( this.parent.id == 0 ) this.points.push(pps);
		else this.points.push( this.oldPoints[i].sub( vector.clone().multiplyScalar(n) ) );
		
		// cummulative noise2D
		this.points[i] = pps.clone().add( this.points[i].clone().sub( pps.clone() ).multiplyScalar(this.parent.weightIn) );

		this.geoData.attributes.color.setXYZ( ( i + 1 ), colGL[0], colGL[1], colGL[2] );

		this.geoData.attributes.uv.setXY( ( i + 1 ), this.points[i].x, this.points[i].y );
		this.geoData.attributes.uv.setXY( ( this.parent.parent.ringRes + i + 1 ), this.points[i].x, this.points[i].y );
		this.geoData.attributes.uv.setXY( ( this.parent.parent.ringRes * 2 + i + 1 ), this.points[i].x + vector.x * 0.1, this.points[i].y + vector.y * 0.1 );

		this.geoData.attributes.position.setXY( ( i + 1 ), this.points[i].x, this.points[i].y );
		this.geoData.attributes.position.setXY( ( this.parent.parent.ringRes + i + 1 ), this.points[i].x, this.points[i].y );
		this.geoData.attributes.position.setXY( ( this.parent.parent.ringRes * 2 + i + 1 ), this.points[i].x + vector.x * this.parent.shadowSpread, this.points[i].y + vector.y * this.parent.shadowSpread );
	}

	for( var i = this.parent.parent.ringRes + 1 ; i < this.parent.parent.ringRes * 2 + 1 ; i++ ){
		this.geoData.attributes.color.setXYZW( i, this.parent.shadowColor, this.parent.shadowColor, this.parent.shadowColor, this.parent.shadowIntensity );	
	} 
	for( var i = this.parent.parent.ringRes * 2 + 1 ; i < this.parent.parent.ringRes * 3 + 1 ; i++ ){
		this.geoData.attributes.color.setXYZW( i, this.parent.shadowColor, this.parent.shadowColor, this.parent.shadowColor, 0 );
	}
	
	this.geoData.attributes.color.needsUpdate = true;
	this.geoData.attributes.position.needsUpdate = true;
}

module.exports = RingGeometry;