var RingGeometry = function( parent ){
	this.parent = parent;
	this.geoData = new THREE.BufferGeometry();
	
	this.gauss = [];

	// positions
	var positions = [];
	for( var i = 0 ; i < settings.circleRes * 3 + 1 ; i++ ) positions.push( 0, 0, this.parent.id );
	this.geoData.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

	// indices
	var indices = [];
	for( var i = 0 ; i < settings.circleRes ; i++ ) indices.push( 0, i, i+1 );
	for( var i = 0 ; i < settings.circleRes - 1; i++ ) indices.push( settings.circleRes + 1 + i, settings.circleRes * 2 + 1 + i, settings.circleRes + 2 + i, settings.circleRes + 2 + i, settings.circleRes * 2 + 1 + i, settings.circleRes * 2 + 2 + i );
	indices.push( 0, settings.circleRes, 1, settings.circleRes * 2, settings.circleRes * 3, settings.circleRes + 1, settings.circleRes  + 1, settings.circleRes * 3, settings.circleRes * 2+ 1 );
	this.geoData.setIndex( indices );

	// color
	var colGL = this.parent.parent.colors[this.parent.id].gl();
	var colors = [];
	for( var i = 0 ; i < settings.circleRes + 1 ; i++ ) colors.push( colGL[0], colGL[1], colGL[2], 1 );
	for( var i = settings.circleRes + 1 ; i < settings.circleRes * 2 + 1 ; i++ ) colors.push( 0, 0, 0, 0.15 );
	for( var i = settings.circleRes * 2 + 1 ; i < settings.circleRes * 3 + 1 ; i++ ) colors.push( 0, 0, 0, 0 );
	this.geoData.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 4 ) );

	this.setGauss()
}

RingGeometry.prototype.setGauss = function(){
	var points = Math.round( settings.circleRes * this.parent.gaussAmplitude );
	var minDiv = 0.1;
	for( var i = 0 ; i <= points ; i++ ) this.gauss[i] = ( Math.sin( 2 * Math.PI * ( ( i / points ) - 0.25 ) ) + 1 ) / 2 + minDiv;
	for( var i = 0 ; i < Math.round( settings.circleRes - points ) / 2 ; i++ ) this.gauss.unshift( minDiv );
	for( var i = this.gauss.length ; i < settings.circleRes ; i++ ) this.gauss.push( minDiv );
}

RingGeometry.prototype.step = function( time ){

	this.points = [];
	if( this.parent.id > 0 ) this.oldPoints = this.parent.parent.rings[ this.parent.id - 1 ].ringGeometry.points;

	for( var i = 0 ; i < settings.circleRes ; i++ ){
		var vector = new THREE.Vector2( Math.cos( Math.PI * 2 * i / settings.circleRes ), Math.sin( Math.PI * 2 * i / settings.circleRes ) );

		var dim1 = ( vector.x + this.parent.id / 10 ) / ( 1 / this.parent.intensity );
		var dim2 = ( vector.y + time ) / ( 1 / this.parent.intensity );
		var n = ( this.parent.parent.simplex.noise2D( dim1, dim2 ) + 1 ) / 2 * this.parent.osc;
		
		// gaussian
		n *= 1 - ( (1-this.gauss[i]) * this.parent.gaussIt );

		var pps = new THREE.Vector2( vector.x * ( 1 - n ), vector.y * ( 1 - n ) );

		// get previous position
		if( this.parent.id == 0 ) this.points.push(pps);
		else this.points.push( this.oldPoints[i].sub( vector.clone().multiplyScalar(n) ) );

		// cummulative noise
		this.points[i] = pps.clone().add( this.points[i].clone().sub( pps.clone() ).multiplyScalar(this.parent.weightIn) );

		this.geoData.attributes.position.setXY( ( i + 1 ), this.points[i].x, this.points[i].y );
		this.geoData.attributes.position.setXY( ( settings.circleRes + i + 1 ), this.points[i].x, this.points[i].y );
		this.geoData.attributes.position.setXY( ( settings.circleRes * 2 + i + 1 ), this.points[i].x + vector.x * this.parent.shadowSpread, this.points[i].y + vector.y * this.parent.shadowSpread );
	}

	this.geoData.attributes.position.needsUpdate = true;
}

module.exports = RingGeometry;