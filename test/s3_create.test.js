require('decache')('aws-lambda-helper'); // fresh start
require('decache')('../lib/s3_create'); // delete cache for test
var assert = require('assert');
var s3Create = require('../lib/s3_create');
var baseUrl = 'https://numo-taggy.s3-eu-west-1.amazonaws.com/ci/';
var AwsHelper = require('aws-lambda-helper');

describe('Save record to S3', function () {
  before(function (done) {
    AwsHelper.init({
      invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:mylambda'
    }, {});
    done();
  });

  it('create a record on S3 with json data', function (done) {
    var obj = {
      displayName: 'hello world',
      _id: 'test:testing.123'
    };

    s3Create(obj, function (err, data) {
      if (err) {
        console.log('Error uploading data: ', err);
      } else {
        console.log(data);
      }
      assert(data.Location === baseUrl + 'test/testing/test%3Atesting.123.json');
      done();
    });
  });

  it('create a record with ARN-style filename', function (done) {
    var obj = {
      displayName: 'My Amazing Hotel',
      _id: 'test:ne.wvHotelPartId.1234'
    };

    s3Create(obj, function (err, data) {
      if (err) {
        console.log('Error uploading data: ', err);
      } else {
        console.log(data);
      }
      // see: https://github.com/numo-labs/taggable-master-hotel-mapping-script/issues/2
      assert(data.Location === baseUrl + 'test/ne/test%3Ane.wvHotelPartId.1234.json');
      done();
    });
  });
});
