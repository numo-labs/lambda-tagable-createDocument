require('env2')('.env'); // Load Environment Variables - github.com/numo-labs/aws-lambda-deploy/issues/31
var AwsHelper = require('aws-lambda-helper');
var handler = require('./lib/handler.js');

exports.handler = function (event, context, callback) {
  if (!event._id) { // Check if an tag id is provided
    return callback(new Error('no _id provided'));
  }

  AwsHelper.init(context, event);

  handler.initTagDoc(event, function (err, newTagDoc) {
    if (err) {
      return callback(err);
    }

    handler.s3Create(newTagDoc, function (err, data) {
      if (err) {
        return callback(err);
      }

      AwsHelper.log.info({
        tag: {
          eventId: event._id,
          location: data.Location
        }
      }, 'Tag saved to s3');
      return callback(null, newTagDoc);
    });
  });
};
