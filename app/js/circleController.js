var CircleController = function(){
	this.node = document.getElementById( 'circleController' );
	if(window.pageMode)return;
	this.slider = this.node.getElementsByClassName( 'slider' )[0];
	this.feelings = document.getElementsByClassName( 'feeling' );

	this.vals = {};
	this.originDrag = { x : 0, y : 0 };
	this.dragginPosition = { x : 0, y : 0 };
	this.position = { x : 0, y : 0 };
	this.distance = 0;
	this.angle = 0;
	this.titles = {};

	for( var i = 0 ; i < this.feelings.length ; i++ ){
		this.titles[ this.feelings[i].getAttribute('id') ] = this.feelings[ i ].innerHTML;
		var p = { id : this.feelings[i].getAttribute('id'), x : Math.cos( Math.PI * 2 * i / this.feelings.length )  * this.node.offsetWidth / 2, y : -Math.sin( Math.PI * 2 * i / this.feelings.length )  * this.node.offsetWidth / 2 }
		this.feelings[ i ].style.transform = 'translate3d( ' + p.x + 'px, ' + p.y + 'px, 0px )';
		this.vals[ this.feelings[i].getAttribute( 'id' ) ] = 0;
	}

	this.slider.addEventListener('mousedown', this.mouseDown.bind( this ) );
	document.body.addEventListener( 'mousemove', this.mouseMove.bind( this ) );
	document.body.addEventListener( 'mouseup', this.mouseUp.bind( this ) );
}

CircleController.prototype.mouseDown = function( e ){
	this.dragging = true;
	this.originDrag = { x : e.screenX, y : e.screenY };
	this.dragginPosition = { x : e.screenX, y : e.screenY };
	this.position = { x : 0, y : 0 };
}

CircleController.prototype.mouseUp = function( e ){
	this.dragging = false;
}

CircleController.prototype.mouseMove = function( e ){
	if( this.dragging ) this.dragginPosition = { x : e.screenX, y : e.screenY };
}

CircleController.prototype.step = function( time ){
	if(window.pageMode)return;
	// slider position
	if( this.dragging ) this.position = { x : this.dragginPosition.x - this.originDrag.x, y : this.dragginPosition.y - this.originDrag.y };
	else this.position = { x : this.position.x - this.position.x * 0.1, y : this.position.y - this.position.y * 0.1 }

	// influences
	var minDist = 0.02;
	var angle = Math.atan2( -this.position.y, this.position.x );
	if( angle < 0 ) angle = Math.PI + ( Math.PI + angle );
	var dist = Math.sqrt( Math.pow( this.position.x, 2 ) + Math.pow( this.position.y, 2 ) ) / ( this.node.offsetWidth / 2 );
	dist = Math.min( 1, Math.max( 0, ( dist - minDist ) / ( 1 - minDist ) ) );
	var angleInc = Math.PI * 2 / this.feelings.length;

	if( angle > angleInc * 7 ) {
		var inf = ( angle - angleInc * 7 ) / angleInc;
		this.vals[ this.feelings[0].getAttribute('id') ] = inf * dist;
		this.vals[ this.feelings[7].getAttribute('id') ] = ( 1 - inf ) * dist;
	} else {
		for( var i = 0 ; i < this.feelings.length ; i++ ){
			var inf = Math.max( 0, 1 - Math.abs( ( angleInc * i - angle ) / angleInc ) ) * dist;
			this.vals[ this.feelings[i].getAttribute('id') ] = inf;
		}	
	}

	for (var val in this.vals){
		if( this.vals[val] == 0 ) document.getElementById( val ).innerHTML = this.titles[ val ];
		else document.getElementById( val ).innerHTML = Math.round( this.vals[val] * 100 ) + '%';
	}
	this.slider.style.transform = 'translate3d( ' + this.position.x + 'px, ' + this.position.y + 'px, 0px )';
}

module.exports = CircleController;