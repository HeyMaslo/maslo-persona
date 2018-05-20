var Gsap = require('gsap');

var States = function(){}

States.prototype.init = function(){
	this.audio.play('open');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		this.rings[i].theta = 3 * this.rings[i].seed.z;
		var startScale =  1 - ( i + 2 ) * 0.1;
		Gsap.TweenMax.fromTo( this.rings[i].scale , 2.3, { x : startScale, y: startScale }, {  x : 1 , y: 1, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 2  } );
		Gsap.TweenMax.to( this.rings[i] , .2, { opacity : 1, delay : ( i / this.rings.length ) / 2 } )
		Gsap.TweenMax.to( this.rings[i] , 2, { theta : i * 0.01, delay : 0.8, ease: Elastic.easeOut.config(1, 0.6) });
		Gsap.TweenMax.to( this.rings[i] , 2, {
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06, delay : 0.8, ease: Power4.easeOut,
			onComplete : this.setState.bind( this, 'idle' )
		} );
	}
}	

States.prototype.idle = function( ){
	if(window.pageMode) return;
	var moods = this.mood;

	var globalMods = {};
	var globalModifiers = {
		joy : {
			timeInc : 0.15
		},
		love : {
			timeInc : 0.15,
			modifierTimestep : 0.003
		},
		surprise : {
			timeInc : 0.05
		},
		terror : {
			timeInc : 0.1,
			modifierTimestep : 0.03
		},
		anger : {
			timeInc : 0.3,
			modifierTimestep : 0.05
		},
		sadness : {
			timeStep : -0.004
		},
		sleepy : {
			modifierTimestep : 0.001
		},
		calm : {
			modifierTimestep : 0.001
		}
	}
	for (var mood in moods) {
		if( globalModifiers[ mood ] ){
			for( var modifier in globalModifiers[ mood ] ){
				if( !globalMods[ modifier] ) globalMods[ modifier ] = 0;
				globalMods[ modifier ] += globalModifiers[ mood ][ modifier ] * moods[mood];
			}
		}
	}

	for( var i = 0 ; i < this.rings.length ; i++ ){
		var ringMods = {};

		var n = this.simplex.noise2D( i / 8 * 10, this.modifierTime );
		var n2 = this.simplex.noise2D( this.modifierTime, i / 8 * 10 );

		var ringModifiers = {
			joy : {
				gaussIt : -0.98,
				weightIn : -0.9,
				theta : i / 8,
				intensity : 2,
				osc : 0.04
			},
			love : {
				gaussIt : -0.98,
				weightIn : -0.9,
				theta : i / 8,
				intensity : 1,
				osc : 0.04,
				scaleInc : 0,
				positionX : 0.2 + 0.01 * i * Math.sin( Math.PI * 2 * this.modifierTime ),
				positionY : 0.2 + 0.01 * i * Math.cos( Math.PI * 2 * this.modifierTime )
			},
			surprise : {
				gaussIt : - 0.98,
				weightIn : - 0.3,
				intensity : 2,
				theta : i / 8,
				osc : 0.03,
				scaleInc : 0.15 * ( ( 8 - i ) / 8 )
			},
			terror : {
				gaussIt : - 0.98,
				weightIn : - 0.9,
				rotation : i / 8,
				intensity : 0.8,
				osc : 0.1,
				scaleInc : 0.1 * ( ( 8 - i ) / 16 ),
				positionX : n * 0.1,
				positionY : n2 * 0.1
			},
			anger : {
				gaussIt : - 0.98,
				weightIn : - 0.9,
				intensity : 2,
				theta : i / 8,
				osc : 0.1,
				scaleInc : ( ( i ) / 32 ),
				positionX : n * 0.1 * ( ( 8 - i ) / 4 ),
				positionY : n2 * 0.1 * ( ( 8 - i ) / 4 )
			},
			sadness : {
				gaussIt : - 0.8,
				weightIn : - 0.2,
				osc : 0.04
			},
			sleepy : {
				theta : i / 8,
				scaleInc : 0.15 * ( ( 8 - i ) / 8 ) * Math.cos( Math.PI * 2 * this.modifierTime )
			},
			calm : {
				gaussIt : - 0.6,
				weightIn : - 0.5,
				scaleInc : 0.15 * ( ( i ) / 8 ) * Math.cos( Math.PI * 2 * this.modifierTime )
			},

		}

		for (var mood in moods) {
			if( ringModifiers[ mood ] ){
				for( var modifier in ringModifiers[ mood ] ){
					if( !ringMods[ modifier] ) ringMods[ modifier ] = 0;
					ringMods[ modifier ] += ringModifiers[ mood ][ modifier ] * moods[mood];
				}
			}
		}

		this.rings[i].gaussIt = 0.98 + ringMods.gaussIt;
		this.rings[i].weightIn = 1 + ringMods.weightIn;
		this.rings[i].intensity = 0.21 + ringMods.intensity;
		this.rings[i].theta = i * 0.01 + ringMods.theta;
		this.rings[i].osc = 0.06 + ringMods.osc;
		this.rings[i].scaleInc = new THREE.Vector3( ringMods.scaleInc, ringMods.scaleInc, 0 );
		this.rings[i].position.x = ringMods.positionX;
		this.rings[i].position.y = ringMods.positionY;
	}

	this.timeInc = 0.005 + globalMods.timeInc
	this.modifierTimestep = globalMods.modifierTimestep

}

States.prototype.joy = function(){
	this.audio.play('joy');
	var expandTimeOn = 0.5;
	var expandTimeOff = 0.5;
	var expandSpread = 0.2;
	var expandScale = 0.9;
	var returnDelay = 0.4;

	for( var i = 0 ; i < this.rings.length ; i++ ){
		var ring = this.rings[i];
		var theta = ( Math.sign(this.rings[i].seed.z) > 0 ) ? ( 2 + i * 0.01 ) : ( -2 + i * 0.01 );
		var tl = new TimelineMax();
		tl.to( this.rings[i].position , expandTimeOn, { x : expandSpread, y : expandSpread, ease : Power2.easeOut } )
		.to( this.rings[i].position , expandTimeOff, { x : 0, y : 0, delay : returnDelay + ( ( this.rings.length - i ) / this.rings.length ) / 2, ease : Power2.easeOut } );

		var tl2 = new TimelineMax();
		tl2.fromTo( this.rings[i].scale , expandTimeOn, { x : this.rings[i].scale.x, y : this.rings[i].scale.y }, { x : expandScale, y : expandScale, ease : Back.easeOut.config(1.7) } )
		.to( this.rings[i].scale , expandTimeOff, { x : 1, y : 1, delay : returnDelay + ( ( this.rings.length - i ) / this.rings.length ) / 2, ease : Back.easeOut.config(1.7) } );

		var tl3 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl3.to( this.rings[i] , 2, {
			theta : theta,
			ease: Power4.easeOut,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 2
		} )
		.to( this.rings[i] , 0, {
			theta : i * 0.01
		})

		var tl4 = new TimelineMax();
		tl4.to( this.rings[i] , 0.6, {
			gaussIt : 0.5,
			weightIn : 0.2,
			intensity : 0.6,
			osc : 0.36,
			ease: Power4.easeOut
		} )
		.to( this.rings[i] , 0.6, {
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
		var tl0 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
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
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl0 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl0.to( this.rings[i].scale, 0.2, { x : 1.1, y: 1.1, ease : Power3.easeOut } )
		.to( this.rings[i].scale, 1.2, { x : 1, y:1, delay : 1.57, ease : Elastic.easeOut.config(1, 0.4) } )

		var tl5 = new TimelineMax( );
		tl5.to( this.rings[i].position, 0.2, { x : 0.05 * Math.cos( Math.random() * 2 * Math.PI), y: 0.05 * Math.sin( Math.random() * 2 * Math.PI), ease : Power3.easeOut } )
		.to( this.rings[i].position, 1.2, { x : 0, y:0, delay : 1.57, ease : Elastic.easeOut.config(1, 0.4) } )

		var tl1 = new TimelineMax(  );
		tl1.to( this.rings[i], 0.1, { 
			gaussIt : 0.1,
			weightIn : 0.5,
			intensity : 1,
			osc : .1,
			theta : Math.random() * this.rings[i].seed.z,
			ease : Power3.easeOut
		} )
		.to( this.rings[i], 1.2, { 
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06,
			theta : i * 0.01,
			ease : Power3.easeOut,
			delay : 1.55,
		} )
	}

	var tl3 = new TimelineMax( { onComplete : function(){ this.rotation = 0 }.bind(this) } );
	tl3.to( this , 2.4, { rotation : -1, ease : Power3.easeOut  } )
	tl3.to( this , 0.8, { rotation : 0, ease : Power3.easeOut  } )

	var tl4 = new TimelineMax();
	tl4.to( this , 0.2, { timeInc : 0.1, ease : Power3.easeOut  } )
	.to( this , 1, { timeInc : 0.01, delay : 3, ease : Power3.easeOut  } );
}

States.prototype.no = function(){
	this.audio.play('no');

	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl1 = new TimelineMax(  );
		tl1.to( this.rings[i], 2, { 
			gaussIt : 0.1,
			weightIn : 0.8,
			shadowSpread : 0.03,
			theta : Math.random() * this.rings[i].seed.z,
			ease : Power3.easeOut
		} )
		.to( this.rings[i], 2, { 
			gaussIt : 0.98,
			weightIn : 1,
			shadowSpread : 0.01,
			theta : i * 0.01,
			ease : Power3.easeOut,
			delay : 1
		} )
	}

	var tl2 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
	tl2.to( this.hsl , 2, { z : .2, ease : Power3.easeOut  } )
	.to( this.hsl , 2, { z : 0.47, delay : 1, ease : Power3.easeOut  } )

	var tl4 = new TimelineMax();
	tl4.to( this , 0.5, { timeInc : 0, ease : Power3.easeOut  } )
	.to( this , 2, { timeInc : 0.01, delay : 1.5, ease : Power3.easeOut  } );
	
}

States.prototype.hey = function(){
	this.audio.play('hey');
	
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl1 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl1.to( this.rings[i], 0.5, { 
			gaussIt : 0.83,
			weightIn : 0.03,
			intensity : 0.45,
			osc : .34,
			theta : Math.random() / 2,
			ease : Power3.easeOut
		} )
		.to( this.rings[i], 0.6, { 
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06,
			theta : i * 0.01,
			ease : Power3.easeOut
		} )
	}
	var tl4 = new TimelineMax(  );
	tl4.to( this , 1, { timeInc : 0.1, ease : Power3.easeOut  } )
	.to( this , 1, { timeInc : 0.01, delay : 0.5, ease : Power3.easeOut  } );
}

States.prototype.shake = function(){
	this.audio.play('shake');
	
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl1 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl1.to( this.rings[i], 0.6, { 
			gaussIt : 0,
			weightIn : 0.1,
			intensity : 3,
			osc : .1,
			theta : Math.random() / 2,
			ease : Power3.easeOut
		} )
		.to( this.rings[i], 0.3, { 
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.05,
			osc : 0.06,
			theta : i * 0.01,
			delay : 0.3,
			ease : Power3.easeOut
		} )
	}
	var tl4 = new TimelineMax(  );
	tl4.to( this , 1, { timeInc : 0.5, ease : Power3.easeOut  } )
	.to( this , 1, { timeInc : 0.01, delay : 0, ease : Power3.easeOut  } );
}

States.prototype.tap = function(){
	this.audio.play('tap');
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl1 = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );

		tl1.to( this.rings[i].scale, 0.1, { 
			x : 0.9 , y: 0.9, ease : Elastic.easeOut.config(1, 0.3), delay : ( ( this.rings.length - i ) / this.rings.length ) / 20
		} )
		.to( this.rings[i].scale, 0.1, { 
			x : 0.8 , y: 0.8, ease : Elastic.easeOut.config(1, 0.3), delay : ( ( this.rings.length - i ) / this.rings.length ) / 20
		} )
		.to( this.rings[i].scale, 0.15, { 
			x : 0.75 , y: 0.75
		} )
		.to( this.rings[i].scale, 1.1, { 
			x : 1 , y: 1, ease : Elastic.easeOut.config(1, 0.3), delay : ( i / this.rings.length ) / 5
		} )
	}
}


States.prototype.listen = function(){

	for( var i = 0 ; i < this.rings.length ; i++ ){
		var ring = this.rings[i];
		var theta = -Math.PI/12 - i * 0.001 ;

		var tl = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl.to( this.rings[i] , 1, {
			theta : theta,
			gaussIt : 0.8,
			weightIn : 0.6,
			intensity : 0.3,
			osc : 0.14,
			ease: Power4.easeOut,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 2
		} )
		.to( this.rings[i] , 0.4, {
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06,
			theta : i * 0.01,
			delay : 4 + ( ( this.rings.length - i ) / this.rings.length ) / 20
		})

	}

	var tl2 = new TimelineMax(  );
	tl2.to( this , 1, { timeInc : 0.05, ease : Power3.easeOut  } )
	.to( this , 0.4, { timeInc : 0.01, delay : 4, ease : Power3.easeOut  } );
}

States.prototype.listenStart = function(){
	this.listeningStarted = true;
	this.listenTls = [];
	
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var ring = this.rings[i];
		var theta = -Math.PI/12 - i * 0.001 ;

		this.listenTls[i] = new TimelineMax();
		this.listenTls[i].to( this.rings[i] , 1, {
			theta : theta,
			gaussIt : 0.8,
			weightIn : 0.6,
			intensity : 0.3,
			osc : 0.14,
			ease: Power4.easeOut,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 2
		} );
	}

	this.listenTl2 = new TimelineMax({ 
		onComplete : function(){
			this.listeningStarted = false;
		}.bind(this)
	});
	this.listenTl2.to( this , 1, { timeInc : 0.05, ease : Power3.easeOut  } );
}

States.prototype.listenEnd = function(){
	if( this.listeningStarted ) {
		for( var i = 0 ; i < this.rings.length ; i++ ) this.listenTls[i].stop();
		this.listenTl2.stop();
		this.listeningStarted = false;
	}
	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl.to( this.rings[i] , 0.4, {
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 20
		})

		var tl2 = new TimelineMax( );
		tl2.to( this.rings[i] , 1, {
			theta : i * 0.01,
			delay : ( ( this.rings.length - i ) / this.rings.length ) / 20,
			ease: Elastic.easeOut.config(1, 0.8)
		});

	}
	var tl2 = new TimelineMax(  );
	tl2.to( this , 0.4, { timeInc : 0.01, ease : Power3.easeOut  } );
}


States.prototype.question = function(){
	this.audio.play('question');


	var timeIn = 0.4;
	var delay = 0.4;
	var timeOut = 0.6;

	for( var i = 0 ; i < this.rings.length ; i++ ){
		var tl = new TimelineMax( { onComplete : function(){ this.setState('idle') }.bind(this) } );
		tl.to( this.rings[i].scale, timeIn, { x : 1 + (i-this.rings.length) * 0.01, y: 1 + (i-this.rings.length) * 0.01, ease : Power3.easeOut } )
		.to( this.rings[i].scale, timeOut, { x : 1, y:1, delay : delay,  ease : Elastic.easeOut.config(1, 0.4) } )

		var tl2 = new TimelineMax( );
		tl2.to( this.rings[i].position, timeIn, { x : 0 * Math.cos( Math.random() * 2 * Math.PI), y: 0.1 * Math.sin( Math.random() * 2 * Math.PI), ease : Power3.easeOut } )
		.to( this.rings[i].position, timeOut, { x : 0, y:0, delay : delay,  ease : Elastic.easeOut.config(1, 0.4) } )


		var tl3 = new TimelineMax(  );
		tl3.to( this.rings[i], timeIn, { 
			gaussIt : 0.1,
			weightIn : 0.5,
			intensity : 1,
			osc : .1,
			ease : Power3.easeOut
		} )
		.to( this.rings[i], timeOut, { 
			gaussIt : 0.98,
			weightIn : 1,
			intensity : 0.21,
			osc : 0.06,
			ease : Power3.easeOut,
			delay : delay
		} )


		var tl4 = new TimelineMax(  );
		tl4.to( this.rings[i], timeIn, { 
			theta : Math.random() ,
			ease : Power3.easeOut
		} )
		.to( this.rings[i], timeOut, { 
			theta : i * 0.01,
			delay : delay,
			ease : Power3.easeOut
		} )
	}

	var tl5 = new TimelineMax();
	tl5.to( this , timeIn, { timeInc : 0.1, ease : Power3.easeOut  } )
	.to( this , timeOut, { timeInc : 0.01, delay : delay, ease : Power3.easeOut  } );
}

States.prototype.updateStates = function( time ){
	// var n = this.simplex.noise2D( 0.5, time / 10000 );
	// this.rotationSpeed += n /1000000;
	// this.rotation += this.rotationSpeed;
}

module.exports = States;