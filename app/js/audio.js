var AudioPlayer = function(){
	var audioTracks = ['hey','joy','no','open','pinch','shake','surprise','swipe','tap','tilt','upset','yes']
	for( var i = 0 ; i < audioTracks.length ; i++ ) this[audioTracks[i]] = new Audio( 'audio/' + audioTracks[ i ] + '.mp3' );

	// this.ctx = new AudioContext();
	// this.analyser = this.ctx.createAnalyser();
	// this.analyser.fftSize = 128;
	// this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
}
AudioPlayer.prototype.play = function( track ) {
	if( this.currentTrack ){
		this[this.currentTrack].pause();
		this[this.currentTrack].currentTime = 0;
	}
	
	this[track].play();
	this.currentTrack = track;

	// this.audioSrc = this.ctx.createMediaElementSource(this[track]);
	// this.audioSrc.connect(this.analyser);
	// this.analyser.connect(this.ctx.destination);
};

AudioPlayer.prototype.step = function( time ){
	
	// this.analyser.getByteTimeDomainData(this.frequencyData);
	// console.log(this.frequencyData[0])
}
module.exports = AudioPlayer;