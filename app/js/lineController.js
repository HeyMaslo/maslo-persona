var LineController = function(){
	this.node = document.getElementById( 'lineController' );
	if(window.pageMode)return;
	this.slider = this.node.getElementsByClassName( 'slider' )[0];
	
	this.originDrag = 0;
	this.dragginPosition = 0;
	this.position = 0;
	this.vals = {
		joy : 0,
        love : 0,
        surprise : 0,
        terror : 0,
        sadness : 0,
        anger : 0,
        sleepy : 0,
        calm : 0
	};

	this.slider.addEventListener('mousedown', this.mouseDown.bind( this ) );
	document.body.addEventListener( 'mousemove', this.mouseMove.bind( this ) );
	document.body.addEventListener( 'mouseup', this.mouseUp.bind( this ) );
}

LineController.prototype.mouseDown = function( e ){
	this.dragging = true;
	this.originDrag = e.screenX;
	this.dragginPosition = e.screenX;
	this.position = 0;
}

LineController.prototype.mouseUp = function( e ){
	this.dragging = false;
}

LineController.prototype.mouseMove = function( e ){
	if( this.dragging ) this.dragginPosition = e.screenX;
}

LineController.prototype.step = function( time ){
	if(window.pageMode)return;
	// slider position
	if( this.dragging ) this.position = this.dragginPosition - this.originDrag;
	else this.position = this.position - this.position * 0.1;

	// influences
	var minDist = 0;
	var val = Math.max( -1, Math.min( 1, this.position / ( this.node.offsetWidth / 2 ) ) );

	var joy, love, sadness;
	if( val > 0 ){
		joy = Math.max( 0, 1 - Math.sqrt( Math.pow( val - 0.5, 2 ) ) / 0.5 );
		love = Math.max( 0, ( val - 0.5 ) / 0.5 );
	} else {
		joy = 0;
		love = 0;
	}
	if( val <= 0 ) sadness = Math.abs( val );
	else sadness = 0;
	
	this.vals.joy = joy;
	this.vals.love = love;
	this.vals.sadness = sadness;

	this.slider.style.transform = 'translate3d( ' + this.position + 'px, 0px, 0px )';
}

module.exports = LineController;