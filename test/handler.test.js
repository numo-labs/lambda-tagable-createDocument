var assert = require('assert');
var handler = require('../lib/handler.js');
var simple = require('simple-mock');
var AWS = require('aws-sdk-mock');
var AwsHelper = require('aws-lambda-helper');

var mockData = require('./mockData.js');
var mockEvent = mockData.event;
var mockCloudSearchResult = mockData.mockCloudSearchResult;

describe('Handler functions', function () {
  it('initTagDoc: should create a doc object from the event', function (done) {
    var doc = handler.initTagDoc(mockEvent);
    assert.deepEqual(doc, mockEvent);
    done();
  });
  it('initTagDoc: should use the id as the displayName, tags and metadata defaulted to []', function (done) {
    var event = { _id: '12345' };
    var doc = handler.initTagDoc(event);
    assert.deepEqual(Object.keys(doc), ['_id', 'location', 'displayName', 'tags', 'metadata']);
    assert.deepEqual(doc.tags, []);
    assert.deepEqual(doc.metadata, []);
    assert.equal(doc.displayName, event._id);
    done();
  });
  it('getCurrentDoc: returns an error if there is a cloudsearch error', function (done) {
    var error = new Error('cloudsearch error');
    AWS.mock('CloudSearchDomain', 'search', function (_, callback) {
      return callback(error);
    });
    handler.getCurrentDoc('12345', function (err, data) {
      assert.equal(err, error);
      AWS.restore();
      done();
    });
  });
  it('getCurrentDoc: returns the tag document if it exists', function (done) {
    AWS.mock('CloudSearchDomain', 'search', function (_, callback) {
      return callback(null, mockCloudSearchResult);
    });
    handler.getCurrentDoc('12345', function (err, data) {
      assert.equal(err, null);
      assert.deepEqual(data, {id: 12345});
      AWS.restore();
      done();
    });
  });
  it('getCurrentDoc: returns null if the doc doesnt exist', function (done) {
    AWS.mock('CloudSearchDomain', 'search', function (_, callback) {
      return callback(null, {hits: {found: 0}});
    });
    handler.getCurrentDoc('12345', function (err, data) {
      assert.equal(err, null);
      assert.deepEqual(data, null);
      AWS.restore();
      done();
    });
  });
  it('sortLinkedTags: returns an object with the tags sorted by type', function (done) {
    var tags = [
      { tagId: 'hotel:12345', active: true },
      { tagId: 'amenity:12345', active: true },
      { tagId: 'geo:12345', active: true },
      { tagId: 'tile:12345', active: true },
      { tagId: 'marketing:12345', active: true },
      { tagId: 'marketing:12345', active: false }
    ];
    var sortedTags = handler.sortLinkedTags(tags);
    assert.deepEqual(Object.keys(sortedTags), ['amenitytags', 'geotags', 'hoteltags', 'marketingtags', 'tiletags', 'disabled', 'classes']);
    assert.equal(sortedTags.amenitytags.length, 1);
    assert.equal(sortedTags.hoteltags.length, 1);
    assert.equal(sortedTags.geotags.length, 1);
    assert.equal(sortedTags.tiletags.length, 1);
    assert.equal(sortedTags.marketingtags.length, 1);
    assert.equal(sortedTags.disabled.length, 1);
    done();
  });
  it('checkNewLinksAdded: returns true if the number of non inherited tags in the tags array has changed', function (done) {
    var oldLinkedTags = [
      { tagId: 'hotel:12345', active: true, inherited: true },
      { tagId: 'amenity:12345', active: true, inherited: false },
      { tagId: 'geo:12345', active: true, inherited: true },
      { tagId: 'tile:12345', active: true, inherited: false },
      { tagId: 'marketing:12345', active: true, inherited: false },
      { tagId: 'marketing:1234', active: false, inherited: false }
    ];
    var newLinkedTags = [
      { tagId: 'hotel:12345', active: true, inherited: true },
      { tagId: 'amenity:12345', active: true, inherited: false },
      { tagId: 'geo:12345', active: true, inherited: true },
      { tagId: 'tile:12345', active: true, inherited: false },
      { tagId: 'marketing:1234', active: true, inherited: false }
    ];
    var newLinkedTagsAdded = handler.checkNewLinksAdded(oldLinkedTags, newLinkedTags);
    assert.equal(newLinkedTagsAdded, true);
    done();
  });
  it('checkNewLinksAdded: returns false if the number of non inherited tags in the tags array has not changed', function (done) {
    var oldLinkedTags = [
      { tagId: 'hotel:12345', active: true, inherited: true },
      { tagId: 'amenity:12345', active: true, inherited: false }
    ];
    var newLinkedTags = [
      { tagId: 'hotel:12345', active: true, inherited: true },
      { tagId: 'amenity:12345', active: true, inherited: false }
    ];
    var newLinkedTagsAdded = handler.checkNewLinksAdded(oldLinkedTags, newLinkedTags);
    assert.equal(newLinkedTagsAdded, false);
    done();
  });
  it('uploadTagDoc: should upload the document to cloudsearch and return the data', function (done) {
    var uploadRes = {adds: 1, deletes: 0, warnings: []};
    AWS.mock('CloudSearchDomain', 'uploadDocuments', function (_, callback) {
      return callback(null, uploadRes);
    });
    handler.uploadTagDoc(mockEvent, function (err, data) {
      assert.equal(err, null);
      assert.deepEqual(data, uploadRes);
      AWS.restore();
      done();
    });
  });
  it('uploadTagDoc: returns an error if there is a cloudsearch error', function (done) {
    var error = new Error('cloudsearch upload error');
    AWS.mock('CloudSearchDomain', 'uploadDocuments', function (_, callback) {
      return callback(error);
    });
    handler.uploadTagDoc(mockEvent, function (err, data) {
      assert.equal(err, error);
      AWS.restore();
      done();
    });
  });
  it('execInheritanceIndexer: calls the callback with an error if there is a lambda invoke error', function (done) {
    var error = new Error('lambda invoke error');
    simple.mock(AwsHelper.Lambda, 'invoke').callbackWith(error);
    handler.execInheritanceIndexer('1234', function (err, data) {
      assert.equal(err, error);
      simple.restore();
      done();
    });
  });
  it('execInheritanceIndexer: calls the callback with the response from the lambda', function (done) {
    simple.mock(AwsHelper.Lambda, 'invoke').callbackWith(null, {});
    handler.execInheritanceIndexer('1234', function (err, data) {
      assert.equal(err, null);
      assert.deepEqual(data, {});
      simple.restore();
      done();
    });
  });
});
