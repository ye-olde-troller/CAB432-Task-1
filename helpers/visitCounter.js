//called on each visit to home page, or other pages
//once done, continues to next

var express = require('express');
var router = express.Router();

router.get('*', (req, res, next) => {
	//increment counter
	console.log('Visit');
	next();
})

module.exports = router;