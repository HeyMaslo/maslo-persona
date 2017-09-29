// Global libraries
window.THREE = require('three');
var Spring = require('spring');
var remap = require('remap');
var Gsap = require('gsap');

// Custom modules
// var Debug = require('./debug');
var Persona = require('./persona');

var Main = function() {
	this.element = document.getElementById('main');

	this.mouseIsDown = false;
	this.startAngle = 0;
	this.angleSpeed = 0;
	this.pinching = false;

	this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
	this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
	this.element.addEventListener('mousemove', this.onMouseMove.bind(this));

	this.controls = document.getElementsByClassName('controlBut');
	for( var i = 0 ; i < this.controls.length ; i++ ) this.controls[i].addEventListener( 'click', this.controlClicked.bind(this) );

	this.colorButs = document.getElementsByClassName('colorBut');
	for( var i = 0 ; i < this.colorButs.length ; i++ ) this.colorButs[i].addEventListener( 'click', this.changeColor.bind(this) );	

	this.slider = document.getElementById('slider');

	this.slider.addEventListener('input', this.onSLiderInput.bind(this) );
	this.slider.addEventListener('change', this.onSLiderChange.bind(this) );

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();

	// this.debug = new Debug( this );
	this.persona = new Persona( this );

	this.persona.emitter.on('stateChange', function (args) {
		for( var i = 0 ; i < this.controls.length ; i++ ){
			this.controls[i].classList.remove('active');
			if( this.controls[i].getAttribute('data-reaction') == args ) this.controls[i].classList.add('active');
		}
	}.bind(this));
	
	this.resize();
	this.step();
}

Main.prototype.changeColor = function( e ){
	this.colorScheme = e.target.getAttribute('color-scheme');
	for( var i = 0 ; i < this.colorButs.length ; i++ ) this.colorButs[i].classList.remove('active')
	e.target.classList.add('active');
}

Main.prototype.onSLiderInput = function(e){
	this.pinching = true;
	if( this.pinchBackAnimation) this.pinchBackAnimation.kill();
}

Main.prototype.onSLiderChange = function(e){
	this.pinching = false;
	this.persona.audio.play('pinch');
	
	this.pinchBackAnimation = Gsap.TweenMax.to( this.persona.scale , 1.9, {  x : 1 , y: 1, ease : Elastic.easeOut.config(1, 0.4) } );
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
	this.camera.position.z = 1000;
	this.camera.updateProjectionMatrix( );
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );

	this.angleSpeed -= this.angleSpeed * 0.05;
	this.persona.rotation += this.angleSpeed;

	if( this.pinching ) this.persona.scale.x = this.persona.scale.y += (parseFloat(this.slider.value) - this.persona.scale.y)*0.3;
	else this.slider.value = this.persona.scale.x;

	// this.debug && this.debug.step(time);
	this.persona && this.persona.step(time);

	this.renderer.render( this.scene, this.camera );
};

new Main();