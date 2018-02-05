var Debug = function( parent ){
	this.parent = parent;

	this.debug1 = document.getElementById('b1');
	this.debug2 = document.getElementById('b2');
	this.debug3 = document.getElementById('b3');

	this.selected = 0;

	if( window.location.href.indexOf('localhost') > 0 ){
		this.socket = new WebSocket('ws://localhost:8080');
		this.socket.addEventListener('message', this.message.bind( this ) );
	}
}

Debug.prototype.message = function(e){
	var data = e.data.split(',');
	var program = data[0];
	var channel = data[1];
	var value = data[2];

	if( program >= 192 && program <= 195 ) this.selected = channel;
	if( program == 176 ){
		if( channel == 1 ) this.parent.persona.rings[this.selected].osc = value/127;
		if( channel == 2 ) this.parent.persona.rings[this.selected].intensity = value/127 * 3;
		if( channel == 3 ) this.parent.persona.rings[this.selected].frequency = value/127;
		if( channel == 4 ) this.parent.persona.rings[this.selected].mesh.scale.set( value/127 * 2, value/127 * 2, 1 );
		if( channel == 5 ) this.parent.persona.rings[this.selected].gaussIt = value/127;
		if( channel == 6 ) this.parent.persona.rings[this.selected].weightIn = value/127;
		if( channel == 7 ) this.parent.persona.rings[this.selected].theta = value/127;
		if( channel == 8 ) this.parent.persona.rings[this.selected].opacity = value/127;
	}

	if( program == 177 ){
		if( channel == 1 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].osc = value/127;
		if( channel == 2 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].intensity = value/127 * 3;
		if( channel == 3 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].frequency = value/127;
		if( channel == 4 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].mesh.scale.set( value/127 * 2, value/127 * 2, 1 );
		if( channel == 5 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].gaussIt = value/127;
		if( channel == 6 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].weightIn = value/127;
		if( channel == 7 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].theta = value/127;
		if( channel == 8 ) for( var i = 0 ; i < this.parent.persona.rings.length ; i++ ) this.parent.persona.rings[i].opacity = value/127;
	}

	if( program == 178 ){
		if( channel == 1 ) this.parent.persona.timeInc = value/127/4;
		if( channel == 2 ) this.parent.persona.rotation = value/127;
		if( channel == 3 ) this.parent.persona.scale.set( value/127 * 2, value/127 * 2, 1 );
		if( channel == 5 ) this.parent.persona.hsl.x = Math.round( value/127 * 360 );
		if( channel == 6 ) this.parent.persona.hsl.y = value/127;
		if( channel == 7 ) this.parent.persona.hsl.z = value/127;
	}
}

Debug.prototype.step = function(){
	var debugText = 'Global:<br/>';
	debugText += '-----------------<br/>';
	debugText += '-> Rings : ' + this.parent.persona.ringCount + '<br/>';
	debugText += '-> Ring res : ' + this.parent.persona.ringRes + '<br/>';
	debugText += '-> TimeInc : ' + this.parent.persona.timeInc.toFixed(4) + '<br/>';
	debugText += '-> Rotation : ' + this.parent.persona.rotation.toFixed(2) + '<br/>';
	debugText += '-> Pos. x : ' + this.parent.persona.position.x.toFixed(2) + ' y : ' + this.parent.persona.position.y.toFixed(2) + ' <br/>';
	debugText += '-> Scale x : ' + this.parent.persona.scale.x.toFixed(2) + ' y : ' + this.parent.persona.scale.y.toFixed(2) + ' <br/>';
	debugText += '-> Radius : ' + this.parent.persona.radius.toFixed(2) + '<br/>';
	debugText += '-> Hue : ' + this.parent.persona.hsl.x.toFixed(2) + '<br/>';
	debugText += '-> Saturation : ' + this.parent.persona.hsl.y.toFixed(2) + '<br/>';
	debugText += '-> Lightness : ' + this.parent.persona.hsl.z.toFixed(2) + '<br/>';
	if( this.debug1 ) this.debug1.innerHTML = debugText

	var debugText = 'Rings:<br/>';
	debugText += '-----------------<br/>';
	for( var i = 0 ; i < 4 ; i++ ){
		debugText += 'Ring : ' + i + '<br/>';
		debugText += '-> Oscillation : ' + this.parent.persona.rings[i].osc.toFixed(2) + '<br/>';
		debugText += '-> Intensity : ' + this.parent.persona.rings[i].intensity.toFixed(2) + '<br/>';
		debugText += '-> Frequency : ' + this.parent.persona.rings[i].frequency.toFixed(2) + '<br/>';
		debugText += '-> Shadow : ' + this.parent.persona.rings[i].shadowSpread.toFixed(2) + '<br/>';
		debugText += '-> Scale x : ' + this.parent.persona.rings[i].scale.x.toFixed(2) + ' y : ' + this.parent.persona.rings[i].scale.y.toFixed(2) + '<br/>';
		debugText += '-> GaussIt : ' + this.parent.persona.rings[i].gaussIt.toFixed(2) + '<br/>';
		debugText += '-> WeightIn : ' + this.parent.persona.rings[i].weightIn.toFixed(2) + '<br/>';
		debugText += '-> Theta : ' + this.parent.persona.rings[i].theta.toFixed(2) + '<br/>';
		debugText += '-> Opacity : ' + this.parent.persona.rings[i].opacity.toFixed(2) + '<br/>';
		debugText += '<br/>';
	}
	if( this.debug2 ) this.debug2.innerHTML = debugText

	var debugText = '<br/>';
	debugText += '-----------------<br/>';
	for( var i = 4 ; i < this.parent.persona.rings.length ; i++ ){
		debugText += 'Ring : ' + i + '<br/>';
		debugText += '-> Oscillation : ' + this.parent.persona.rings[i].osc.toFixed(2) + '<br/>';
		debugText += '-> Intensity : ' + this.parent.persona.rings[i].intensity.toFixed(2) + '<br/>';
		debugText += '-> Frequency : ' + this.parent.persona.rings[i].frequency.toFixed(2) + '<br/>';
		debugText += '-> Shadow : ' + this.parent.persona.rings[i].shadowSpread.toFixed(2) + '<br/>';
		debugText += '-> Scale x : ' + this.parent.persona.rings[i].scale.x.toFixed(2) + ' y : ' + this.parent.persona.rings[i].scale.y.toFixed(2) + '<br/>';
		debugText += '-> GaussIt : ' + this.parent.persona.rings[i].gaussIt.toFixed(2) + '<br/>';
		debugText += '-> WeightIn : ' + this.parent.persona.rings[i].weightIn.toFixed(2) + '<br/>';
		debugText += '-> Theta : ' + this.parent.persona.rings[i].theta.toFixed(2) + '<br/>';
		debugText += '-> Opacity : ' + this.parent.persona.rings[i].opacity.toFixed(2) + '<br/>';
		debugText += '<br/>';
	}
	if( this.debug3 ) this.debug3.innerHTML = debugText
}

module.exports = Debug;