var States = function(){}

States.prototype.reset = function(){
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].osc = 0.05;
		this.rings[i].intensity = 1;
		this.rings[i].gaussIt = 0;
		this.rings[i].weightIn = 0;
		this.rings[i].shadowSpread = 0.01;
		this.rings[i].shadowIntensity = 0.15;
		this.rings[i].theta = Math.random();
		this.rings[i].gaussAmplitude = 0.3;
		this.rings[i].opacity = 1;
		this.rings[i].color;
		this.rings[i].scale = new THREE.Vector3(1,1,1);
		this.rings[i].position = new THREE.Vector3(0,0,0);

		this.position = new THREE.Vector3(0,0,0);
		this.rotation = 0;
		this.scale = new THREE.Vector3(1,1,1);
		this.hsl = new THREE.Vector3(198,0.73,0.47);
		this.timeInc = 0.005;
	}
}

States.prototype.init = function(){
	this.reset();
	// setTimeout( this.parent.setState('idle'), 3300 );
	this.audio.play('open');
	var endScale = 1;
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].theta = 3 * this.rings[i].seed.z;
		var startScale =  endScale - (i+2)*0.1;
		TweenMax.fromTo( this.rings[i].scale , 2.6, { x : startScale, y: startScale }, {  x : endScale- i*0.01 , y: endScale- i*0.01, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2  } );
		TweenMax.fromTo( this.rings[i] , .2, { opacity : 0 }, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		TweenMax.fromTo( this.rings[i] , 3, { theta : this.rings[i].theta }, { theta : Math.random(), delay : 1, ease: Power4.easeOut } )
	}
}

	

States.prototype.idle = function(){
	this.reset();
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].scale = new THREE.Vector3(1,1,1);
		this.rings[i].theta = 0 + i * 0.01;
		this.rings[i].gaussIt = 0.98;
		this.rings[i].weightIn = 1;
		this.rings[i].intensity = 0.21;
		this.rings[i].osc = 0.06;
	}
	this.timeInc = 0.01;
}

States.prototype.joy = function(){
	this.reset();
	this.audio.play('joy');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].osc = 0.26
		this.rings[i].intensity = 0.6
	}
	this.saturation = 1;
	this.timeInc = 0.035;
}

States.prototype.surprise = function(){
	this.reset();
	this.audio.play('surprise');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.fromTo( this.rings[i].scale , 1, { x : this.rings[i].scale.x, y: this.rings[i].scale.y }, {  x : 1.4 + (-i)*0.03 , y: 1.4 + (-i)*0.03, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2  } );
	}
	this.timeInc = 0.08;
	TweenMax.to( this, 0.6, { timeInc : 0.005, delay : 2 } )
}

States.prototype.upset = function(){
	this.reset();
	this.audio.play('upset2');

	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.fromTo( this.rings[i].scale , 3, { x : this.rings[i].scale.x, y: this.rings[i].scale.y }, {  x : 0.8 + (-i)*0.03 , y: 0.8 + (-i)*0.03, ease : Elastic.easeOut.config(1, 0.3), delay : (1-( i / this.rings.length )) / 2  } );
		TweenMax.fromTo( this.rings[i] , 3, { theta : this.rings[i].theta }, {  theta : 0, ease : Elastic.easeOut.config(1, 0.3)  } );

	}
	

	TweenMax.to( this.hsl , 1, { y : 0.2, ease : Power3.easeOut  } );
	TweenMax.to( this , 1, { timeInc : 0.002, ease : Power3.easeOut  } );
	
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

States.prototype.pinchIn = function(){
	this.reset();
	this.audio.play('pinch');
	var time = 2.7
	TweenMax.to( this , time, { timeInc : 0.05, ease : Power3.easeOut  } );
	TweenMax.to( this.scale , time, { x : 1.2, y : 1.2, ease : Power3.easeOut  } );

	TweenMax.to( this.scale , 1.2, { x : 1, y : 1, ease : Elastic.easeOut.config(1, 0.3), delay : time  } );
	TweenMax.to( this , 0.6, { timeInc : 0.005, ease : Power3.easeOut, delay : time  } );

	for( var i = 0 ; i < this.rings.length ; i++ ){
		TweenMax.to( this.rings[i] , time, { osc : 0.09, ease : Power3.easeOut  } );
		TweenMax.to( this.rings[i] , time, { intensity : 3, ease : Power3.easeOut  } );

		TweenMax.to( this.rings[i] , 0.2, { intensity : 1, ease : Power3.easeOut, delay : time  } );
		TweenMax.to( this.rings[i] , 0.2, { osc : 0.05, ease : Power3.easeOut, delay : time  } );
	}
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
	this.reset();
	this.audio.play('hey');
	
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].theta = Math.random();
		this.rings[i].osc = 0.34;
		this.rings[i].intensity = 0.45;
		this.rings[i].gaussIt = 0.83;
		this.rings[i].weightIn = 0.03;
		// TweenMax.to( this.rings[i] , 2, { intensity : 0.2, ease : Power3.easeOut, delay : 1  } );
	}
	TweenMax.to( this , 1, { timeInc : 0.1, ease : Power3.easeOut  } );
	TweenMax.to( this , 1, { timeInc : 0.002, ease : Power3.easeOut, delay : 1  } );
}

module.exports = States;