var express = require('express');
const createHttpError = require('http-errors');
var router = express.Router();
var axios = require('axios');
var {getData, getGame, getStreams} = require('../helpers/api');

/* GET users listing. */
router.get('/:userID', function(req, res, next) {
  axios.get(`https://api.twitch.tv/helix/users?login=${req.params.userID}`, {
    headers: {
      'Accept': 'application/json',
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': "Bearer " + res.locals.API_TOKEN
    },
  })
  .then((response) => {
    return response.data.data[0];
  })
  .then((data) => {
    if(data == undefined){
      next(createHttpError(404));
      return;
    }
    //console.log(data);
    //channels endpoint has the most recent game they played
    //can't currently find a way to get the game played in all their recent streams

    getData(data.id, res.locals.API_TOKEN)
    .then(mostStreamed => {
      //prints the most streamed game
      //console.log("count: ", count);
      if(mostStreamed == undefined){
        //if we're unable to get a most streamed game
        res.render('users', { title: 'Express', userID: req.params.userID, ...data});
        return;
      }
      
      var games = {}
      //get the list of similar games in format {igdb id: twitch game id}
      for(game in mostStreamed[0].similar_games){
        games[mostStreamed[0].similar_games[game].id] = mostStreamed[0].similar_games[game].external_games.find(entry => entry.category == 14).uid;
      }
      //get a list of streams for similar games
      getStreams(games, res.locals.API_TOKEN)
      .then(streams => {
        for(game in mostStreamed[0].similar_games){
          mostStreamed[0].similar_games[game].stream = streams[mostStreamed[0].similar_games[game].id];
        }
      })
      .then(() => {
        console.log(mostStreamed[0].similar_games);
        res.render('users', { title: 'Express', userID: req.params.userID, ...data, ...mostStreamed[0]});
      })
      .catch((e) => {
        console.error(e);
      });
    })
    .catch(e => {
      console.error(e);
      next(createHttpError(500));
    })

  })
  .catch(e => {
    console.error(e);
    next(createHttpError(500));
  });
});

module.exports = router;
