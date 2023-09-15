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
				//TODO: get videos for any games that don't have a current stream.
				if(values[stream].value[0]){
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
		//count the number of clips for each game
		for(entry in data){
			count[data[entry].game_id] = count[data[entry].game_id] ? count[data[entry].game_id] + 1 : 1;
		}
		//sort by view count
		let entries = Object.entries(count);
		let sorted = entries.sort((a, b) => b[1] - a[1]);
		
		games = []
		for(item in sorted){
			games.push(getGame(sorted[item][0], API_TOKEN));
		}

		Promise.allSettled(games).then(values => {
			for(entry in values){
			if(values[entry].status == "fulfilled" && values[entry].value.length != 0){
				//return details on the game with the most clips
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
			//necessary to do this so that we can access the image in handlebars
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

function getUsers(API_TOKEN){
	return new Promise((resolve, reject) => {
		//use the streams endpoint first because there's no way to just get a list of popular users.
		axios.get(`https://api.twitch.tv/helix/streams`, {
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
			userRequests = []
			for(entry in data){
				userRequests.push(getUser(data[entry].user_id, API_TOKEN));
			}
			//wait until we have all users
			Promise.allSettled(userRequests).then(values => {
				response = [];
				//only add ones which had requests which succeeded
				for(entry in values){
					if(values[entry].status === "fulfilled"){
						response.push(values[entry].value);
					}
				}
				resolve(response);
			})
		})
		.catch(e => {
			console.error(e);
			reject(e);
		});		
	});
}

function getUser(userID, API_TOKEN){
	return new Promise((resolve, reject) => {
		axios.get(`https://api.twitch.tv/helix/users?id=${userID}`, {
			headers: {
				'Accept': 'application/json',
				'Client-ID': process.env.CLIENT_ID,
				'Authorization': "Bearer " + API_TOKEN
			},
		})
		.then(response => {
			resolve(response.data.data[0]);
		})
		.catch(e => {
			reject(e);
		})
	})
}

function getGames(API_TOKEN){
	return new Promise((resolve, reject) => {
		var body = `
		fields
		name,
		cover.image_id;
		where cover != null;
		`

		axios.post("https://api.igdb.com/v4/games", body, {
		headers: {
			'Accept': 'application/json',
			'Client-ID': process.env.CLIENT_ID,
			'Authorization': "Bearer " + API_TOKEN
		},
		})
		.then(response => {
			resolve(response.data);
		})
		.catch(e => {
			console.error(e);
			reject(e);
		})
	})
}

function search(query, API_TOKEN){
	return new Promise((resolve, reject) => {
		axios.get(`https://api.twitch.tv/helix/search/channels?query=${query}`, {
			headers: {
			'Accept': 'application/json',
			'Client-ID': process.env.CLIENT_ID,
			'Authorization': "Bearer " + API_TOKEN
			},
		})
		.then(user => {
			return user.data.data;
		})
		.then(user => {
			var body = `
			fields
			name,
			cover.image_id;
			where cover != null & name ~ *"${query}"*;
			`

			axios.post("https://api.igdb.com/v4/games", body, {
			headers: {
				'Accept': 'application/json',
				'Client-ID': process.env.CLIENT_ID,
				'Authorization': "Bearer " + API_TOKEN
			},
			})
			.then(response => {
				return response.data;
			})
			.then(games => {
				resolve({games: games, users: user});
			})
			.catch(e => {
				reject(e);
			})
		})
		.catch(e => {
			reject(e);
		})
	})
}


function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}

module.exports = {getStreams, getStream, getData, getGame, getGames, getUsers, search};
