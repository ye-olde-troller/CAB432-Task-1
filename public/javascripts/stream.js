var options = {
	width: '100%',
	height: '100%',
	channel: streams[o].user_login,
};
var player = new Twitch.Player("ChangablePlayer", options);
player.setVolume(0.5);