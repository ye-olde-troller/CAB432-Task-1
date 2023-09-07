var options = {
	width: '100%',
	height: '100%',
	channel: "<channel ID>",
	video: "<video ID>",
	collection: "<collection ID>",
};
var player = new Twitch.Player("ChangablePlayer", options);
player.setVolume(0.5);