var assert = require('assert');
var handler = require('../lib/handler.js');
// var simple = require('simple-mock');
var AwsHelper = require('aws-lambda-helper');
var AWS = require('aws-sdk-mock');
var _ = require('lodash');

var utils = require('./mockData.js');
var mockEvent = utils.event;
var mockCloudSearchResult = utils.mockCloudSearchResult;

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


  describe('execInhertanceIndex', function () {
    it('should be possible to trigger a inhertitance index when tags are different, ', function (done) {
      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod'
      };
      // Create a new stubbed event
      var _id = 'foo';
      var oldTags = [
        {
          tagId: 'geo:geonames.2510769',
          inherited: false,
          active: true
        },
        {
          tagId: 'geo:isearch.island',
          inherited: false,
          active: true
        }
      ];
      var newTags = [
        {
          tagId: 'geo:geonames.2510769',
          inherited: false,
          active: true
        },
        {
          tagId: 'geo:geonames.inherited_sample',
          inherited: true,
          active: true
        },
        {
          tagId: 'geo:isearch.island',
          inherited: false,
          active: false
        }
      ];

      // Mock the AWS Lambda Invoke
      AwsHelper.init(context);
      AwsHelper._Lambda = new AWS.Lambda();
      // stub the cloudsearch uploadDocuments function
      simple.mock(AwsHelper._Lambda, 'invoke').callFn(function (params, cb) {
        console.log(params);
        assert.equal(JSON.parse(params.Payload).tag, _id);
        done();
      });

      // Test the handler, assert and done in context function context.succeed
      // Retruns data
      index._internal.execInhertanceIndex(_id, oldTags, newTags, function (err, result) {
        done(err);
      });
    });
  });
});
