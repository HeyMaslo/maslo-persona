window.THREE = require('three');
window.TweenMax = require('gsap');

var vertexShader = require('./../shaders/base.vs');
var fragmentShader = require('./../shaders/base.fs');

var triangulate = require('delaunay-triangulate');
var OrbitControls = require('three-orbit-controls')(THREE)

var Main = function() {
	this.element = document.getElementById('main');

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera( );
	this.controls = new OrbitControls(this.camera);

	

	this.time = 0;
	this.timeInc = 0.01;

	this.circleRes = 64;
	this.pointRes = 4096 * 2;
	this.circleRadius = 200;

	this.points = [];
	for( var i = 0 ; i < this.circleRes ; i++ ){
		this.points.push( [ Math.cos( Math.PI * 2 * i / this.circleRes ) * this.circleRadius, Math.sin( Math.PI * 2 * i / this.circleRes ) * this.circleRadius ] );
	}


	while( this.points.length < this.circleRes + this.pointRes ){
		var position = [ Math.random() * this.circleRadius * 2 - this.circleRadius, Math.random() * this.circleRadius * 2 - this.circleRadius ];
		var dist = Math.sqrt( position[0] * position[0] + position[1] * position[1] );
		if( dist < this.circleRadius ) this.points.push( position );
	}

	var triangles = triangulate( this.points );

	var geometry = new THREE.BufferGeometry();
	
	var ps = [];
	var is = [];
	var uvs = [];

	for( var i = 0 ; i < this.points.length ; i++ ){
		ps.push( this.points[i][0], this.points[i][1], 0 );
		uvs.push( ( this.points[i][0] + 200 ) / 400, ( this.points[i][1] + 200 ) / 400 );
	}
	for( var i = 0 ; i < triangles.length ; i++ ){
		is.push( triangles[i][1], triangles[i][0], triangles[i][2] );
	}

	console.log(ps, is)

	geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ps ), 3 ) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
	geometry.setIndex( is )
	

	// var material = new THREE.MeshBasicMaterial({ color : 0xff0000, wireframe : true });
	var textureLoader = new THREE.TextureLoader();

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			height : { value : textureLoader.load('img/height2.png') },
			time : { value : this.time }
		},
		// transparent : true,
		wireframe : true,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	} );

	this.mesh = new THREE.Mesh( geometry, material );
	this.scene.add( this.mesh );

	this.resize();
	this.step();
}

Main.prototype.resize = function(e) {
	this.renderer.setSize( (this.element.offsetWidth) * 2, (this.element.offsetHeight) * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + (this.element.offsetWidth) + 'px; height:' + (this.element.offsetHeight) + 'px;' );
	this.camera.left = (this.element.offsetWidth) / - 2;
	this.camera.right = (this.element.offsetWidth) / 2;
	this.camera.top = (this.element.offsetHeight) / 2;
	this.camera.bottom = (this.element.offsetHeight) / - 2;
	this.camera.position.z = 1000;
	this.camera.updateProjectionMatrix();
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	
	this.time += this.timeInc;
	this.renderer.render( this.scene, this.camera );

	this.mesh.material.uniforms.time.value = this.time;

};

window.root = new Main();