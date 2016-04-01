var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk');
var internal = {};
var _ = require('lodash');

var config = {
  ci: 'https://doc-taggable-ci-dm62zw5dvzelh2nbvr3ao276zy.eu-west-1.cloudsearch.amazonaws.com',
  indexLambdaFunctionName: 'lambda-taggable-inheritance-indexer-v1'
};

exports.handler = function (event, context) {
  AwsHelper.init(context);
  if (!AwsHelper._cloudSearchDomain) {
    AwsHelper._cloudSearchDomain = new AWS.CloudSearchDomain({
      endpoint: config[AwsHelper.env],
      region: AwsHelper.region
    });
  }
  // Check if an ID is provided
  if (!event._id) {
    return context.fail(new Error('no _id provided'));
  }
  internal.processEvent(event, function (err, data) {
    if (err) return context.fail(err); // an error occurred
    return context.succeed(data); // successful response
  });
};

internal.processEvent = function (event, cb) {
  // Initialise the document
  var newDoc = internal.initDoc(event);
  // Get the existing document if it exists and use it to check if non-inherited tags have been changed
  internal.getCurrentDoc(event._id, function (err, oldDoc) {
    if (err) return cb(err);
    // Index the new document (create or update) in CloudSearch
    internal.indexNewDoc(newDoc, function (err, data) {
      if (err) return cb(err);
      // Trigger a inheritance indexer if non inharitance tags have been changed
      if (oldDoc) {
        internal.execInhertanceIndex(newDoc._id, oldDoc.tags, newDoc.tags, function (err) {
          cb(err, data);
        });
      } else {
        cb(err, data);
      }
    });
  });
};

internal.execInhertanceIndex = function (_id, oldTags, newTags, cb) {
  oldTags = _.filter(oldTags, ['inherited', false]);
  newTags = _.filter(newTags, ['inherited', false]);
  var diff = _.differenceWith(oldTags, newTags, _.isEqual);
  if (diff.length > 0) {
    var params = {
      FunctionName: config.indexLambdaFunctionName,
      Payload: {tag: _id},
      InvocationType: 'RequestResponse'
    };
    AwsHelper.Lambda.invoke(params, function (err, data) {
      if (err) return console.log(err);
      cb(err);
    });
  } else {
    cb(null);
  }
};

internal.getCurrentDoc = function (_id, cb) {
  // Get the document
  var doc = null;
  var params = {
    query: "id:'" + _id + "'",
    queryParser: 'structured'
  };
  AwsHelper._cloudSearchDomain.search(params, function (err, data) {
    if (err) return cb(err);
    if (data && data.hits && (data.hits.found === 1)) {
      doc = JSON.parse(data.hits.hit[0].fields.doc[0]);
    }
    cb(null, doc);
  });
};

internal.indexNewDoc = function (doc, cb) {
  var tags = internal.getTags(doc.tags);
  var docsToIndex = [{
    type: 'add',
    id: doc._id,
    fields: {
      id: doc._id,
      location: doc.location.lat + ', ' + doc.location.lon,
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

internal.getTags = function (tags) {
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
  return result;
};

exports._internal = internal;
