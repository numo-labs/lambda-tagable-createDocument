var AwsHelper = require('aws-lambda-helper');
var tableName = 'numo-tagable';
var internal = {};

exports.handler = function (event, context) {
  AwsHelper.init(context);

  // C heck if an ID is provided
  if (!event._id) {
    return context.fail(new Error('no _id provided'));
  }

  internal.processEvent(event, function (err, data) {
    if (err) return context.fail(err); // an error occurred
    return context.succeed(data); // successful response
  });
};

internal.processEvent = function (event, cb) {
  var doc = internal.initDoc(event);

  var tags = getTags(doc.tags);

  var item = {
    _id: {
      S: doc._id.split('').reverse().join('')
    }, // reverse the id, better for distribution over the dynamodb cluster
    displayName: {
      S: doc.displayName
    },
    activeTags: {
      SS: tags.active.length === 0 ? ['_'] : tags.active // Added '_' tag when an empty list to avoid empty list error in dynamodb
    },
    disabledTags: {
      SS: tags.disabled.length === 0 ? ['_'] : tags.disabled // Added '_' tag when an empty list to avoid empty list error in dynamodb
    },
    doc: {
      S: JSON.stringify(doc)
    }
  };

  console.log(JSON.stringify(item, null, 2));

  // Insert document in DB
  AwsHelper.DynamoDB.putItem({
    TableName: tableName,
    Item: item
  },
    function (err, data) {
      return cb(err, data);
    }
  );

  function getTags (tags) {
    var result = {
      active: [],
      disabled: []
    };
    tags.forEach(function (item) {
      if (item.active) {
        result.active.push(item.tagId);
      } else {
        result.disabled.push(item.tagId);
      }
    });
    return result;
  }
};

internal.initDoc = function (event) {
  return {
    _id: event._id,
    displayName: event.displayName || event._id,
    tags: event.tags || [],
    content: event.content || []
  };
};

exports._internal = internal;
