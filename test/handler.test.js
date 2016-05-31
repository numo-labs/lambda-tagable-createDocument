var assert = require('assert');
var handler = require('../lib/handler.js');
var testHotelTag = require('./fixtures/test_hotel_tag.json');
var fieldsList = ['_id', 'location', 'displayName', 'tags',
  'metadata', 'content', 'markets', 'active', 'description'];

describe('lib/handler.js', function () {
  it('initTagDoc: should create a doc object from the event', function (done) {
    handler.initTagDoc(testHotelTag, function (err, doc) {
      if (err) console.log(err);
      // console.log(doc);
      assert.deepEqual(doc, testHotelTag);
      done();
    });
  });

  it('initTagDoc: should use the id as the displayName, tags and metadata defaulted to []', function (done) {
    var event = { _id: '12345' };
    handler.initTagDoc(event, function (err, doc) {
      if (err) console.log(err);
      assert.deepEqual(Object.keys(doc), fieldsList);
      assert.deepEqual(doc.tags, []);
      assert.deepEqual(doc.metadata, []);
      assert.equal(doc.displayName, event._id);
      done();
    });
  });

  it('initTagDoc: should lookup the Geonames Tag if not set', function (done) {
    var event = { _id: 'test:hotel:mhid.12345', location: { lat: 52.9875, lon: 1.8865 } };
    handler.initTagDoc(event, function (err, doc) {
      if (err) console.log(err);
      // console.log(doc);
      assert.deepEqual(Object.keys(doc), fieldsList);
      assert.equal(doc.tags.length, 1);
      assert.equal(doc.tags[0].node, 'geo:geonames.2634643');
      assert.equal(doc.displayName, event._id);
      done();
    });
  });

  it('initTagDoc: should lookup the Geonames Tag if not set', function (done) {
    var event = require('./fixtures/test_hotel_with_non_geo_tags.json');
    handler.initTagDoc(event, function (err, doc) {
      if (err) console.log(err);
      // console.log(doc);
      assert.deepEqual(Object.keys(doc), fieldsList);
      // console.log(doc.tags);
      assert(doc.tags.length > 0);
      assert.equal(doc.tags[1].node, 'geo:geonames.261702');
      done();
    });
  });

  it('initTagDoc: invoke the geo lambda with invalid Lat/Lon', function (done) {
    var event = { _id: 'test:hotel:mhid.badhotel', location: { lat: 190, lon: 190 } };
    handler.initTagDoc(event, function (err, doc) {
      if (err) console.log(err);
      // console.log(doc);
      assert.equal(doc.displayName, event._id);
      done();
    });
  });
});
