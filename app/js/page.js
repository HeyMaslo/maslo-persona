var Page = function() {
	window.page = this;
	
	// remove sound
	window.main.persona.audio.play = function(){};

	// reposition
	window.main.persona.group.position.y = 200;
	window.main.persona.globalContainer.scale.set(0.75,0.75,0.75);


	// animations
	this.reactions = [ 'idle', 'joy', 'surprise', 'upset', 'yes', 'no', 'hey', 'shake', 'listening', 'question' ];
	this.personaReactionTimeout = setTimeout( this.react.bind( this ), 5000 );
}

Page.prototype.react = function(){
	var reaction = this.reactions[ Math.floor( Math.random( ) * this.reactions.length ) ];
	window.main.persona.setState( reaction );

	this.personaReactionTimeout = setTimeout( this.react.bind( this ), 7000 + Math.random() * 3000 );
}

new Page();