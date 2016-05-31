require('env2')('.env');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

module.exports = function getGeoTags (record, callback) {
  var params = { // this requires the correct ARN in your Environment Variables
    FunctionName: 'tag-e-geo-v1', // lambda function to invoke
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(record)
  };

  lambda.invoke(params, function (err, data) {
    callback(err, data);
  });
};
