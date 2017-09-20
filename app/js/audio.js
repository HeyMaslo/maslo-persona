var AudioPlayer = function(){
	this.track = {
		'open' : new Audio('audio/open.mp3')
	}
}

AudioPlayer.prototype.play = function( track ) {
	console.log(track)
	if( this.currentTrack ){
		this.track[this.currentTrack].pause();
		this.track[this.currentTrack].currentTime = 0;
	}
	if( this.currentTrack) console.log(this.track[this.currentTrack])
	this.track[track].play();
	this.currentTrack = track;
};
module.exports = AudioPlayer;