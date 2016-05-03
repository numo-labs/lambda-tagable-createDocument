'use strict';

exports.initTagDoc = function (event) {
  return {
    _id: event._id,
    location: event.location || {lat: '', lon: ''},
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    metadata: event.metadata || [],
    content: event.content || {},
    markets: event.markets || {}
  };
};

exports.s3_create = require('./s3_create');
