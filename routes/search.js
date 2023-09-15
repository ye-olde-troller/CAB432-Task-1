var express = require('express');
var router = express.Router();
var {search} = require('../helpers/api');
const createHttpError = require('http-errors');

router.get('/', (req, res, next) => {
	if(req.query.query != null || req.query.query != undefined){
		search(req.query.query, res.locals.API_TOKEN)
		.then(data => {
			res.render('search', { title: 'Express', ...data});
		})
		.catch(e => {
			console.error(e);
		});
	}
	else{
		next(createHttpError(500));
	}
});		


module.exports = router;