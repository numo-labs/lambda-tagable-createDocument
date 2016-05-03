var assert = require('assert');
var index = require('../index');
var utils = require('aws-lambda-test-utils');
var mockContextCreator = utils.mockContextCreator;
var test_hotel_tag = require('./fixtures/test_hotel_tag.json');
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
        assert.deepEqual(result, test_hotel_tag);
        done();
      },
      invokedFunctionArn: ctxOpts.invokedFunctionArn
    };
    index.handler(test_hotel_tag, context);
  });
});
