var States = function(){}

States.prototype.init = function(){
	// setTimeout( this.parent.setState('idle'), 3300 );
	// this.audio.play('open');
	var startScale = 0.8;
	var endScale = 1;
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var startScale =  endScale - (i+2)*0.1;
		TweenMax.fromTo( this.rings[i].scale , 3.6, { x : startScale, y: startScale }, {  x : endScale- i*0.01 , y: endScale- i*0.01, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2  } );
		TweenMax.fromTo( this.rings[i] , .2, { opacity : 0 }, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		TweenMax.fromTo( this.rings[i] , .2, { shadowSpread : 0 }, { shadowSpread : .01, delay : ( i / this.rings.length ) / 2 } )
		TweenMax.fromTo( this.rings[i] , 4, { theta : this.rings[i].theta }, { theta : this.rings[i].theta + 3 * this.rings[i].seed.x, delay : 2, ease: Power4.easeOut } )
	}
}

States.prototype.joy = function(){
	this.audio.play('joy');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].osc = 0.26
		this.rings[i].intensity = 0.6
	}
	this.saturation = 1;
	this.timeInc = 0.035;
}

States.prototype.surprise = function(){
	this.audio.play('surprise');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].scale.x = 1.4 + (-i)*0.03;
		this.rings[i].scale.y = 1.4 + (-i)*0.03;
	}
	this.timeInc = 0.08;
}

States.prototype.upset = function(){
	this.audio.play('upset2');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].scale.x = 0.8 + (-i)*0.03;
		this.rings[i].scale.y = 0.8 + (-i)*0.03;
		this.rings[i].theta = 0;
	}
	this.hsl.y = 0.2;
	this.timeInc = 0.001;
}

States.prototype.yes = function(){
	this.audio.play('yes');
	// for( var i = 0 ; i < this.rings.length ; i++ ){
	// 	this.rings[i].scale.x = 0.8 + (-i)*0.03;
	// 	this.rings[i].scale.y = 0.8 + (-i)*0.03;
	// 	this.rings[i].theta = 0;
	// }
	// this.hsl.y = 0.2;
	// this.timeInc = 0.001;
}

States.prototype.no = function(){
	this.audio.play('no2');
	// for( var i = 0 ; i < this.rings.length ; i++ ){
	// 	this.rings[i].scale.x = 0.8 + (-i)*0.03;
	// 	this.rings[i].scale.y = 0.8 + (-i)*0.03;
	// 	this.rings[i].theta = 0;
	// }
	// this.hsl.y = 0.2;
	// this.timeInc = 0.001;
}

States.prototype.hey = function(){
	this.audio.play('hey');
	// for( var i = 0 ; i < this.rings.length ; i++ ){
	// 	this.rings[i].scale.x = 0.8 + (-i)*0.03;
	// 	this.rings[i].scale.y = 0.8 + (-i)*0.03;
	// 	this.rings[i].theta = 0;
	// }
	// this.hsl.y = 0.2;
	// this.timeInc = 0.001;
}

States.prototype.idle = function(){
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].gaussIt = 0.17;
		this.rings[i].intensity = 1;
		this.rings[i].osc = 0.09;
	}
	this.timeInc = 0.005;
}

module.exports = States;