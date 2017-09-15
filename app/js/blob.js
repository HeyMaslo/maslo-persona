var SimplexNoise = require('simplex-noise');

var Blob = function( parent, radius, spread, osc, intensity, colors ){
	this.parent = parent;
	this.osc = osc;
	this.intensity = intensity;
	this.color = colors || [ [ 1, 0, 0, 1 ], [ 1, 0, 0, 0 ] ];
	this.radius = radius || 100;
	this.spread = spread || 100;

	console.log(intensity)
	this.simplex = new SimplexNoise( Math.random );

	this.points = [];
	for( var i = 0 ; i < this.parent.circleRes ; i++ ){
		var px = Math.cos( Math.PI * 2 * i / this.parent.circleRes );
		var py = Math.sin( Math.PI * 2 * i / this.parent.circleRes );
		this.points.push( [ px, py ] );
	}

	var geometry = new THREE.BufferGeometry();
	var ps = [0,0,0];
	var cols = [this.color[0][0], this.color[0][1], this.color[0][2], this.color[0][3]];
	var is = [];
	
	for( var i = 0 ; i < this.parent.circleRes ; i++ ) {
		ps.push( 0, 0, 0, 0, 0, 0 );
		cols.push( this.color[0][0], this.color[0][1], this.color[0][2], this.color[0][3] );
	}

	for( var i = 0 ; i < this.parent.circleRes ; i++ ) {
		cols.push( this.color[1][0], this.color[1][1], this.color[1][2], this.color[1][3] );
	}

	for( var i = 0 ; i < this.parent.circleRes ; i++ ) is.push( 0, i, i+1 );
	is.push( 0, this.parent.circleRes, 1 );

	for( var i = 0 ; i < this.parent.circleRes - 1 ; i++ ) is.push( i + this.parent.circleRes + 1, i + this.parent.circleRes + 2, i + 1, i + this.parent.circleRes + 2, i + 2, i + 1 );
	is.push( this.parent.circleRes, this.parent.circleRes + 1,  1, this.parent.circleRes, this.parent.circleRes * 2,  this.parent.circleRes + 1 );
	
	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ps ), 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( cols ), 4 ) );
	geometry.setIndex( is );

	var material = new THREE.ShaderMaterial( {
		transparent : true,
		wireframe : false,
		vertexShader: 'attribute vec4 color;varying vec4 vColor;void main() {vColor = color;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}',
		fragmentShader: 'varying vec4 vColor;void main() {gl_FragColor = vColor;}'
	} );

	this.mesh = new THREE.Mesh( geometry, material );
	this.parent.blobScene.add( this.mesh );

	var ps = Math.round( this.parent.circleRes * this.amp );
}

Blob.prototype.step = function( time ){

	this.pps = [];
	this.pps2 = [];

	for( var i = 0 ; i < this.parent.circleRes ; i++ ){
		var dim1 = ( this.points[i][0] ) / ( 1 / this.intensity );
		var dim2 = ( this.points[i][1] + time ) / ( 1 / this.intensity );
		var n = ( ( this.simplex.noise2D( dim1, dim2 ) ) + 1 ) / 2 * this.osc;

		this.pps.push([ Math.cos( Math.PI * 2 * i / this.points.length ) * ( this.radius - n * this.intensity * this.radius ), Math.sin( Math.PI * 2 * i / this.points.length ) * ( this.radius - n * this.intensity * this.radius )  ]);
		this.mesh.geometry.attributes.position.setXYZ( ( i + 1 ), this.pps[i][0], this.pps[i][1], 0 );

		this.pps2.push([
			Math.cos( Math.PI * 2 * i / this.points.length ) * ( this.radius + this.spread - n * this.intensity * this.radius ),
			Math.sin( Math.PI * 2 * i / this.points.length ) * ( this.radius + this.spread - n * this.intensity * this.radius ) 
		]);

		this.mesh.geometry.attributes.position.setXYZ( ( i + 1 + this.parent.circleRes ), this.pps2[i][0], this.pps2[i][1], 0 );
	}
	this.mesh.geometry.attributes.position.needsUpdate = true;
}

module.exports = Blob;