var express = require('express');
var router = express.Router();
var {getUsers, getGames} = require('../helpers/api');
const createHttpError = require('http-errors');

/* GET home page. */
router.get('/', function(req, res, next) {

  getGames(res.locals.API_TOKEN)
  .then(games => {
    getUsers(res.locals.API_TOKEN)
    .then(users => {
      res.render('index', { title: 'Express', users: users, games:games });
    })
    .catch(e => {
      next(createHttpError(500));
    });
  })
  .catch(e => {
    next(createHttpError(500));
  })
});

module.exports = router;
