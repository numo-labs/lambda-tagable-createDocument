var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk');
var internal = {};

var config = {
  'ci': 'https://doc-taggable-ci-dm62zw5dvzelh2nbvr3ao276zy.eu-west-1.cloudsearch.amazonaws.com'
};

exports.handler = function (event, context) {
  AwsHelper.init(context);

  // C heck if an ID is provided
  if (!event._id) {
    return context.fail(new Error('no _id provided'));
  }

  internal.processEvent(event, function (err, data) {
    if (err) return context.fail(err); // an error occurred
    return context.succeed(data); // successful response
  });
};

internal.processEvent = function (event, cb) {
  var doc = internal.initDoc(event);

  var tags = getTags(doc.tags);

  var docsToIndex = [{
    type: 'add',
    id: doc._id,
    fields: {
      id: doc._id,
      displayname: doc.displayName,
      activetags: tags.active,
      disabledtags: tags.disabled,
      doc: JSON.stringify(doc)
    }
  }];

  var csd = new AWS.CloudSearchDomain({
    endpoint: config[AwsHelper.env],
    region: AwsHelper.region
  });

  csd.uploadDocuments({
    contentType: 'application/json',
    documents: JSON.stringify(docsToIndex)
  }, function (err, data) {
    return cb(err, data);
  });

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
