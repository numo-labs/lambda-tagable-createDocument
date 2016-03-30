var AwsHelper = require('aws-lambda-helper');
// var request = require('request');
var aws4 = require('aws4');
var https = require('https');
var internal = {};

var AWS_GATEWAY_INTERNAL = 'https://jo7a6ogpr6.execute-api.eu-west-1.amazonaws.com';

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
    _id: doc._id,
    displayName: doc.displayName,
    // geohash:
    activeTags: tags.active,
    disabledTags: tags.disabled,
    tags: doc.tags,
    metadata: doc.metadata
  };

  var opts = {
    host: 'apigateway.' + AwsHelper.region + '.amazonaws.com', // Used the gateway as reverse proxy to our elastic search server
    // path: AwsHelper.env + '/taggable/tag-' + AwsHelper.env,
    method: 'POST',
    json: false,
    region: AwsHelper.region,
    body: JSON.stringify(item)
  };

  opts = aws4.sign(opts);

  var params = {
    host: AWS_GATEWAY_INTERNAL,
    port: 443,
    path: '/' + AwsHelper.env + '/taggable/tag-' + AwsHelper.env,
    method: 'POST',
    headers: opts.headers
  };

  params.headers['Content-Type'] = 'application/json';

  console.log(params);

  var str = '';

  var request = https.request(params, function (res) {
    res.on('data', function (chunk) {
      str += chunk;
    });

    res.on('end', function () {
      console.log(str);
      cb(null, str);
    });
  });

  request.on('error', function (err) {
    console.log(err);
    cb(err);
  });

  request.end();

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
    metadata: event.metadata || []
  };
};

exports._internal = internal;
