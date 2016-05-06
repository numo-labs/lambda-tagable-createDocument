require('env2')('.env');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var lambda = new AWS.Lambda();

module.exports = function get_geo_tags (record, callback) {
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
