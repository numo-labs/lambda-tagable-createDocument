require('env2')('.env'); // github.com/numo-labs/aws-lambda-deploy/issues/31
var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;
var s3bucket = new AWS.S3({params: {Bucket: process.env.AWS_S3_BUCKET}});

module.exports = function s3_create (record, callback) {
  var type = record._id.split(':')[0];
  var subtype = record._id.split(':')[1].split('.')[0];
  var filepath = type + '/' + subtype + '/' + record._id + '.json';
  var env = AwsHelper.env; // initialised in index.js

  var params = {
    Key: env + '/' + filepath,
    Body: JSON.stringify(record, null, 2),
    ContentType: 'application/json',
    ACL: 'public-read'
  };
  s3bucket.upload(params, function (err, data) {
    AwsHelper.log.info({s3data: data, err: err}, 'Uploading to s3');
    return callback(err, data);
  });
};
