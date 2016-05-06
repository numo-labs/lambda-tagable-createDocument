var assert = require('assert');
var geo = require('../lib/geonames_lambda');
var test_hotel_tag = require('./fixtures/test_hotel_tag');

describe('invoke the Geonames Lambda (tag-e-geo)', function () {
  it('invokes the lambda with sample test_hotel_tag', function (done) {
    geo(test_hotel_tag, function (err, data) {
      if (err || data.Payload.match(/errorMessage/)) console.log(err);
      // console.log(err, data.Payload);
      var res = JSON.parse(data.Payload);
      assert(res[0].displayName === 'Earth');
      done();
    });
  });

  it('invokes the lambda invalid tag (no location.lat)', function (done) {
    var bad_tag = {_id: 'bad'};
    geo(bad_tag, function (err, data) {
      if (err) console.log(err);
      // console.log(err, data);
      assert.equal(data.FunctionError, 'Handled');
      done();
    });
  });
});
