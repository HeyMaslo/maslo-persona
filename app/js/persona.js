// var settings = require('./settings');
var SimplexNoise = require('simplex-noise');
var Ring = require('./ring');
var Trail = require('./trail');
var Audio = require('./audio');
var States = require('./states');

var Persona = function( parent, settings ){
	this.parent = parent;
	this.settings = settings || {};

	this.ringCount = this.settings.ringCount || 8;
	this.trailsCount = this.settings.trailsCount || 8;
	this.ringRes = this.settings.ringRes || 256;
	this.position = this.settings.position || new THREE.Vector3(0,0,0);
	this.rotation = this.settings.rotation || 0;
	this.scale = this.settings.scale || new THREE.Vector3(1,1,1);
	this.hsl = this.settings.hsl || new THREE.Vector3(198,0.73,0.47);
	this.timeInc = this.settings.timeInc || 0.005;
	this.radius = this.settings.radius || 300;

	this.time = 0;
	this.simplex = new SimplexNoise( Math.random );
	
	this.audio = new Audio();

	this.group = new THREE.Object3D();
	this.parent.scene.add(this.group);
	this.group.scale.set( this.radius, this.radius, 1 );
	
	this.rings = [];
	for( var i = 0 ; i < this.ringCount ; i++ ) this.rings.push( new Ring( this, i ) );
	
	
	this.trails = [];
	for( var i = 0 ; i < this.trailsCount ; i++ ) this.trails.push( new Trail( this, i ) );

	this.computeColors();
}

Persona.prototype = States.prototype;


Persona.prototype.computeColors = function(){
	this.colorHSL = chroma.hsl(this.hsl.x, this.hsl.y, this.hsl.z);
	this.rings[0].color = chroma.hsl(0, 0, this.hsl.z * 2);
	this.rings[1].color = this.rings[0].color.darken(0.5);
	this.rings[2].color = this.rings[1].color.darken(0.3);
	
	for( var i = 3 ; i < this.ringCount ; i++ ) this.rings[i].color = this.colorHSL.darken( i - 3.5 );
}

Persona.prototype.step = function( time ){
	// if( this.state == 'idle' ){
	// 	var val = Math.cos( this.time * Math.PI * 2 ) * 0.135;
	// 	this.saturation = val + 0.865;
	// }
	// for( var i = 1 ; i < this.ringCount ; i++ ) this.rings[i].opacity = 0;


	this.group.rotation.z = this.rotation * Math.PI * 2;
	this.group.scale.set( this.radius * this.scale.x, this.radius * this.scale.y, 1 );
	this.time += this.timeInc;

	this.computeColors();
	for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].step( this.time );
	for( var i = 0 ; i < this.trails.length ; i++ ) this.trails[i].step( this.time );
}

module.exports = Persona;