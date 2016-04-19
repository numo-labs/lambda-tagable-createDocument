'use strict';
var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk');
var config = require('../config.js');
var _ = require('lodash');
var csdConfig = {
  endpoint: config.cloudsearch.ci,
  region: 'eu-west-1'
};

/**
* Function to initialise a tag document object with data from the event argument
* @param {Object} - lambda event object
*/

exports.initTagDoc = function (event) {
  return {
    _id: event._id,
    location: event.location || {lat: '', lon: ''},
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    metadata: event.metadata || [],
    content: event.content || {}
  };
};

/**
* Function to launch a cloud search query and return the tag document if it exists
* @param {String} - tag id
* @param {Function} - callback which is called with the err and full tag document
*/

exports.getCurrentDoc = function (id, cb) {
  var csd = new AWS.CloudSearchDomain(csdConfig);
  var params = {
    query: "id:'" + id + "'",
    queryParser: 'structured'
  };
  csd.search(params, function (err, data) {
    if (err) return cb(err);
    var docExists = data && data.hits && (data.hits.found === 1);
    var doc = docExists ? JSON.parse(data.hits.hit[0].fields.doc[0]) : null;
    return cb(null, doc);
  });
};

/**
* Function to create or update the document in CloudSearch
* @param {Object} - new tag document
* @param {Function} - callback which is called with an error and the uploaded doc
*/

exports.uploadTagDoc = function (doc, cb) {
  var csd = new AWS.CloudSearchDomain(csdConfig);
  var tagData = sortLinkedTags(doc.tags);
  var labels = _.keyBy(doc.metadata, 'key');
  var docsToUpload = [{
    type: 'add',
    id: doc._id,
    fields: {
      id: doc._id,
      location: doc.location.lat + ', ' + doc.location.lon,
      displayname: doc.displayName,
      amenitytags: tagData.amenitytags,
      geotags: tagData.geotags,
      hoteltags: tagData.hoteltags,
      marketingtags: tagData.marketingtags,
      tiletags: tagData.tiletags,
      classes: _.uniq(tagData.classes), // at the moment the classes array is empty
      doc: JSON.stringify(doc),
      search_da: _.get(labels, 'search:da.values', []).join(', '),
      search_en: _.get(labels, 'search:en.values', []).join(', ')
    }
  }];
  csd.uploadDocuments({
    contentType: 'application/json',
    documents: JSON.stringify(docsToUpload)
  }, function (err, data) {
    return cb(err, data);
  });
};

/**
* Function to sort the linked tags into index fields based on tag type and if active is true
* @param {Array} - An array of linked tags
*/

function sortLinkedTags (tags) {
  var result = {
    amenitytags: [],
    geotags: [],
    hoteltags: [],
    marketingtags: [],
    tiletags: [],
    disabled: [],
    classes: []
  };
  return tags.reduce(function (res, tag) {
    var type = tag.tagId.split(':')[0] + 'tags'; // e.g. amenitytags
    if (tag.active) {
      res[type].push(tag.tagId);
    } else {
      res.disabled.push(tag.tagId);
    }
    return res;
  }, result);
}

/**
* Function to check if the non inherited linked tags of the modified tag have changed
* @param {Array} - An array of linked tags
*/

exports.checkNewLinksAdded = function (oldLinkedTags, newLinkedTags) {
  var oldNonInheritedTags = _.filter(oldLinkedTags, ['inherited', false]); // get all first level linked tags
  var newNonInheritedTags = _.filter(newLinkedTags, ['inherited', false]);
  var diff = _.differenceWith(oldNonInheritedTags, newNonInheritedTags, _.isEqual);
  return diff.length > 0;
};

/**
* Function to call the lambda-taggable-inheritance-indexer to re-index all the tags linked by the modified tag
* @param {Array} - tag id of the modified tagI
* @param {Function} - callback which is called with the err and result from lambda invocation
*/

exports.execInheritanceIndexer = function (id, cb) {
  var params = {
    FunctionName: config.lambda,
    Payload: {tag: id},
    InvocationType: 'RequestResponse'
  };
  AwsHelper.Lambda.invoke(params, function (err, data) {
    if (err) {
      console.log('Inheritance Indexer invoke err', err);
      return cb(err);
    } else {
      return cb(null, data);
    }
  });
};

exports.sortLinkedTags = sortLinkedTags; // for testing
