var assert = require('assert');
var index = require('../index');
var utils = require('aws-lambda-test-utils');
var mockContextCreator = utils.mockContextCreator;
var mockData = require('./utils/mockData.js');
var ctxOpts = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:LambdaTest:ci'
};

describe('Index handler tests', function () {
  it('Context.fail: called when no id is provided in the event', function (done) {
    function test (err) {
      assert.equal(err.message, 'no _id provided');
      done();
    }
    var context = mockContextCreator({}, test);
    index.handler({}, context);
  });

  it('Context.succeed: called with the newTagDoc', function (done) {
    var context = {
      succeed: function (result) { // here's your test:
        assert.deepEqual(result, mockData.test_hotel_tag);
        done();
      },
      invokedFunctionArn: ctxOpts.invokedFunctionArn
    };
    index.handler(mockData.test_hotel_tag, context);
  });
  // it('Context.succeed: called with the updated tag if no new links have been added', function (done) {
  //   var uploadRes = {adds: 1, deletes: 0, warnings: []};
  //   var currentTagDoc = {
  //     _id: '1234',
  //     tags: mockData.currentLinkedTags
  //   };
  //   simple.mock(handler, 'getCurrentDoc').callbackWith(null, currentTagDoc);
  //   simple.mock(handler, 'uploadTagDoc').callbackWith(null, uploadRes);
  //   function test (result) {
  //     assert.deepEqual(result, JSON.stringify(mockData.updatedTagDoc));
  //     simple.restore();
  //     done();
  //   }
  //   var context = mockContextCreator(ctxOpts, test);
  //   index.handler(currentTagDoc, context);
  // });
  // it('Context.succeed: called with the new tag even if execInheritanceIndexer if tag exists and has been modified (graphql expects a tag object to be returned)', function (done) {
  //   var uploadRes = {adds: 1, deletes: 0, warnings: []};
  //   var currentTagDoc = {
  //     _id: '1234',
  //     tags: mockData.currentLinkedTags
  //   };
  //   var newTagDoc = {
  //     _id: '1234',
  //     location: {
  //       lat: '',
  //       lon: ''
  //     },
  //     displayName: '1234',
  //     tags: mockData.newLinkedTags,
  //     metadata: [],
  //     content: {}
  //   };
  //   simple.mock(handler, 'getCurrentDoc').callbackWith(null, currentTagDoc);
  //   simple.mock(handler, 'uploadTagDoc').callbackWith(null, uploadRes);
  //   simple.mock(handler, 'execInheritanceIndexer').callbackWith(null, {});
  //   function test (result) {
  //     assert.deepEqual(JSON.parse(result), newTagDoc);
  //     simple.restore();
  //     done();
  //   }
  //   var context = mockContextCreator(ctxOpts, test);
  //   index.handler(newTagDoc, context);
  // });
  // it('Context.succeed: called with an error if execInheritanceIndexer returns an error', function (done) {
  //   var uploadRes = {adds: 1, deletes: 0, warnings: []};
  //   var currentTagDoc = {
  //     _id: '1234',
  //     tags: mockData.currentLinkedTags
  //   };
  //   var newTagDoc = {
  //     _id: '1234',
  //     tags: mockData.newLinkedTags
  //   };
  //   var error = new Error('lambda invoke error');
  //   simple.mock(handler, 'getCurrentDoc').callbackWith(null, currentTagDoc);
  //   simple.mock(handler, 'uploadTagDoc').callbackWith(null, uploadRes);
  //   simple.mock(handler, 'execInheritanceIndexer').callbackWith(error);
  //   function test (err) {
  //     assert.deepEqual(err, error);
  //     simple.restore();
  //     done();
  //   }
  //   var context = mockContextCreator(ctxOpts, test);
  //   index.handler(newTagDoc, context);
  // });
});
