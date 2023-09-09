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
    axios.get(`https://api.twitch.tv/helix/channels?broadcaster_id=${data.id}`, {
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.CLIENT_ID,
        'Authorization': "Bearer " + res.locals.API_TOKEN
      },
    })
    .then(response => {
      console.log(response.data.data);
    })
    res.render('users', { title: 'Express', userID: req.params.userID, ...data});

  })
  .catch(e => {
    console.error(e);
    next(createHttpError(500));
  });
});

module.exports = router;
