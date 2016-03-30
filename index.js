var AwsHelper = require('aws-lambda-helper');
var request = require('request');
var internal = {};

var AWS_GATEWAY_INTERNAL = 'https://jo7a6ogpr6.execute-api.eu-west-1.amazonaws.com/';

exports.handler = function (event, context) {
  AwsHelper.init(context);

  // C heck if an ID is provided
  if (!event._id) {
    return context.fail(new Error('no id provided'));
  }

  internal.processEvent(event, function (err, data) {
    if (err) return context.fail(err); // an error occurred
    return context.succeed(data); // successful response
  });
};

internal.processEvent = function (event, cb) {
  var doc = internal.initDoc(event);

  var tags = getTags(doc.tags);

  var item = {
    _id: doc._id,
    displayName: doc.displayName,
    // geohash:
    activeTags: tags.active,
    disabledTags: tags.disabled,
    tags: doc.tags,
    metadata: doc.metadata
  };

  request.post(
    {
      url: AWS_GATEWAY_INTERNAL + AwsHelper.env + '/taggable/tag-' + AwsHelper.env, // Used the gateway as reverse proxy to our elastic search server
      method: 'POST',
      json: true,
      body: item
    },
    function (err, result) {
      console.log(err, result);
      return cb(err, result);
    }
  );

  function getTags (tags) {
    var result = {
      active: [],
      disabled: []
    };
    tags.forEach(function (item) {
      if (item.active) {
        result.active.push(item.tagId);
      } else {
        result.disabled.push(item.tagId);
      }
    });
    return result;
  }
};

internal.initDoc = function (event) {
  return {
    _id: event._id,
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    metadata: event.metadata || []
  };
};

exports._internal = internal;
