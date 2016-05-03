require('env2')('.env'); // Load Environment Variables - github.com/numo-labs/aws-lambda-deploy/issues/31
var AwsHelper = require('aws-lambda-helper');
var handler = require('./lib/handler.js');

exports.handler = function (event, context) {
  if (!event._id) { // Check if an tag id is provided
    return context.fail(new Error('no _id provided'));
  }
  AwsHelper.init(context);
  var newTagDoc = handler.initTagDoc(event);
  handler.s3_create(newTagDoc, function (err, data) {
    AwsHelper.failOnError(err, event, context);
    return context.succeed(newTagDoc);
  });
};
