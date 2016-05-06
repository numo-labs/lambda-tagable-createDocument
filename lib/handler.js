'use strict';
var geonames_lambda = require('./geonames_lambda');

exports.initTagDoc = function (event, callback) {
  var tag = {
    _id: event._id,
    location: event.location || {lat: '', lon: ''},
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    metadata: event.metadata || [],
    content: event.content || {},
    markets: event.markets || {},
    active: event.active
  };
  // to get geonames tag/hierarchy we need to trigger the tag-e-geo lambda
  if (tag.location && tag.location.lat && tag.location.lon && tag._id.match(/hotel:mhid/)) {
    geonames_lambda(tag, function (err, data) {
      if (!err && !data.FunctionError) {
        var res = JSON.parse(data.Payload); // parse the result returned by Geo Lambda
        var g = res[res.length - 1];        // get the last geo tag in the array
        if (tag.tags && tag.tags.length > 0) { //
          var geo_tag_index = -1; // no geo tag exists
          tag.tags.forEach((t, index) => { // a Hotel tag should only have a single Geo Tag
            // over-write the existin geonames tag
            if (t.node.match(/geonames/)) {
              geo_tag_index = index;
            }
          });
        }
        if (geo_tag_index > -1) { // over-write existing geo tag in tags array
          tag.tags[geo_tag_index] = {
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
      }
      return callback(err, tag);
    });
  } else {
    return callback(null, tag);
  }
};

exports.s3_create = require('./s3_create');
