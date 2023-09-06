//this might work well as a worker?
var axios = require('axios');
var express = require('express');
var router = express.Router();

var token;
var expiresAt;
//get client id and secret from ENV

router.get('*', (req, res, next) => {
	res.locals.API_TOKEN = token;
	next();
});

function refresh(){
	//fetch access token from API
	axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`)
	.then(response => {
		return response.data;
	})
	.then(data => {
		token = data.access_token;
		expiresAt = data.expires_in - 6000 // number of milliseconds until expiration; subtract a minute to ensure token is always valid.
		console.log(token);
		console.log("token expires: " + data.expires_in);
		console.log("refresh at: " + expiresAt);
	})
	.then(() => {	
		setTimeout(() => {
			refresh();
		}, expiresAt)
	})
	.catch(e => {
		console.error(e);
	})

}

refresh();
//set timeout for just before expiry 
//re-fetch token once timout expires



//export current api token
module.exports = { token, router};