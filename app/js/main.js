window.THREE = require('three');
window.TweenMax = require('gsap');
window.settings = require('./settings');
window.chroma = require('chroma-js');

var OrbitControls = require('three-orbit-controls')(THREE)

var chroma = require('chroma-js');
var SimplexNoise = require('simplex-noise');

var Ring = require('./ring');

var Audio = require('./audio');

var Main = function() {
	this.selected = 0;
	this.element = document.getElementById('main');
	this.debug1 = document.getElementById('b1');
	this.debug2 = document.getElementById('b2');
	this.debug3 = document.getElementById('b3');
	this.oldSettings = JSON.parse(JSON.stringify(settings));
	this.colorHSL = chroma.hsl(settings.hue, settings.saturation, settings.lightness);

	this.scaleGroup = 300;
	// this.colorHSL = chroma.rgb(32,157,209);
	// console.log(this.colorHSL.hsl())
	
	
	
	// console.log( chroma.hsl(360, 1, 0.5).hex() )

	this.time = 0;

	this.controls = document.getElementsByClassName('controlBut');
	for( var i = 0 ; i < this.controls.length ; i++ ) this.controls[i].addEventListener( 'click', this.controlClicked.bind(this) );

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.element.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();
	this.camera = new THREE.OrthographicCamera();
	this.camControl = new OrbitControls(this.camera);

	this.socket = new WebSocket('ws://localhost:8080');
	this.socket.addEventListener('message', this.message.bind( this ) );
	
	this.simplex = new SimplexNoise( Math.random );

	this.group = new THREE.Object3D();
	this.scene.add(this.group);
	this.group.scale.set( this.scaleGroup, this.scaleGroup, 1 );
	// this.group.rotation.z = 0.5
	// settings.rotation = 0;
	this.rings = [];

	for( var i = 0 ; i < settings.rings ; i++ ) this.rings.push( new Ring( this, i ) );
	this.audio = new Audio();
	setTimeout( this.setState.bind(this,'init'), 200 );
	
	this.computeColors();
	this.resize();
	this.step();

}

Main.prototype.computeColors = function(){
	this.colorHSL = chroma.hsl(settings.hue, settings.saturation, settings.lightness);
	this.rings[0].color = chroma.hsl(0, 0, settings.lightness * 2);
	this.rings[1].color = this.rings[0].color.darken(0.5);
	this.rings[2].color = this.rings[1].color.darken(0.3);
	
	for( var i = 3 ; i < settings.rings ; i++ ) this.rings[i].color = this.colorHSL.darken( i - 3 );
}


Main.prototype.controlClicked = function(e){
	var reaction = e.target.getAttribute('data-reaction');
	this.setState(reaction)
}

Main.prototype.setState = function(state){
	this.state = state;
	if( this[state] ) this[state]()
	for( var i = 0 ; i < this.controls.length ; i++ ){
		this.controls[i].classList.remove('active');
		if( this.controls[i].getAttribute('data-reaction') == state ) this.controls[i].classList.add('active');
	}
}

Main.prototype.init = function(){
	setTimeout( this.setState.bind(this,'idle'), 3300 );
	this.audio.play(1);
	var startScale = 0.8;
	var endScale = 1;
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].gaussIt = 0;
		this.rings[i].weightIn = 0;
		this.rings[i].intensity = 1;
		this.rings[i].osc = 0.05;
		this.rings[i].theta = Math.random();
		this.rings[i].opacity = 0;
		this.state = 'init';

		var startScale =  endScale - (i+2)*0.1;
		TweenMax.fromTo( this.rings[i].mesh.scale , 3.6, { x : startScale, y: startScale }, {  x : endScale- i*0.01 , y: endScale- i*0.01, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2  } );
		TweenMax.fromTo( this.rings[i] , .2, { opacity : 0 }, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		TweenMax.fromTo( this.rings[i] , .2, { shadowSpread : 0 }, { shadowSpread : .01, delay : ( i / this.rings.length ) / 2 } )
		TweenMax.fromTo( this.rings[i] , 4, { theta : this.rings[i].theta }, { theta : this.rings[i].theta + 3 * this.rings[i].seed.x, delay : 2, ease: Power4.easeOut } )
	}
}

Main.prototype.idle = function(){
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.fromTo( this.rings[i] , 1, { gaussIt : this.rings[i].gaussIt }, { gaussIt : 0.17, ease: Power4.easeInOut } )
		TweenMax.fromTo( this.rings[i] , 1, { intensity : this.rings[i].intensity }, { intensity : 1, ease: Power4.easeInOut } )
		TweenMax.fromTo( this.rings[i] , 1, { osc : this.rings[i].osc }, { osc : 0.09, ease: Power4.easeInOut } )
	}
	TweenMax.fromTo( settings , 1, { 
		timeInc : settings.timeInc
	} , { 
		timeInc : 0.005,
		ease : Power4.easeOut  
	} );
}

Main.prototype.joy = function(){
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.fromTo( this.rings[i] , 1, { 
			osc : this.rings[i].osc 
		} , { 
			osc : 0.26,
			ease : Power4.easeOut 
		} );
		this.rings[i].intensity = 0.6
	}
	TweenMax.fromTo( settings , 1, { 
		saturation : settings.saturation,
		timeInc : settings.timeInc
	} , { 
		saturation : 0.73,
		timeInc : 0.035,
		ease : Power4.easeOut
	} );
}

Main.prototype.surprise = function(){

	TweenMax.fromTo( settings , .2, { 
		scale : settings.scale,
	} , { 
		scale : 0.95,
		ease : Power4.easeOut
	} );
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.fromTo( 
			this.rings[i].mesh.scale , 1.6,
			{ x : this.rings[i].mesh.scale.x, y: this.rings[i].mesh.scale.y }, 
			{  x : 1.4 + (-i)*0.03 , y:  1.4 + (-i)*0.03, ease : Elastic.easeOut.config(1.5, 0.5), delay : 0.15 + ( i / this.rings.length ) / 5  } );
	}
	TweenMax.fromTo( settings , .2, { 
		scale : settings.scale,
	} , { 
		scale : 1,
		delay : 0.2,
		ease : Power4.easeOut
	} );
	TweenMax.fromTo( settings , .2, { 
		timeInc : settings.timeInc,
	} , { 
		timeInc : 0.08,
		ease : Power4.easeOut
	} );
}

Main.prototype.upset = function(){
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.fromTo( 
			this.rings[i].mesh.scale , 5,
			{ x : this.rings[i].mesh.scale.x, y: this.rings[i].mesh.scale.y }, 
			{  x : 0.8 + (-i)*0.03 , y:  0.8 + (-i)*0.03, ease : Elastic.easeOut.config(1, 1), delay : 0.15 + ( i / this.rings.length ) / 5  } );

		TweenMax.fromTo( 
			this.rings[i] , 6,
			{ theta : this.rings[i].theta }, 
			{ theta : Math.floor(this.rings[i].theta), ease : Power4.easeOut  } );

	}

	TweenMax.fromTo( settings , 3, { 
		saturation : settings.saturation,
		timeInc : settings.timeInc,
	} , { 
		saturation : 0.2,
		timeInc : 0.001,
		ease : Power4.easeOut
	} );
}

Main.prototype.message = function(e){
	var data = e.data.split(',');
	this.program = data[0];
	this.channel = data[1];
	this.value = data[2];
	// console.log(this.program,this.channel, this.value)

	if( this.program >= 192 && this.program <= 195 ) this.selected = this.channel;
	if( this.program == 176 ){
		if( this.channel == 1 ) this.rings[this.selected].osc = this.value/127;
		if( this.channel == 2 ) this.rings[this.selected].intensity = this.value/127 * 3;
		if( this.channel == 3 ) this.rings[this.selected].shadowSpread = this.value/127/10;
		if( this.channel == 4 ) this.rings[this.selected].mesh.scale.set( this.value/127 * 2, this.value/127 * 2, 1 );
		if( this.channel == 5 ) this.rings[this.selected].gaussIt = this.value/127;
		if( this.channel == 6 ) this.rings[this.selected].weightIn = this.value/127;
		if( this.channel == 7 ) this.rings[this.selected].theta = this.value/127;
		if( this.channel == 8 ) this.rings[this.selected].opacity = this.value/127;
	}

	if( this.program == 177 ){
		if( this.channel == 1 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].osc = this.value/127;
		if( this.channel == 2 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].intensity = this.value/127 * 3;
		if( this.channel == 3 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].shadowSpread = this.value/127/10;
		if( this.channel == 4 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].mesh.scale.set( this.value/127 * 2, this.value/127 * 2, 1 );
		if( this.channel == 5 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].gaussIt = this.value/127;
		if( this.channel == 6 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].weightIn = this.value/127;
		if( this.channel == 7 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].theta = this.value/127;
		if( this.channel == 8 ) for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].opacity = this.value/127;
	}

	if( this.program == 178 ){
		if( this.channel == 1 ) settings.timeInc = this.value/127/4;
		if( this.channel == 2 ) settings.rotation = this.value/127;
		if( this.channel == 3 ) settings.scale = this.value/127;
		if( this.channel == 5 ) settings.hue = Math.round( this.value/127 * 360 );
		if( this.channel == 6 ) settings.saturation = this.value/127;
		if( this.channel == 7 ) settings.lightness = this.value/127;
	}
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
	
	if( this.state == 'idle' ){
		var val = Math.cos( this.time * Math.PI * 2 ) * 0.135;
		settings.saturation = val + 0.865;
	}

	var debugText = 'Global:<br/>';
	debugText += '-----------------<br/>';
	debugText += '--- Rings : ' + settings.rings + '<br/>';
	debugText += '--- Ring res : ' + settings.ringRes + '<br/>';
	debugText += '--- TimeInc : ' + settings.timeInc.toFixed(4) + '<br/>';
	debugText += '--- Rotation : ' + settings.rotation.toFixed(2) + '<br/>';
	debugText += '--- Scale : ' + settings.scale.toFixed(2) + '<br/>';
	debugText += '--- Hue : ' + settings.hue.toFixed(2) + '<br/>';
	debugText += '--- Saturation : ' + settings.saturation.toFixed(2) + '<br/>';
	debugText += '--- Lightness : ' + settings.lightness.toFixed(2) + '<br/>';
	this.debug1.innerHTML = debugText

	var debugText = 'Rings:<br/>';
	debugText += '-----------------<br/>';
	for( var i = 0 ; i < 4 ; i++ ){
		debugText += 'Ring :' + i + '<br/>';
		debugText += '--- Oscillation : ' + this.rings[i].osc.toFixed(2) + '<br/>';
		debugText += '--- Intensity : ' + this.rings[i].intensity.toFixed(2) + '<br/>';
		debugText += '--- Shadow : ' + this.rings[i].shadowSpread.toFixed(2) + '<br/>';
		debugText += '--- Scale x : ' + this.rings[i].mesh.scale.x.toFixed(2) + ' y : ' + this.rings[i].mesh.scale.y.toFixed(2) + '<br/>';
		debugText += '--- GaussIt : ' + this.rings[i].gaussIt.toFixed(2) + '<br/>';
		debugText += '--- WeightIn : ' + this.rings[i].weightIn.toFixed(2) + '<br/>';
		debugText += '--- Theta : ' + this.rings[i].theta.toFixed(2) + '<br/>';
		debugText += '--- Opacity : ' + this.rings[i].opacity.toFixed(2) + '<br/>';
		debugText += '<br/>';
	}
	this.debug2.innerHTML = debugText

	var debugText = '<br/>';
	debugText += '-----------------<br/>';
	for( var i = 4 ; i < this.rings.length ; i++ ){
		debugText += 'Ring : ' + i + '<br/>';
		debugText += '--- Oscillation : ' + this.rings[i].osc.toFixed(2) + '<br/>';
		debugText += '--- Intensity : ' + this.rings[i].intensity.toFixed(2) + '<br/>';
		debugText += '--- Shadow : ' + this.rings[i].shadowSpread.toFixed(2) + '<br/>';
		debugText += '--- Scale x : ' + this.rings[i].mesh.scale.x.toFixed(2) + ' y : ' + this.rings[i].mesh.scale.y.toFixed(2) + '<br/>';
		debugText += '--- GaussIt : ' + this.rings[i].gaussIt.toFixed(2) + '<br/>';
		debugText += '--- WeightIn : ' + this.rings[i].weightIn.toFixed(2) + '<br/>';
		debugText += '--- Theta : ' + this.rings[i].theta.toFixed(2) + '<br/>';
		debugText += '--- Opacity : ' + this.rings[i].opacity.toFixed(2) + '<br/>';
		debugText += '<br/>';
	}
	this.debug3.innerHTML = debugText
	
	this.group.rotation.z = settings.rotation * Math.PI * 2;
	this.group.scale.set( this.scaleGroup * settings.scale, this.scaleGroup * settings.scale, 1 );
	this.time += settings.timeInc;
	
	if( settings.hue !== this.oldSettings.hue || settings.saturation !== this.oldSettings.saturation || settings.lightness !== this.oldSettings.lightness ) this.computeColors();

	this.oldSettings = JSON.parse(JSON.stringify(settings));

	for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].step( this.time );
	
	this.renderer.render( this.scene, this.camera );
};

var main = new Main();