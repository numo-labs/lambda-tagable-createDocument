require('env2')('.env'); // Load Environment Variables - github.com/numo-labs/aws-lambda-deploy/issues/31
var AwsHelper = require('aws-lambda-helper');
var handler = require('./lib/handler.js');

exports.handler = function (event, context, callback) {
  AwsHelper.init(context, event);
  var log = AwsHelper.Logger(require('./package.json').name);

  if (!event._id) { // Check if an tag id is provided
    var err = new Error('no _id provided');
    log.info({
      err: err,
      event: event
    });
    return callback(err);
  }

  handler.initTagDoc(event, function (err, newTagDoc) {
    if (err) {
      log.info(err);
      return callback(err);
    }

    handler.s3Create(newTagDoc, function (err, data) {
      if (err) {
        log.info(err);
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
