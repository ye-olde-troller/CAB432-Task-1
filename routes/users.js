var express = require('express');
const createHttpError = require('http-errors');
var router = express.Router();
var axios = require('axios');


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
    console.log(data);
    //channels endpoint has the most recent game they played
    //can't currently find a way to get the game played in all their recent streams

    getData(data.id, res.locals.API_TOKEN)
    .then(count => {
      console.log("count: ", count);
      res.render('users', { title: 'Express', userID: req.params.userID, ...data});
    })
    .catch(e => {
      console.error(e);
    })

  })
  .catch(e => {
    console.error(e);
    next(createHttpError(500));
  });
});

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
        for(entry in values){
          if(values[entry].status == "fulfilled"){
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
      similar_games.name,
      similar_games.id,
      similar_games.cover.image_id,
      similar_games.external_games.uid,
      similar_games.external_games.category
      ;
      where external_games.uid = "${gameId}";  
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
    .then(data => {
      console.log(data);
      resolve(data);
    })
    .catch(e => {
      console.error(e);
      reject(e);
    })
  })
}

module.exports = router;
