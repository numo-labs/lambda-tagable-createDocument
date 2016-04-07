var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk');
var config = require('./config.js');
var handler = require('./lib/handler.js');

exports.handler = function (event, context) {
  // Check if an tag id is provided
  if (!event._id) {
    return context.fail(new Error('no _id provided'));
  }
  AwsHelper.init(context);
  // Initialise the new tag document
  var newTagDoc = handler.initTagDoc(event);
  // Get the existing tag document if it exists
  handler.getCurrentDoc(AwsHelper, event._id, function (err, currentTagDoc) {
    if (err) { return context.fail(err); }
    // Upload the new document (create or update) in CloudSearch
    handler.uploadTagDoc(AwsHelper, newTagDoc, function (err, res) {
      if (err) { return context.fail(err); }
      // check if doc already exists
      if (currentTagDoc) {
        // check if any non-inherited tags have changed
        var newLinkedTagsAdded = handler.checkNewLinksAdded(currentTagDoc.tags, newTagDoc.tags);
        // if new links have been added, trigger the inheritance indexer
        if (newLinkedTagsAdded) {
          handler.execInheritanceIndexer(event._id, function (err, data) {
            if (err) { return context.fail(err); }
            return context.suceed(data);
          });
        }
      } else {
        return context.succeed(res);
      }
    });
  });
};
