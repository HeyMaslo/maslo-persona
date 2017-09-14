window.THREE = require('three');
window.TweenMax = require('gsap');

var vertexShader = require('./../shaders/base.vs');
var fragmentShader = require('./../shaders/base.fs');

var OrbitControls = require('three-orbit-controls')(THREE)

var SimplexNoise = require('simplex-noise');

var Main = function() {
	this.element = document.getElementById('main');

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera( );
	this.controls = new OrbitControls(this.camera);


	this.time = 0;
	this.timeInc = .005;

	this.circleRes = 128;
	this.pointRes = 4096 * 2;
	this.circleRadius = 200;

	this.simplex = new SimplexNoise( Math.random );

	this.firstRingRadius = 0.3;


	this.radius = [ 0.1, 0.26, 0.3 ]


	var size = 1000;
	var divisions = 10;

	var gridHelper = new THREE.GridHelper( size, divisions );
	gridHelper.rotation.x = Math.PI / 2
	this.scene.add( gridHelper );

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
};

window.root = new Main();