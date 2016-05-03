var assert = require('assert');
var handler = require('../lib/handler.js');

var mockData = require('./utils/mockData.js');
var mockEvent = mockData.event;

describe('Handler functions', function () {
  it('initTagDoc: should create a doc object from the event', function (done) {
    var doc = handler.initTagDoc(mockEvent);
    assert.deepEqual(doc, mockEvent);
    done();
  });
  it('initTagDoc: should use the id as the displayName, tags and metadata defaulted to []', function (done) {
    var event = { _id: '12345' };
    var doc = handler.initTagDoc(event);
    assert.deepEqual(Object.keys(doc), ['_id', 'location', 'displayName', 'tags', 'metadata', 'content', 'markets']);
    assert.deepEqual(doc.tags, []);
    assert.deepEqual(doc.metadata, []);
    assert.equal(doc.displayName, event._id);
    done();
  });
});
