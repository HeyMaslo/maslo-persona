window.THREE = require('three');
window.TweenMax = require('gsap');

var OrbitControls = require('three-orbit-controls')(THREE)

var chroma = require('chroma-js');
var SimplexNoise = require('simplex-noise');

var Ring = require('./ring');
var Shadow = require('./shadow');
var Main = function() {
	this.element = document.getElementById('main');
	this.controls = document.getElementsByClassName('controlBut');
	for( var i = 0 ; i < this.controls.length ; i++ ){
		this.controls[i].addEventListener( 'click', this.controlClicked.bind(this) );
	}

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera( );
	this.controls = new OrbitControls(this.camera);

	// this.socket = new WebSocket('ws://localhost:8080');
	// this.socket.addEventListener('message', this.message.bind( this ) );
	
	this.colors = [ 'rgb(241,230,57)', 'rgb(223,145,29)', 'rgb(181,3,50)', 'rgb(32,157,209)', 'rgb(6,99,135)', 'rgb(31,49,74)', 'rgb(28,28,38)', 'rgb(23,22,26)' ]
	// this.colors = [ 'rgb(147,250,240)', 'rgb(255,243,50)', 'rgb(0,164,2)', 'rgb(154,158,181)', 'rgb(224,224,224)', 'rgb(163,163,163)', 'rgb(125,125,125)', 'rgb(74,74,74)' ]
	this.colors = [ 'rgb(240,240,240)', 'rgb(210,210,210)', 'rgb(190,190,190)', 'rgb(32,157,209)', 'rgb(6,99,135)', 'rgb(31,49,74)', 'rgb(28,28,38)', 'rgb(23,22,26)' ]
	this.time = 0;
	this.timeInc = .005;

	this.circleRes = 256;
	this.pointRes = 4096 * 2;
	this.circleRadius = 200;

	this.simplex = new SimplexNoise( Math.random );

	this.firstRingRadius = 0.3;

	this.group = new THREE.Object3D();
	this.scene.add(this.group);
	this.group.scale.set(600,600,1);
	this.group.rotation.z = -Math.PI / 2
	this.radius = 0.5;
	this.rings = [];

	for( var i = 0 ; i < 8 ; i++ ) this.rings.push( new Ring( this, i, this.colors[i] ) );
	
	setTimeout( this.init.bind(this), 200 );
	

	this.resize();
	this.step();

	console.log(this.group)
}


Main.prototype.controlClicked = function(e){
	var reaction = e.target.getAttribute('data-reaction');
	if( this[reaction] ) this[reaction]();
}

Main.prototype.init = function(){
	console.log('init');
	setTimeout( this.idle.bind(this), 4000 );
	var startScale = 0.8;
	var endScale = 1;
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].gaussIt = 0;
		this.rings[i].weightIn = 0;
		this.rings[i].intensity = 1;
		this.rings[i].osc = 0.05;
		this.rings[i].theta = Math.random();
		
		this.rings[i].thetaIncrease = (-50 + Math.random() * 100) / 10000;
		this.rings[i].mesh.material.opacity = 1;

		this.state = 'init';

		TweenMax.fromTo( this.rings[i].mesh.scale , 3, { 
			x : endScale - i*0.1, y: endScale- i*0.1
		}, { 
			x : endScale- i*0.01 , y: endScale- i*0.01, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2 
		} );

		TweenMax.fromTo( this.rings[i].mesh.material , .6, { opacity : 0 }, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		
	}
}

Main.prototype.idle = function(){
	console.log('idle');
	this.state = 'idle';
	
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].theta = 0;
		this.rings[i].intensity = i / 10;
		this.rings[i].osc = i / 100;
		this.rings[i].mesh.material.color = new THREE.Color( this.rings[i].color );
		TweenMax.to( this.rings[i] , 0.7, { amp : 0.3, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i].mesh.scale , 1, { x : 1, y : 1, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { gaussIt : 1, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { weightIn : 1, ease : Power4.easeOut } );
		
	}
	TweenMax.to( this , 1, { timeInc :  0.005, ease : Power4.easeOut } );
}

Main.prototype.joy = function(){
	console.log('joy');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.to( this.rings[i] , 2, { gaussIt : 0, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { weightIn : 0, ease : Power4.easeOut } );
	}
}


Main.prototype.hey = function(){
	console.log('hey')
	setTimeout( this.idle.bind(this), 4000 );
	TweenMax.to( this , 0.7, { timeInc :  0.06, ease : Power4.easeOut } );
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.to( this.rings[i] , 0.7, { amp : 0.4, ease : Power4.easeOut } );
		this.rings[i].intensity = (this.rings.length-i) / 30;
		this.rings[i].osc = 0.06;
	}

}

Main.prototype.surprise = function(){
	console.log('surprise')
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.to( this.rings[i].mesh.scale , 1, { x : 1.2, y: 1.2, ease : Elastic.easeOut.config(1.2, 0.75), delay : ( i / this.rings.length ) / 5 } );
	}
}

Main.prototype.upset = function(){
	console.log('upset')
	setTimeout( this.idle.bind(this), 4000 );
	TweenMax.to( this , 1, { timeInc :  0.003, ease : Power4.easeOut } );
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.to( this.rings[i].mesh.scale , 1, { x : 0.8 - i*0.01, y: 0.8 - i*0.01, ease : Power4.easeInOut, delay : ( 1 - ( i / this.rings.length ) ) / 5  } );
		
		TweenMax.to( this.rings[i] , 2, { gaussIt : 0, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { weightIn : 0, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { intensity :  i / 10, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { osc :  i / 1000, ease : Power4.easeOut } );
		
		
		this.timeInc = 0.003


		var c = this.rings[i].mesh.material.color;
		var color = chroma.gl(c.r,c.g,c.b);
		// this.rings[i].initColor = color;
		var color2 = color.desaturate(3).gl();
		console.log(color, color2)

		this.rings[i].mesh.material.color = new THREE.Color( color2[0], color2[1], color2[2] );
		// TweenMax.to( this.rings[i].mesh.material.color , 0.5, { x : 0.8, y: 0.8, ease : Back.easeOut.config(1.7), delay : ( 1 - ( i / this.rings.length ) ) / 5  } );

	}
}

Main.prototype.no = function(){
	setTimeout( this.idle.bind(this), 2000 );
	var startScale = 0.8;
	var endScale = 1;
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.to( this.rings[i] , 1, { gaussIt : 0, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { weightIn : 0, ease : Power4.easeOut } );
		TweenMax.to( this.rings[i] , 1, { intensity : 1, osc : 0.1, ease : Power4.easeOut } );
		this.rings[i].theta = Math.random();
		
		this.rings[i].thetaIncrease = (-50 + Math.random() * 100) / 10000;

		this.state = 'no';
		
	}
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
	
	if( this.state == 'init' ){
		for( var i = 0 ; i < this.rings.length ; i++ ){
			this.rings[i].theta += this.rings[i].thetaIncrease;
		}
	} else if( this.state == 'no' ) {
		for( var i = 0 ; i < this.rings.length ; i++ ){
			this.rings[i].theta += this.rings[i].thetaIncrease * 10;
		}
		// for( var i = 0 ; i < this.rings.length ; i++ ){
		// 	this.rings[i].theta -= ( this.rings[i].thetaIncrease ) * 0.03;
		// }
	}

	this.time += this.timeInc;
	

	// this.rings[0].theta += this.timeInc / 10;
	for( var i = 0 ; i < this.rings.length ; i++ ){

		this.rings[i].step( this.time );

	}
	// this.shadow.step(this.time);
	
	this.renderer.render( this.scene, this.camera );
};

window.root = new Main();