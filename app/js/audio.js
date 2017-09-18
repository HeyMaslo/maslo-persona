var AudioPlayer = function(){
	this.track = {}
	for( var i = 1 ; i <= 2 ; i++ ) this.track['audio'+i] = new Audio('audio/' + i + '.mp3');
}

AudioPlayer.prototype.play = function( track ) {
	if( this.currentTrack ){
		this.track['audio'+this.currentTrack].pause();
		this.track['audio'+this.currentTrack].currentTime = 0;
	}
	if( this.currentTrack) console.log(this.track['audio'+this.currentTrack])
	this.track['audio'+track].play();
	this.currentTrack = track;
};
module.exports = AudioPlayer;