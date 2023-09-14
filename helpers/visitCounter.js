//called on each visit to home page, or other pages
//once done, continues to next
var express = require('express');
var router = express.Router();
var {uploadJSONtoS3, getObjectFromS3} = require('./S3Manager');
const createHttpError = require('http-errors');

const bucketName = process.env.BUCKET_NAME;
const objectKey = process.env.OBJECT_KEY;

router.get('*', (req, res, next) => {
	console.log(bucketName);
	getObjectFromS3(bucketName, objectKey)
	.then(value => {
		console.log('updating and uploading bucket')
		value.views = value.views + 1;
		uploadJSONtoS3(bucketName, objectKey, value)
		.then(() => {
			console.log(value);
			//increment counter
			console.log('Visit');
			res.locals.visits = value.views;
			next();			
		})
		.catch(err => {
			console.error(err);
			next();
		});		
	})
	.catch(err => {
		console.error(err);
		next();
	});
});

module.exports = router;