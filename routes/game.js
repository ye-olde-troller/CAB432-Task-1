var express = require('express');
var router = express.Router();

router.get('/:gameID', (req, res, next) => {
	res.send(`token: ${req.API_TOKEN}\ngame: ${req.params.gameID}`)
})

module.exports = router;