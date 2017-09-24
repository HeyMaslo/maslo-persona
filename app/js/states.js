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
		this.rings[i].scale = new THREE.Vector3( 1, 1, 1 );
		this.rings[i].position = new THREE.Vector3( 0, 0, 0 );
	}

	this.position = new THREE.Vector3( 0, 0, 0 );
	this.rotation = 0;
	this.scale = new THREE.Vector3( 1, 1, 1 );
	this.hsl = new THREE.Vector3( 198, 0.73, 0.47 );
	this.timeInc = 0.01;
}

States.prototype.init = function(){
	this.reset();
	this.audio.play('open');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].theta = 3 * this.rings[i].seed.z;
		var startScale =  1 - ( i + 2 ) * 0.1;
		Gsap.TweenMax.fromTo( this.rings[i].scale , 2.3, { x : startScale, y: startScale }, {  x : 1 , y: 1, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2  } );
		Gsap.TweenMax.fromTo( this.rings[i] , .2, { opacity : 0 }, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		Gsap.TweenMax.fromTo( this.rings[i] , 2, { theta : this.rings[i].theta }, { theta : i * 0.01, delay : 0.8, ease: Elastic.easeOut.config(1, 0.6) });
		Gsap.TweenMax.fromTo( this.rings[i] , 2, {
			gaussIt : this.rings[i].gaussIt,
			weightIn : this.rings[i].weightIn,
			intensity : this.rings[i].intensity,
			osc : this.rings[i].osc
		}, {
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06, delay : 0.8, ease: Power4.easeOut,
			onComplete : this.setState.bind( this, 'idle' )
		} );
	}
}	

States.prototype.idle = function(){
	
}

States.prototype.joy = function(){
	this.audio.play('joy');
	var expandTimeOn = 1;
	var expandTimeOff = 1;
	var expandSpread = 0.2;
	var expandScale = 0.9;
	var returnDelay = 0.4;

	for( var i = 0 ; i < this.rings.length ; i++ ){
		var ring = this.rings[i];
		var theta = ( Math.sign(this.rings[i].seed.z) > 0 ) ? ( 4 + i * 0.01 ) : ( -4 + i * 0.01 );
		console.log(theta)
		var tl = new TimelineMax();
		tl.fromTo( this.rings[i].position , expandTimeOn, { x : this.rings[i].position.x, y : this.rings[i].position.y }, { x : expandSpread, y : expandSpread, ease : Power2.easeOut } )
		.to( this.rings[i].position , expandTimeOff, { x : 0, y : 0, delay : returnDelay + ( ( this.rings.length - i ) / this.rings.length ) / 2, ease : Power2.easeOut } );

		var tl2 = new TimelineMax();
		tl2.fromTo( this.rings[i].scale , expandTimeOn, { x : this.rings[i].scale.x, y : this.rings[i].scale.y }, { x : expandScale, y : expandScale, ease : Back.easeOut.config(1.7) } )
		.to( this.rings[i].scale , expandTimeOff, { x : 1, y : 1, delay : returnDelay + ( ( this.rings.length - i ) / this.rings.length ) / 2, ease : Back.easeOut.config(1.7) } );

		var tl3 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl3.fromTo( this.rings[i] , 4, {
			theta : this.rings[i].theta,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 2
		}, {
			theta : theta,
			ease: Power4.easeOut,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 2
		} )
		.to( this.rings[i] , 0, {
			theta : i * 0.01
		})

		var tl4 = new TimelineMax();
		tl4.to( this.rings[i] , 1, {
			gaussIt : 0.5,
			weightIn : 0.2,
			intensity : 0.6,
			osc : 0.36,
			ease: Power4.easeOut
		} )
		.to( this.rings[i] , 1.5, {
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06,
			ease: Power4.easeOut
		} )
	}
}

States.prototype.surprise = function(){
	
	this.audio.play('surprise');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl0 = new TimelineMax( { onComplete : function(){ console.log('end');this.setState('idle') }.bind(this) } );
		tl0.to( this.rings[i] , 2, {
			gaussIt : 0,
			weightIn : 0.3,
			osc : 0.2,
			ease: RoughEase.ease.config({ template:  Power0.easeNone, strength: .3, points: 3, taper: "none", randomize:  true, clamp: false})
		} )
		.to( this.rings[i] , 2, {
			gaussIt : 0.98,
			weightIn : 1,
			osc : 0.06,
			ease: Power4.easeOut
		} )

		var tl2 = new TimelineMax();
		tl2.to( this.rings[i].scale , 0.3, { x : 1.1 + (this.rings.length-i)/500, y : 1.1+ (this.rings.length-i)/500, delay : ( ( i ) / this.rings.length ) / 2 / 2, ease : Back.easeOut.config(1.7) } )
		.to( this.rings[i].scale , 0.3, { x : 1, y : 1, delay : 1.6 + ( ( this.rings.length - i ) / this.rings.length ) / 2 / 2, ease : Back.easeOut.config(1.7) } );
	}
	
	var tl1 = new TimelineMax();
	tl1.fromTo( this , 0.3, { timeInc : this.timeInc }, { timeInc : 0.3, ease : Power3.easeOut } )
	.to( this , 0.2, { timeInc : 0.01, delay : 1.65, ease : Power3.easeIn } );
}

States.prototype.upset = function(){
	this.audio.play('upset');
	var timeIn = 1.5;
	var timeOut = 1;
	var delayInOut = 1;

	for( var i = 0 ; i < this.rings.length ; i++ ){

		var tl0 = new TimelineMax();
		tl0.to( this.rings[i].scale , timeIn, {  x : 0.8 + (-i)*0.03 , y: 0.8 + (-i)*0.03, ease : Elastic.easeOut.config(1, 0.3), delay : (1-( i / this.rings.length )) / 2  } )
		.to( this.rings[i].scale , timeOut, { x : 1, y : 1, delay : delayInOut, ease : Power4.easeOut  } )

		var tl1 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl1.to( this.rings[i] , timeIn, {
			gaussIt : 0.2,
			theta : 0,
			ease : Elastic.easeOut.config(1, 0.3)
		} )
		.to( this.rings[i] , timeOut, {
			gaussIt : 0.98,
			theta : i * 0.01,
			delay : delayInOut,
			ease : Elastic.easeOut.config(1, 0.3)
		})
	}
	var tl2 = new TimelineMax();
	tl2.to( this.hsl , timeIn, { y : 0.2, ease : Power3.easeOut  } )
	.to( this.hsl , timeOut, { y : 0.73, delay : delayInOut, ease : Power3.easeOut  } )

	var tl3 = new TimelineMax( { onComplete : function(){ this.rotation = 0 }.bind(this) } );
	tl3.to( this , timeIn, { rotation : 1.5 + Math.random(), ease : Power3.easeOut  } )
	.to( this , timeOut, { rotation : 3, delay: delayInOut, ease : Power3.easeOut  } )

	var tl4 = new TimelineMax();
	tl4.to( this , timeIn, { timeInc : 0.002, ease : Power3.easeOut  } )
	.to( this , timeOut, { timeInc : 0.01, ease : Power3.easeOut  } );
	
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
	Gsap.TweenMax.to( this , time, { timeInc : 0.05, ease : Power3.easeOut  } );
	Gsap.TweenMax.to( this.scale , time, { x : 1.2, y : 1.2, ease : Power3.easeOut  } );

	Gsap.TweenMax.to( this.scale , 1.2, { x : 1, y : 1, ease : Elastic.easeOut.config(1, 0.3), delay : time  } );
	Gsap.TweenMax.to( this , 0.6, { timeInc : 0.005, ease : Power3.easeOut, delay : time  } );

	for( var i = 0 ; i < this.rings.length ; i++ ){
		Gsap.TweenMax.to( this.rings[i] , time, { osc : 0.09, ease : Power3.easeOut  } );
		Gsap.TweenMax.to( this.rings[i] , time, { intensity : 3, ease : Power3.easeOut  } );

		Gsap.TweenMax.to( this.rings[i] , 0.2, { intensity : 1, ease : Power3.easeOut, delay : time  } );
		Gsap.TweenMax.to( this.rings[i] , 0.2, { osc : 0.05, ease : Power3.easeOut, delay : time  } );
	}
	// this.hsl.y = 0.2;
	// this.timeInc = 0.001;
}

States.prototype.pinchOut = function(){
	this.reset();
	this.audio.play('pinch');
	var time = 2.7
	Gsap.TweenMax.to( this , time, { timeInc : 0.05, ease : Power3.easeOut  } );
	Gsap.TweenMax.to( this.scale , time, { x : 0.8, y : 0.8, ease : Power3.easeOut  } );

	Gsap.TweenMax.to( this.scale , 1.2, { x : 1, y : 1, ease : Elastic.easeOut.config(1, 0.3), delay : time  } );
	Gsap.TweenMax.to( this , 0.6, { timeInc : 0.005, ease : Power3.easeOut, delay : time  } );

	for( var i = 0 ; i < this.rings.length ; i++ ){
		Gsap.TweenMax.to( this.rings[i] , time, { osc : 0.09, ease : Power3.easeOut  } );
		Gsap.TweenMax.to( this.rings[i] , time, { intensity : 3, ease : Power3.easeOut  } );

		Gsap.TweenMax.to( this.rings[i] , 0.2, { intensity : 1, ease : Power3.easeOut, delay : time  } );
		Gsap.TweenMax.to( this.rings[i] , 0.2, { osc : 0.05, ease : Power3.easeOut, delay : time  } );
	}
	// this.hsl.y = 0.2;
	// this.timeInc = 0.001;
}

States.prototype.no = function(){
	this.audio.play('no');
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
		// Gsap.TweenMax.to( this.rings[i] , 2, { intensity : 0.2, ease : Power3.easeOut, delay : 1  } );
	}
	Gsap.TweenMax.to( this , 1, { timeInc : 0.1, ease : Power3.easeOut  } );
	Gsap.TweenMax.to( this , 1, { timeInc : 0.002, ease : Power3.easeOut, delay : 1  } );
}

States.prototype.updateStates = function( time ){
	// var n = this.simplex.noise2D( 0.5, time / 10000 );
	// this.rotationSpeed += n /1000000;
	// this.rotation += this.rotationSpeed;
}

module.exports = States;