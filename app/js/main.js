window.THREE = require('three');
window.TweenMax = require('gsap');
window.settings = require('./settings');
window.chroma = require('chroma-js');

var OrbitControls = require('three-orbit-controls')(THREE)

var chroma = require('chroma-js');
var SimplexNoise = require('simplex-noise');

var Ring = require('./ring');


var Main = function() {

	this.element = document.getElementById('main');
	
	this.colorHSL = chroma.hsl(198, 0.73, 0.47);
	// this.colorHSL = chroma.rgb(32,157,209);
	// console.log(this.colorHSL.hsl())
	
	this.computeColors();
	
	// console.log( chroma.hsl(360, 1, 0.5).hex() )

	this.time = 0;

	// this.controls = document.getElementsByClassName('controlBut');
	// for( var i = 0 ; i < this.controls.length ; i++ ){
	// 	this.controls[i].addEventListener( 'click', this.controlClicked.bind(this) );
	// }

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();
	this.controls = new OrbitControls(this.camera);

	this.socket = new WebSocket('ws://localhost:8080');
	this.socket.addEventListener('message', this.message.bind( this ) );
	
	// this.colors = [ 'rgb(241,230,57)', 'rgb(223,145,29)', 'rgb(181,3,50)', 'rgb(32,157,209)', 'rgb(6,99,135)', 'rgb(31,49,74)', 'rgb(28,28,38)', 'rgb(23,22,26)' ]
	// this.colors = [ 'rgb(0,0,0)', 'rgb(255,243,50)', 'rgb(0,164,2)', 'rgb(154,158,181)', 'rgb(224,224,224)', 'rgb(163,163,163)', 'rgb(125,125,125)', 'rgb(74,74,74)' ]
	// this.colors = [ 'rgb(240,240,240)', 'rgb(210,210,210)', 'rgb(190,190,190)', 'rgb(32,157,209)', 'rgb(6,99,135)', 'rgb(31,49,74)', 'rgb(28,28,38)', 'rgb(23,22,26)' ]
	
	// this.circleRes = 256;
	
	this.simplex = new SimplexNoise( Math.random );

	this.group = new THREE.Object3D();
	this.scene.add(this.group);
	this.group.scale.set(300,300,1);
	// this.group.rotation.z = -Math.PI / 2
	this.rings = [];

	for( var i = 0 ; i < settings.rings ; i++ ) this.rings.push( new Ring( this, i ) );
	
	// setTimeout( this.init.bind(this), 200 );
	
	
	this.resize();
	this.step();

}

Main.prototype.computeColors = function(){
	this.colors = [ chroma.gl(0.94, 0.94, 0.94), chroma.gl(0.82, 0.82, 0.82), chroma.gl(0.75, 0.75, 0.75) ];
	for( var i = 3 ; i < settings.rings ; i++ ) this.colors[i] = this.colorHSL.darken( i - 3 );
}


// Main.prototype.controlClicked = function(e){
// 	var reaction = e.target.getAttribute('data-reaction');
// 	if( this[reaction] ) this[reaction]();
// }

// Main.prototype.init = function(){
// 	console.log('init');
// 	setTimeout( this.idle.bind(this), 4000 );
// 	var startScale = 0.8;
// 	var endScale = 1;
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		this.rings[i].gaussIt = 0;
// 		this.rings[i].weightIn = 0;
// 		this.rings[i].intensity = 1;
// 		this.rings[i].osc = 0.05;
// 		this.rings[i].theta = Math.random();
		
// 		this.rings[i].thetaIncrease = (-50 + Math.random() * 100) / 10000;
// 		this.rings[i].mesh.material.opacity = 1;

// 		this.state = 'init';

// 		TweenMax.fromTo( this.rings[i].mesh.scale , 3, { 
// 			x : endScale - i*0.1, y: endScale- i*0.1
// 		}, { 
// 			x : endScale- i*0.01 , y: endScale- i*0.01, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2 
// 		} );

// 		TweenMax.fromTo( this.rings[i].mesh.material , .6, { opacity : 0 }, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		
// 	}
// }

// Main.prototype.idle = function(){
// 	console.log('idle');
// 	this.state = 'idle';
	
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		this.rings[i].theta = 0;
// 		this.rings[i].intensity = i / 10;
// 		this.rings[i].osc = i / 100;
// 		this.rings[i].mesh.material.color = new THREE.Color( this.rings[i].color );
// 		TweenMax.to( this.rings[i] , 0.7, { amp : 0.3, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i].mesh.scale , 1, { x : 1, y : 1, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { gaussIt : 1, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { weightIn : 1, ease : Power4.easeOut } );
		
// 	}
// 	TweenMax.to( this , 1, { timeInc :  0.005, ease : Power4.easeOut } );
// }

// Main.prototype.joy = function(){
// 	console.log('joy');
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		TweenMax.to( this.rings[i] , 2, { gaussIt : 0, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { weightIn : 0, ease : Power4.easeOut } );
// 	}
// }


// Main.prototype.hey = function(){
// 	console.log('hey')
// 	setTimeout( this.idle.bind(this), 4000 );
// 	TweenMax.to( this , 0.7, { timeInc :  0.06, ease : Power4.easeOut } );
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		TweenMax.to( this.rings[i] , 0.7, { amp : 0.4, ease : Power4.easeOut } );
// 		this.rings[i].intensity = (this.rings.length-i) / 30;
// 		this.rings[i].osc = 0.06;
// 	}

// }

// Main.prototype.surprise = function(){
// 	console.log('surprise')
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		TweenMax.to( this.rings[i].mesh.scale , 1, { x : 1.2, y: 1.2, ease : Elastic.easeOut.config(1.2, 0.75), delay : ( i / this.rings.length ) / 5 } );
// 	}
// }

// Main.prototype.upset = function(){
// 	console.log('upset')
// 	setTimeout( this.idle.bind(this), 4000 );
// 	TweenMax.to( this , 1, { timeInc :  0.003, ease : Power4.easeOut } );
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		TweenMax.to( this.rings[i].mesh.scale , 1, { x : 0.8 - i*0.01, y: 0.8 - i*0.01, ease : Power4.easeInOut, delay : ( 1 - ( i / this.rings.length ) ) / 5  } );
		
// 		TweenMax.to( this.rings[i] , 2, { gaussIt : 0, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { weightIn : 0, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { intensity :  i / 10, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { osc :  i / 1000, ease : Power4.easeOut } );
		
		
// 		this.timeInc = 0.003


// 		var c = this.rings[i].mesh.material.color;
// 		var color = chroma.gl(c.r,c.g,c.b);
// 		// this.rings[i].initColor = color;
// 		var color2 = color.desaturate(3).gl();
// 		console.log(color, color2)

// 		this.rings[i].mesh.material.color = new THREE.Color( color2[0], color2[1], color2[2] );
// 		// TweenMax.to( this.rings[i].mesh.material.color , 0.5, { x : 0.8, y: 0.8, ease : Back.easeOut.config(1.7), delay : ( 1 - ( i / this.rings.length ) ) / 5  } );

// 	}
// }

// Main.prototype.no = function(){
// 	setTimeout( this.idle.bind(this), 2000 );
// 	var startScale = 0.8;
// 	var endScale = 1;
// 	for( var i = 0 ; i < this.rings.length ; i++ ){
// 		TweenMax.to( this.rings[i] , 1, { gaussIt : 0, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { weightIn : 0, ease : Power4.easeOut } );
// 		TweenMax.to( this.rings[i] , 1, { intensity : 1, osc : 0.1, ease : Power4.easeOut } );
// 		this.rings[i].theta = Math.random();
		
// 		this.rings[i].thetaIncrease = (-50 + Math.random() * 100) / 10000;

// 		this.state = 'no';
		
// 	}
// }

Main.prototype.message = function(e){
	var data = e.data.split(',');
	this.program = data[0];
	this.channel = data[1];
	this.value = data[2];
	console.log(this.program,this.channel, this.value)
}

Main.prototype.resize = function(e) {
	var width = this.element.offsetWidth, height = this.element.offsetHeight;
	this.renderer.setSize( width * 2, height * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + width + 'px; height:' + height + 'px;' );
	var camView = { left :  width / -2, right : width / 2, top : height / 2, bottom : height / -2 };
	for (var prop in camView) this.camera[prop] = camView[prop];
	this.camera.position.z = 1000;
	this.camera.updateProjectionMatrix();
}

Main.prototype.step = function( time ) {
	window.requestAnimationFrame( this.step.bind( this ) );
	
	// if( this.state == 'init' ){
		// for( var i = 0 ; i < this.rings.length ; i++ ){
		// 	this.rings[i].theta += this.rings[i].thetaIncrease;
		// }
	// } else if( this.state == 'no' ) {
		// for( var i = 0 ; i < this.rings.length ; i++ ){
		// 	this.rings[i].theta += this.rings[i].thetaIncrease * 10;
		// }
		// for( var i = 0 ; i < this.rings.length ; i++ ){
		// 	this.rings[i].theta -= ( this.rings[i].thetaIncrease ) * 0.03;
		// }
	// }

	this.time += settings.timeInc;
	

	// this.rings[0].theta += this.timeInc / 10;
	for( var i = 0 ; i < this.rings.length ; i++ ){

		this.rings[i].step( this.time );

	}
	// this.shadow.step(this.time);
	
	this.renderer.render( this.scene, this.camera );
};

var main = new Main();