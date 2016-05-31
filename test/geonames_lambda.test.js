var assert = require('assert');
var geo = require('../lib/geonames_lambda');
var testHotelTag = require('./fixtures/test_hotel_tag');
var AwsHelper = require('aws-lambda-helper');

describe('invoke the Geonames Lambda (tag-e-geo)', function () {
  before(function (done) {
    AwsHelper.init({
      invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:mylambda'
    }, {});
    done();
  });

  it('invokes the lambda with sample test_hotel_tag', function (done) {
    geo(testHotelTag, function (err, data) {
      if (err || data.Payload.match(/errorMessage/)) console.log(err);
      // console.log(err, data.Payload);
      var res = JSON.parse(data.Payload);
      assert(res[0].displayName === 'Earth');
      done();
    });
  });

  it('invokes the lambda invalid tag (no location.lat)', function (done) {
    var badTag = {_id: 'bad'};
    geo(badTag, function (err, data) {
      if (err) console.log(err);
      // console.log(err, data);
      assert.equal(data.FunctionError, 'Handled');
      done();
    });
  });
});
