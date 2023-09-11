var axios = require('axios');

function getStreams(gameIDs, apiToken){
	return new Promise((resolve, reject) => {
		streams = []
		for(gameId in gameIDs){
			streams.push(getStream(gameIDs[gameId], 1, apiToken));
		}
		Promise.allSettled(streams).then((values) => {
			//format responses
			var response = {}
			for(stream in values){
				//console.log(values[stream]);
				//TODO: get videos for any games that don't have a current stream.
				console.log(values[stream]);
				if(values[stream].value[0]){
					console.log(values[stream].value[0].game_id);
					response[getKeyByValue(gameIDs, values[stream].value[0].game_id)] = values[stream].value[0];
				}
			}
			resolve(response);
		});
	});
}


function getStream(gameId, streamCount, apiToken){
	return new Promise((resolve, reject) => {
		axios.get(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=${streamCount}`, {
			headers: {
				'Accept': 'application/json',
				'Client-ID': process.env.CLIENT_ID,
				'Authorization': "Bearer " + apiToken
			},
		})
		.then(response => {
			console.log("gameId: ", response.data.data);
			return response.data.data;
		})
		.then(data => {
			if(data.length == 0){
				
			}
			resolve(data);
		})
		.catch(e => {
			reject(e);
			console.error(e);
		})
	})
}  

function getData(userId, API_TOKEN){
	return new Promise((resolve, reject) => {
		axios.get(`https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=100`, {
		headers: {
			'Accept': 'application/json',
			'Client-ID': process.env.CLIENT_ID,
			'Authorization': "Bearer " + API_TOKEN
		},
		})
		.then(response => {
		return response.data.data;
		})
		.then(data => {
		var count = {};
		for(entry in data){
			count[data[entry].game_id] = count[data[entry].game_id] ? count[data[entry].game_id] + 1 : 1;
		}

		let entries = Object.entries(count);
		let sorted = entries.sort((a, b) => b[1] - a[1]);
		
		games = []
		for(item in sorted){
			games.push(getGame(sorted[item][0], API_TOKEN));
		}

		Promise.allSettled(games).then(values => {
			console.log(values);
			for(entry in values){
			if(values[entry].status == "fulfilled" && values[entry].value.length != 0){
				return values[entry].value;
			}
			}
		})
		.then(value => {
			resolve(value);
		})
		.catch(e => {
			console.error(e);
		});
		})
		.catch(e => {
		console.error(e);
		reject(e);
		})
	});
	}

function getGame(gameId, API_TOKEN){
	return new Promise((resolve, reject) => {
		var body = `
		fields
		name,
		summary,
		first_release_date,
		artworks.image_id,
		similar_games.name,
		similar_games.id,
		similar_games.cover.image_id,
		similar_games.external_games.uid,
		similar_games.external_games.category
		;
		where external_games.uid = "${gameId}" & external_games.category = 14;  
		`

		axios.post("https://api.igdb.com/v4/games", body, {
		headers: {
			'Accept': 'application/json',
			'Client-ID': process.env.CLIENT_ID,
			'Authorization': "Bearer " + API_TOKEN
		},
		})
		.then(response => {
		if(response.data.length != 0){
			response.data[0].artwork = response.data[0].artworks[0];
			delete response.data[0].artworks;
			response.data[0].first_release_date = response.data[0].first_release_date * 1000;
			resolve(response.data);
			return response.data;
		}
		reject();
		})
		.catch(e => {
		console.error(e);
		reject(e);
		})
	})
}

function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}

module.exports = {getStreams, getStream, getData, getGame};
