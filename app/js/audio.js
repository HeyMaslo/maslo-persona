var AudioPlayer = function(){
	var audioTracks = ['hey','joy','no','no2','open','pinch','shake','surprise','swipe','tap','tilt','upset','upset2','yes']
	for( var i = 0 ; i < audioTracks.length ; i++ ) this[audioTracks[i]] = new Audio( 'audio/' + audioTracks[ i ] + '.mp3' );
}
AudioPlayer.prototype.play = function( track ) {
	if( this.currentTrack ){
		this[this.currentTrack].pause();
		this[this.currentTrack].currentTime = 0;
	}
	this[track].play();
	this.currentTrack = track;
};
module.exports = AudioPlayer;