const AWS = require('aws-sdk');

AWS.config.update({
	region: 'ap-southeast-2'
});

const S3 = new AWS.S3();

async function createS3Bucket(bucketName){
	try{
		await S3.createBucket({Bucket: bucketName}).promise();
		console.log(`Created bucket: ${bucketName}`);
	}
	catch(err){
		if(err.statusCode === 409){
			console.log("Bucket already exists");
		}
		else{
			console.log("Issue when creating bucket: ", err);
		}
	}
}

async function uploadJSONtoS3(bucketName, objectKey, jsonData){
	const params = {
		Bucket: bucketName,
		Key: objectKey,
		Body: JSON.stringify(jsonData),
		ContentType: 'application/json',
	};

	try{
		await S3.putObject(params).promise();
		console.log("JSON uploaded successfully");
	}
	catch(err){
		console.error("Error uploading file", err);
	}
}

async function getObjectFromS3(bucketName, objectKey){
	const params = {
		Bucket: bucketName,
		Key: objectKey,
	};

	try{
		const data = await S3.getObject(params).promise();
		const parsedData = JSON.parse(data.Body.toString('utf-8'));
		return parsedData;
	}
	catch(err){
		console.error("unable to get object: ", err);
		return ({views: 0})
	}
}

module.exports = {createS3Bucket, uploadJSONtoS3, getObjectFromS3};