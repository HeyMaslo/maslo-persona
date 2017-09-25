// Global libraries
window.THREE = require('three');

// Custom modules
// var Debug = require('./debug');
var Persona = require('./persona');

var Main = function() {
	this.element = document.getElementById('main');

	this.controls = document.getElementsByClassName('controlBut');
	for( var i = 0 ; i < this.controls.length ; i++ ) this.controls[i].addEventListener( 'click', this.controlClicked.bind(this) );

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

	// this.debug && this.debug.step(time);
	this.persona && this.persona.step(time);

	this.renderer.render( this.scene, this.camera );
};

new Main();