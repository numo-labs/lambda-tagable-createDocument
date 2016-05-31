'use strict';
var geonamesLambda = require('./geonames_lambda');
var AwsHelper = require('aws-lambda-helper');

exports.initTagDoc = function (event, callback) {
  var tag = {
    _id: event._id,
    location: event.location || {lat: '', lon: ''},
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    metadata: event.metadata || [],
    content: event.content || {},
    markets: event.markets || {},
    active: event.active,
    description: event.description || ''
  };
  // to get geonames tag/hierarchy we need to trigger the tag-e-geo lambda
  if (tag.location && tag.location.lat && tag.location.lon && tag._id.match(/hotel:mhid/)) {
    geonamesLambda(tag, function (err, data) {
      if (err || data.FunctionError) {
        var err2 = err || new Error(data.FunctionError);
        AwsHelper.log.info(err2);
        return callback(err2, tag);
      }

      var res = JSON.parse(data.Payload); // parse the result returned by Geo Lambda
      var g = res[res.length - 1];        // get the last geo tag in the array
      if (tag.tags && tag.tags.length > 0) { //
        var geoTagIndex = -1; // no geo tag exists
        tag.tags.forEach((t, index) => { // a Hotel tag should only have a single Geo Tag
          // over-write the existin geonames tag
          if (t.node.match(/geonames/)) {
            geoTagIndex = index;
          }
        });
      }
      if (geoTagIndex > -1) { // over-write existing geo tag in tags array
        tag.tags[geoTagIndex] = {
          'node': g._id,
          'edge': 'LOCATED_IN',
          'displayName': g.displayName,
          'source': 'geonames',
          'active': true
        };
      } else { // create it from scratch
        tag.tags.push({
          'node': g._id,
          'edge': 'LOCATED_IN',
          'displayName': g.displayName,
          'source': 'geonames',
          'active': true
        });
      }
      return callback(null, tag);
    });
  } else {
    process.nextTick(callback.bind(null, null, tag));
  }
};

exports.s3Create = require('./s3_create');
