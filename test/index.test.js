// var assert = require('assert');
// var index = require('./../index');
// var simple = require('simple-mock');
// var AwsHelper = require('aws-lambda-helper');
// var AWS = require('aws-sdk');
// var _ = require('lodash');
//
// var eventFixtures = require('./eventFixtures');
//
// describe('exports.handler function(event, context)', function () {
//   afterEach(function () {
//     simple.restore();
//   });
//
//   it('should throw an error if the event._id is not set', function (done) {
//     var context = {
//       'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:ci',
//       fail: function (err) {
//         assert.equal(err.message, 'no _id provided');
//         done();
//       },
//       succeed: function (data) {}
//     };
//     var event = {};
//
//     index.handler(event, context);
//   });
//
//   it('should create a doc and use the _id as displayname', function (done) {
//     var event = eventFixtures.getEvent();
//     event = _.omit(event, 'displayName');
//     var doc = index._internal.initDoc(event);
//     event.displayName = event._id;
//     assert.deepEqual(doc, event);
//     done();
//   });
//
//   it('should create a document, tags and content defaulted to []', function (done) {
//     var event = eventFixtures.getEvent();
//     event = _.omit(event, 'tags');
//     event = _.omit(event, 'metadata');
//     var doc = index._internal.initDoc(event);
//     event.tags = [];
//     event.metadata = [];
//     assert.deepEqual(doc, event);
//     done();
//   });
//
//   // it('should process an event successfully (cloudsearch mocked)', function (done) {
//   //   var context = {
//   //     'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod'
//   //   };
//
//   //   // AwsHelper.init(context);
//   //   // AwsHelper._cloudSearchDomain = new AWS.CloudSearchDomain({
//   //   //   endpoint: 'https://your-index.eu-west-1.cloudsearch.amazonaws.com',
//   //   //   region: AwsHelper.region
//   //   // });
//   //   // // stub the cloudsearch uploadDocuments function
//   //   // simple.mock(AwsHelper._cloudSearchDomain, 'uploadDocuments').callFn(function (params, cb) {
//   //   //   console.log(params);
//   //   //   return cb(null, params);
//   //   // });
//
//   //   // Create a new stubbed event
//   //   var event = eventFixtures.hotel_mhid_77bvb7p();
//
//   //   // Test the handler, assert and done in context function context.succeed
//   //   index._internal.processEvent(event, function (err, data) {
//   //     done(err);
//   //   });
//   // });
//
//   it('should process an event successfully (dynamodb mocked) by calling index.handler (fail)', function (done) {
//     var context = {
//       'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
//       'fail': function (result) {
//         assert.equal(result.message, 'fake-error');
//         done();
//       }
//     };
//
//     // Create a new stubbed event
//     var event = eventFixtures.getEvent();
//
//     // stub the SNS.publish function
//     simple.mock(index._internal, 'processEvent').callFn(function (params, cb) {
//       return cb(new Error('fake-error'), 'ok');
//     });
//
//     // Test the handler, assert and done in context function context.succeed
//     // Retruns data
//     index.handler(event, context);
//   });
//
//   it('should process an event successfully (mocked) by calling index.handler (succeed)', function (done) {
//     var context = {
//       'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
//       'succeed': function (result) {
//         assert.equal(result, 'ok');
//         done();
//       }
//     };
//
//     // Create a new stubbed event
//     var event = eventFixtures.getEvent();
//
//     // stub the SNS.publish function
//     simple.mock(index._internal, 'processEvent').callFn(function (params, cb) {
//       return cb(null, 'ok');
//     });
//
//     // Test the handler, assert and done in context function context.succeed
//     // Retruns data
//     index.handler(event, context);
//   });
//
//   describe('execInhertanceIndex', function () {
//     it('should be possible to trigger a inhertitance index when tags are different, ', function (done) {
//       var context = {
//         'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod'
//       };
//       // Create a new stubbed event
//       var _id = 'foo';
//       var oldTags = [
//         {
//           tagId: 'geo:geonames.2510769',
//           inherited: false,
//           active: true
//         },
//         {
//           tagId: 'geo:isearch.island',
//           inherited: false,
//           active: true
//         }
//       ];
//       var newTags = [
//         {
//           tagId: 'geo:geonames.2510769',
//           inherited: false,
//           active: true
//         },
//         {
//           tagId: 'geo:geonames.inherited_sample',
//           inherited: true,
//           active: true
//         },
//         {
//           tagId: 'geo:isearch.island',
//           inherited: false,
//           active: false
//         }
//       ];
//
//       // Mock the AWS Lambda Invoke
//       AwsHelper.init(context);
//       AwsHelper._Lambda = new AWS.Lambda();
//       // stub the cloudsearch uploadDocuments function
//       simple.mock(AwsHelper._Lambda, 'invoke').callFn(function (params, cb) {
//         console.log(params);
//         assert.equal(JSON.parse(params.Payload).tag, _id);
//         done();
//       });
//
//       // Test the handler, assert and done in context function context.succeed
//       // Retruns data
//       index._internal.execInhertanceIndex(_id, oldTags, newTags, function (err, result) {
//         done(err);
//       });
//     });
//   });
// });
