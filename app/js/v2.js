window.THREE = require('three');
window.TweenMax = require('gsap');

var vertexShader = require('./../shaders/base.vs');
var fragmentShader = require('./../shaders/base.fs');

var OrbitControls = require('three-orbit-controls')(THREE)

var SimplexNoise = require('simplex-noise');

var Ring = require('./ring');

var Main = function() {
	this.element = document.getElementById('main');

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera( );
	this.controls = new OrbitControls(this.camera);

	// this.socket = new WebSocket('ws://localhost:8080');
	// this.socket.addEventListener('message', this.message.bind( this ) );
	
	this.colors = [
		'rgb(241,230,57)',
		'rgb(223,145,29)',
		'rgb(181,3,50)',
		'rgb(32,157,209)',
		'rgb(6,99,135)',
		'rgb(31,49,74)',
		'rgb(28,28,38)',
		'rgb(23,22,26)'
	]
	this.time = 0;
	this.timeInc = .005;

	this.circleRes = 256;
	this.pointRes = 4096 * 2;
	this.circleRadius = 200;

	this.simplex = new SimplexNoise( Math.random );

	this.firstRingRadius = 0.3;

	this.rings = [];
	this.rings.push( new Ring( this, 0.5, 0, this.colors[0] ) );
	this.rings[0].intensity = 0.1;
	this.rings[0].osc = 0.05;

	this.rings.push( new Ring( this, 0.49, 1, this.colors[1] ) );
	this.rings[1].intensity = .1;
	this.rings[1].osc = 0.1;


	this.rings.push( new Ring( this, 0.48, 2, this.colors[2] ) );
	this.rings[2].intensity = .2;
	this.rings[2].osc = 0.1;

	this.rings.push( new Ring( this, 0.48, 3, this.colors[3] ) );
	this.rings[3].intensity = .3;
	this.rings[3].osc = 0.1;

	this.rings.push( new Ring( this, 0.46, 4, this.colors[4] ) );
	this.rings[4].intensity = .4;
	this.rings[4].osc = 0.1;

	this.rings.push( new Ring( this, 0.45, 5, this.colors[5] ) );
	this.rings[5].intensity = .5;
	this.rings[5].osc = 0.1;

	this.rings.push( new Ring( this, 0.44, 6, this.colors[6] ) );
	this.rings[6].intensity = .6;
	this.rings[6].osc = 0.1;

	this.rings.push( new Ring( this, 0.43, 7, this.colors[7] ) );
	this.rings[7].intensity = .7;
	this.rings[7].osc = 0.1;

	var size = 1000;
	var divisions = 10;

	var gridHelper = new THREE.GridHelper( size, divisions );
	gridHelper.rotation.x = Math.PI / 2
	this.scene.add( gridHelper );

	this.resize();
	this.step();
}

Main.prototype.message = function(e){
	console.log(e.data)
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
	
	// this.rings[0].theta += this.timeInc / 10;
	for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].step( this.time );
	
	
	this.renderer.render( this.scene, this.camera );
};

window.root = new Main();