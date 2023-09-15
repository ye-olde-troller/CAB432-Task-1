var express = require('express');
var router = express.Router();
var axios = require('axios');
var {getStreams, getStream} = require('../helpers/api');
const createHttpError = require('http-errors');

router.get('/:gameID', (req, res, next) => {
	body = `query companies "companies"{
		fields name;
		where developed = (${req.params.gameID})
		| published = (${req.params.gameID});
		};
		
		query games "game data"{
		fields age_ratings.*,
		aggregated_rating,
		artworks,category,
		checksum,
		cover.image_id,
		created_at,
		external_games.*,
		first_release_date,
		genres.name,
		involved_companies.company,
		involved_companies.developer,
		involved_companies.publisher,
		keywords,
		name,
		parent_game,
		platforms.*,
		ports,
		rating,
		similar_games.name,
		similar_games.id,
		similar_games.cover.image_id,
		similar_games.external_games.uid,
		similar_games.external_games.category,
		slug,
		status,
		storyline,
		summary,
		tags,
		themes,
		total_rating,
		version_parent,
		version_title,
		videos,
		websites.*; where id = ${req.params.gameID};};`

	axios.post("https://api.igdb.com/v4/multiquery", body, {
		headers: {
			'Accept': 'application/json',
			'Client-ID': process.env.CLIENT_ID,
			'Authorization': "Bearer " + res.locals.API_TOKEN
		},
	})
	.then((response) => {
		return response.data;
	})
	.then((data) => {
		//merge company and game data
		var tempData = data[1].result[0];
		for(company in data[0].result){
			for(involved in tempData.involved_companies){
				if(data[0].result[company].id == tempData.involved_companies[involved].company){
					tempData.involved_companies[involved].name = data[0].result[company].name;
				}
			}
		}
		return tempData;
	})
	.then((data) => {
		//make all changes to make data suitable here
		data.first_release_date = data.first_release_date * 1000; //because timestamp doesn't include miliseconds
		return data;
	})
	.then((data) => {
		var games = {}
		//get the list of similar games in format {igdb id: twitch game id}
		for(game in data.similar_games){
			if(data.similar_games[game].external_games.find(entry => entry.category == 14) != undefined){
				games[data.similar_games[game].id] = data.similar_games[game].external_games.find(entry => entry.category == 14).uid;
			}
			else{
				delete data.similar_games[game];
			}
		}
		//get a list of streams for similar games
		getStreams(games, res.locals.API_TOKEN)
		.then(streams => {
			for(game in data.similar_games){
				data.similar_games[game].stream = streams[data.similar_games[game].id];
			}
		})
		.then(() => {
			res.render('game', { title: 'Express', gameID: req.params.gameID, ...data});
		})
		.catch(e => {
			console.error(e);
		})
	})
	.catch(e => {
		console.error(e);
		next(createHttpError(404));
	})
})
 

module.exports = router;