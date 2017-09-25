var SimplexNoise = require('simplex-noise');
var chroma = require('chroma-js');

var Ring = require('./ring');
var Audio = require('./audio');
var States = require('./states');
var ee = require('event-emitter');

var Persona = function( parent, settings ){
	this.parent = parent;
	this.settings = settings || {};

	this.emitter = ee();

	this.ringCount = this.settings.ringCount || 8;
	this.ringRes = this.settings.ringRes || 256;
	this.position = this.settings.position || new THREE.Vector3(0,0,0);
	this.rotation = this.settings.rotation || 0;
	this.scale = this.settings.scale || new THREE.Vector3(1,1,1);
	this.hsl = this.settings.hsl || new THREE.Vector3(198,0.73,0.47);
	this.timeInc = this.settings.timeInc || 0.005;
	this.radius = this.settings.radius || 300;

	this.time = 0;
	this.rotationSpeed = 0;
	this.simplex = new SimplexNoise( Math.random );

	this.audio = new Audio();

	this.group = new THREE.Object3D();
	this.parent.scene.add(this.group);
	this.group.scale.set( this.radius, this.radius, 1 );
	
	this.rings = [];
	for( var i = 0 ; i < this.ringCount ; i++ ) this.rings.push( new Ring( this, i ) );

	this.computeColors();

	setTimeout( this.setState.bind(this, 'init'), 1000 );
}

Persona.prototype = States.prototype;

Persona.prototype.setState = function(state){
	if( this.state == state ) return; 
	this.emitter.emit( 'stateChange', state );
	this.state = state;
	if( this[state] ) this[state]()
}

Persona.prototype.computeColors = function(){
	this.colorHSL = chroma.hsl(this.hsl.x, this.hsl.y, this.hsl.z);
	this.rings[0].color = chroma.hsl(0, 0, this.hsl.z * 2);
	this.rings[1].color = this.rings[0].color.darken(0.5);
	this.rings[2].color = this.rings[1].color.darken(0.3);
	
	for( var i = 3 ; i < this.ringCount ; i++ ) this.rings[i].color = this.colorHSL.darken( i - 3.5 );
}

Persona.prototype.step = function( time ){
	this.group.rotation.z = this.rotation * Math.PI * 2;
	this.group.scale.set( this.radius * this.scale.x, this.radius * this.scale.y, 1 );
	this.time += this.timeInc;

	this.computeColors();

	this.updateStates( time );

	for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].step( this.time );
}

module.exports = Persona;