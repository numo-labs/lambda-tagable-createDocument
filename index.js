var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk');
var internal = {};

var config = {
  'ci': 'https://doc-taggable-ci-dm62zw5dvzelh2nbvr3ao276zy.eu-west-1.cloudsearch.amazonaws.com'
};

exports.handler = function (event, context) {
  AwsHelper.init(context);
  if (!AwsHelper._cloudSearchDomain) {
    AwsHelper._cloudSearchDomain = new AWS.CloudSearchDomain({
      endpoint: config[AwsHelper.env],
      region: AwsHelper.region
    });
  }

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
      location: [doc.location.lat, doc.location.lon]
      displayname: doc.displayName,
      amenitytags: tags.amenitytags,
      geotags: tags.geotags,
      hoteltags: tags.hoteltags,
      marketingtags: tags.marketingtags,
      tiletags: tags.tiletags,
      disabledtags: tags.disabled,
      doc: JSON.stringify(doc)
    }
  }];

  AwsHelper._cloudSearchDomain.uploadDocuments({
    contentType: 'application/json',
    documents: JSON.stringify(docsToIndex)
  }, function (err, data) {
    return cb(err, data);
  });

  function getTags (tags) {
    var result = {
      amenitytags: [],
      geotags: [],
      hoteltags: [],
      marketingtags: [],
      tiletags: [],
      disabled: []
    };
    tags.forEach(function (item) {
      if (item.active) {
        switch (item.tagId.split(':')[0]) {
          case 'geo':
            result.geotags.push(item.tagId);
            break;
          case 'hotel':
            result.hoteltags.push(item.tagId);
            break;
          case 'marketing':
            result.marketingtags.push(item.tagId);
            break;
          case 'tile':
            result.tiletags.push(item.tagId);
            break;
          case 'amenity':
            result.amenitytags.push(item.tagId);
            break;
        }
      } else {
        result.disabled.push(item.tagId);
      }
    });
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
};

internal.initDoc = function (event) {
  return {
    _id: event._id,
    location: event.location || {lat: '', lon: ''},
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    metadata: event.metadata || []
  };
};

exports._internal = internal;
