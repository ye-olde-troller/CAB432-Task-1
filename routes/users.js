var express = require('express');
const createHttpError = require('http-errors');
var router = express.Router();
var axios = require('axios');
var {getData, getGame} = require('../helpers/api');

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
    console.log(data);
    //channels endpoint has the most recent game they played
    //can't currently find a way to get the game played in all their recent streams

    getData(data.id, res.locals.API_TOKEN)
    .then(count => {
      console.log("count: ", count);
      if(count != undefined){
        //get streams
        
        res.render('users', { title: 'Express', userID: req.params.userID, ...data, ...count[0]});
        return;
      }
      res.render('users', { title: 'Express', userID: req.params.userID, ...data});
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
