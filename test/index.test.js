var assert = require('assert');
var index = require('../index');
var simple = require('simple-mock');
var AWS = require('aws-sdk');
var utils              = require('aws-lambda-test-utils')
var mockContextCreator = utils.mockContextCreator;
var handler = require('../lib/handler.js');

var ctxOpts = {
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:ci'
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
  it('Context.fail: called when error returned from getCurrentDoc', function (done) {
    var error = new Error('cloudsearch error');
    simple.mock(handler, 'getCurrentDoc').callbackWith(error);
    function test (err) {
      assert.equal(err, error);
      simple.restore();
      done();
    }
    var context = mockContextCreator(ctxOpts, test);
    index.handler({_id: '1234'}, context);
  });
  it('Context.fail: called when error returned from uploadTagDoc', function (done) {
    var error = new Error('cloudsearch error');
    simple.mock(handler, 'getCurrentDoc').callbackWith(null, {});
    simple.mock(handler, 'uploadTagDoc').callbackWith(error);
    function test (err) {
      assert.equal(err, error);
      simple.restore();
      done();
    }
    var context = mockContextCreator(ctxOpts, test);
    index.handler({_id: '1234'}, context);
  });
  it('Context.suceed: called with the result of uploadTagDoc if tag is new ', function (done) {
    var uploadRes = {adds: 1, deletes: 0, warnings: []};
    simple.mock(handler, 'getCurrentDoc').callbackWith(null, null);
    simple.mock(handler, 'uploadTagDoc').callbackWith(null, uploadRes);
    function test (result) {
      assert.deepEqual(JSON.parse(result), uploadRes);
      simple.restore();
      done();
    }
    var context = mockContextCreator(ctxOpts, test);
    index.handler({_id: '1234'}, context);
  });
});
