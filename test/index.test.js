var assert = require('assert');
var index = require('../index');
var utils = require('aws-lambda-test-utils');
var mockContextCreator = utils.mockContextCreator;
var testHotelTag = require('./fixtures/test_hotel_tag.json');
var ctxOpts = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:LambdaTest:ci'
};
var sinon = require('sinon');
var handler = require('../lib/handler');

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
        assert.deepEqual(result, testHotelTag);
        done();
      },
      invokedFunctionArn: ctxOpts.invokedFunctionArn
    };
    index.handler(testHotelTag, context);
  });

  it('Lambda should fail if a tag doc fails to be created', function (done) {
    var mock = sinon.mock(handler);
    mock.expects('initTagDoc').once().callsArgWith(1, new Error('fake initTagDoc error'));
    var context = {
      invokedFunctionArn: ctxOpts.invokedFunctionArn,
      fail: function (err) {
        assert(err);
        mock.verify();
        return done();
      }
    };
    index.handler(testHotelTag, context);
  });

  it('Lambda should fail if uploading to S3 fails', function (done) {
    var mock = sinon.mock(handler);
    mock.expects('s3Create').once().callsArgWith(1, new Error('fake s3Create error'));

    var context = {
      invokedFunctionArn: ctxOpts.invokedFunctionArn,
      fail: function (err) {
        assert(err);
        mock.verify();
        return done();
      }
    };
    index.handler(testHotelTag, context);
  });
});
