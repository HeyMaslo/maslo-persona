// Global libraries
window.THREE = require('three');
var Spring = require('spring');
var remap = require('remap');
var Gsap = require('gsap');

// Custom modules
var Debug = require('./debug');
var Persona = require('./persona');
var CircleController = require('./circleController');
var LineController = require('./lineController');

var Main = function() {
	window.main = this;
	this.element = document.getElementById('main');
	this.debugBut = document.getElementById('debugBut');
	this.debugEl = document.getElementById('debug');
	this.listeningBut = document.getElementById('listeningBut');

	this.mouseIsDown = false;
	this.startAngle = 0;
	this.angleSpeed = 0;
	this.debugActive = false;

	window.addEventListener('resize', this.resize.bind( this ) );
	this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
	this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
	this.element.addEventListener('mousemove', this.onMouseMove.bind(this));

	if( this.debugBut ) this.debugBut.addEventListener('mousedown', this.debugToggle.bind(this));

	this.controls = document.getElementsByClassName('controlBut');
	for( var i = 0 ; i < this.controls.length ; i++ ) if( this.controls[i].getAttribute('id') !== 'listeningBut' ) this.controls[i].addEventListener( 'click', this.controlClicked.bind(this) );
	
	if( this.listeningBut ) this.listeningBut.addEventListener('mousedown', this.questionMouseDown.bind( this ) );
	if( this.listeningBut ) this.listeningBut.addEventListener('mouseup', this.questionMouseUp.bind( this ) );
	if( this.listeningBut ) this.listeningBut.addEventListener('mouseleave', this.questionMouseUp.bind( this ) );

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();

	this.debug = new Debug( this );
	this.persona = new Persona( this );
	this.circleController = new CircleController( this );
	this.lineController = new LineController( this );

	this.persona.emitter.on('stateChange', function (args) {
		for( var i = 0 ; i < this.controls.length ; i++ ){
			this.controls[i].classList.remove('active');
			if( this.controls[i].getAttribute('data-reaction') == args ) this.controls[i].classList.add('active');
		}
	}.bind(this));

	// this.persona.glow = true;


	var geometry = new THREE.PlaneBufferGeometry( 1, 1 );
	
	// flat background
    var fs = 'varying vec2 vUv; void main() { float intensity = smoothstep( 0.0, 0.3, vUv.x * vUv.y ); gl_FragColor = vec4( 0.215686274509804 * (1.0-intensity) + 0.6352941176 * (intensity), 0.733333333333333 * (1.0-intensity) + 0.43921568627451 * (intensity), 1.0 * (1.0-intensity) + 1.0 * (intensity), 1.0 ); }'
    if(window.pageMode) fs = 'varying vec2 vUv; void main() { gl_FragColor = vec4( 0.37, 0.73, 0.98, 1.0 ); }';

    var material = new THREE.ShaderMaterial( {
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
        fragmentShader: fs
	} );
	
	material.transparent = true;
	material.blending = THREE.MultiplyBlending;
	this.plane = new THREE.Mesh( geometry, material );
	this.plane.position.z = -10;
	this.scene.add( this.plane );

	var geometry = new THREE.PlaneBufferGeometry( 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	this.background = new THREE.Mesh( geometry, material );
	this.background.position.z = -100;
	this.scene.add( this.background );

	this.resize();
	this.step();
}

Main.prototype.questionMouseDown = function(e){
	e.preventDefault();
	this.persona.setState( 'listenStart' );
}

Main.prototype.questionMouseUp = function(){
	this.persona.setState( 'listenEnd' );
}

Main.prototype.debugToggle = function(){
	this.debugActive = !this.debugActive;
	if( this.debugActive ) this.debugEl.classList.add('active');
	else this.debugEl.classList.remove('active');

	if( !this.originalMaterials ) this.originalMaterials = [];

	for( var i = 0 ; i < this.persona.group.children.length ; i++ ){
		var ring = this.persona.group.children[i].children[0].children[0];

		if( this.debugActive ) {
			this.originalMaterials[ i ] = ring.material;
			ring.material = new THREE.MeshBasicMaterial( { wireframe : true, color : 0xffffff, opacity : 0.5, transparent : true } )
		} else {
			ring.material = this.originalMaterials[ i ]
		}
	}
}

Main.prototype.changeColor = function( e ){
	this.colorScheme = e.target.getAttribute('color-scheme');
	for( var i = 0 ; i < this.colorButs.length ; i++ ) this.colorButs[i].classList.remove('active')
	e.target.classList.add('active');
}

Main.prototype.onMouseDown = function(e){
	this.mouseIsDown = true;
	this.tapTimeout = setTimeout( function(){ this.persona.setState( 'tap' ) }.bind(this), 100 );
	this.startAngle = Math.atan2( e.clientY - ( this.element.offsetHeight / 2 + this.persona.position.y ), e.clientX -( this.element.offsetWidth / 2 + this.persona.position.x ) )/ (Math.PI * 2);
	this.lastAngle = this.startAngle;
}
Main.prototype.onMouseUp = function(e){
	this.mouseIsDown = false;
	var angle = Math.atan2( e.clientY - ( this.element.offsetHeight / 2 + this.persona.position.y ), e.clientX -( this.element.offsetWidth / 2 + this.persona.position.x ) )/ (Math.PI * 2);
	if( Math.abs( this.angleSpeed ) > 0.01) this.persona.audio.play('swipe');
}

Main.prototype.onMouseMove = function(e){
	if( this.mouseIsDown ) clearInterval( this.tapTimeout );
	var angle = Math.atan2( e.clientY - ( this.element.offsetHeight / 2 + this.persona.position.y ), e.clientX -( this.element.offsetWidth / 2 + this.persona.position.x ) )/ (Math.PI * 2);

	if( this.mouseIsDown ){
		this.angleSpeed += ( Math.min( Math.max( -0.05, this.lastAngle - angle), 0.05) - this.angleSpeed ) * 0.15 ;
		this.persona.rotation += this.angleSpeed;
		this.lastAngle = angle;
	}
}

Main.prototype.controlClicked = function(e){
	this.persona.setState( e.target.getAttribute('data-reaction') );
}

Main.prototype.resize = function( e ) {
	var width = this.element.offsetWidth, height = this.element.offsetHeight;
	this.renderer.setSize( width * 2, height * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + width + 'px; height:' + height + 'px;' );
	var camView = { left :  width / -2, right : width / 2, top : height / 2, bottom : height / -2 };
	for ( var prop in camView) this.camera[ prop ] = camView[ prop ];
	this.background.scale.set( this.element.offsetWidth, this.element.offsetHeight, 1 );
	this.plane.scale.set( this.element.offsetWidth, this.element.offsetHeight, 1 );
	this.camera.position.z = 1000;
	this.camera.updateProjectionMatrix( );
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );

	this.angleSpeed -= this.angleSpeed * 0.05;
	this.persona.rotation += this.angleSpeed;

	this.debug && this.debug.step(time);
	this.persona && this.persona.step(time);
	this.circleController && this.circleController.step(time);
	this.lineController && this.lineController.step(time);
	
	var mood = {};
	for ( var val in this.circleController.vals ) mood[ val ] = this.circleController.vals[ val ] + this.lineController.vals[ val ];

	this.persona.mood = mood;

	this.renderer.render( this.scene, this.camera );
};

new Main();