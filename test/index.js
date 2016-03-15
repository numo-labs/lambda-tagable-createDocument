'use strict';

var assert = require('assert');
var index = require('./../index');
var simple = require('simple-mock');
var AwsHelper = require('aws-lambda-helper');
var _ = require('lodash');

var eventFixtures = require('./eventFixtures');

describe('exports.handler function(event, context)', function () {
  afterEach(function () {
    simple.restore();
  });

  it('should throw an error if the event._id is not set', function (done) {
      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
        fail: function(err){
          assert.equal(err.message, 'no _id provided');
          done();
        },
        succeed: function(data){

        }
      };
      var event = {};

      index.handler(event, context);
  });

  it('should create a valid doc', function (done) {
      var event = eventFixtures.getEvent();
      var doc = index._internal.initDoc(event);
      assert.deepEqual(doc, event);
      done()
  });

  it('should create a doc and use the id as displayname', function (done) {
      var event = eventFixtures.getEvent();
      event = _.omit(event, 'displayName');
     var doc = index._internal.initDoc(event);
      event.displayName = event._id;
      assert.deepEqual(doc, event);
      done()
  });

    it('should create a document, tags and content defaulted to []', function (done) {
      var event = eventFixtures.getEvent();
      event = _.omit(event, 'tags');
      event = _.omit(event, 'content');
      var doc = index._internal.initDoc(event);
      event.tags = [];
      event.content = [];
      assert.deepEqual(doc, event);
      done()
  });


  it('should process an event successfully (dynamodb mocked)', function (done) {
      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod'
      };
      
      AwsHelper.init(context);

      // Init our dynamodb object, so we can stub the putItem function
      AwsHelper._DynamoDB = new AwsHelper._AWS.DynamoDB();

      // Create a new stubbed event
      var event = eventFixtures.getEvent();

      // stub the SNS.publish function
      simple.mock(AwsHelper._DynamoDB, 'putItem').callFn(function (params, cb) {
        return cb(null, params);
      });

      //Test the handler, assert and done in context function context.succeed
      index._internal.processEvent(event, function(err, data){
        assert.deepEqual(data, 
          {
            "Item": {
              "_id": {
                "S": "di-oof"
              },
              "displayName": {
                "S": "foo-display-name"
              },
              "activeTags": {
                "SS": ["geography:geonames.123"]
              },
              "disabledTags": {
                "SS": ["geography:geonames.125"]
              },
              "doc": {
                "S": "{\"_id\":\"foo-id\",\"displayName\":\"foo-display-name\",\"tags\":[{\"tagId\":\"geography:geonames.123\",\"tagType\":\"geography\",\"source\":\"tag:source.user.12234\",\"active\":true},{\"tagId\":\"geography:geonames.125\",\"tagType\":\"geography\",\"source\":\"tag:source.user.12235\",\"active\":false}],\"content\":[{\"key\":\"label:en\",\"values\":[\"Hotel ABC\"]},{\"key\":\"search:en\",\"values\":[\"Hotel ABC\"]}]}"
              }
            },
            "TableName": "numo-tagable-prod"
          }
        );
        done();
      });
    });

   it('should process an event successfully (dynamodb mocked) by calling index.handler (fail)', function (done) {
      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
        'fail': function(result){
            assert.equal(result.message,'fake-error');
            done();
        }
      };
      
      // Create a new stubbed event
      var event = eventFixtures.getEvent();

      // stub the SNS.publish function
      simple.mock(index._internal, 'processEvent').callFn(function (params, cb) {
        return cb(new Error('fake-error'), 'ok');
      });

      //Test the handler, assert and done in context function context.succeed
      //Retruns data
      index.handler(event, context); 
    });

   it('should process an event successfully (dynamodb mocked) by calling index.handler (succeed)', function (done) {
      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
        'succeed': function(result){
            assert.equal(result, 'ok');
            done();
        }
      };
      
      // Create a new stubbed event
      var event = eventFixtures.getEvent();

      // stub the SNS.publish function
      simple.mock(index._internal, 'processEvent').callFn(function (params, cb) {
        return cb(null, 'ok');
      });

      //Test the handler, assert and done in context function context.succeed
      //Retruns data
      index.handler(event, context); 
    });
});

