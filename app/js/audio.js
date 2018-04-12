var AudioPlayer = function(){
	var audioTracks = ['hey','joy','no','open','pinch','shake','surprise','swipe','tap','upset','yes','question']
	for( var i = 0 ; i < audioTracks.length ; i++ ) this[audioTracks[i]] = new Audio( 'audio/' + audioTracks[ i ] + '.mp3' );
}
AudioPlayer.prototype.play = function( track ) {
	// return;
	if( this.currentTrack ){
		this[this.currentTrack].pause();
		this[this.currentTrack].currentTime = 0;
	}
	
	this[track].play();
	this.currentTrack = track;
};

module.exports = AudioPlayer;