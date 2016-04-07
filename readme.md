# lambda-taggable-createDocument

[![Codeship](https://img.shields.io/codeship/d827f9c0-cce6-0133-f31d-66f6dcee1305.svg)](https://codeship.com/projects/140359/)

This Lambda is used to add / update documents in the Numo Labs taggable system.

The taggable system stores all documents in a CloudSearch instance which runs as a managed service in the AWS cloud. The tags can be searched by any of their index fields.

Each tag has the following index fields:

```
{
  id, // unique tag id e.g. 'hotel:NE.wvHotelPartId.12345',
  location: // lat, lon,
  displayname: // e.g. 'All Seasons Hotel',
  amenitytags: // an array of tags with id prefix 'amenity' e.g. 'amenity:wifi.12345',
  geotags: // an array of tags with id prefix 'geo' e.g. 'geo:12345',
  hoteltags: // an array of tags with id prefix 'hotel' e.g. 'hotel:NE.wvHotelPartId.98765',
  marketingtags: // an array of tags with id prefix 'marketing' e.g. 'marketing:summersale.98765',
  tiletags: // an array of tags with id prefix 'tile' e.g. 'tile:article.spain.98765',
  disabledtags: // an array of tags which have the 'active' field set to 'false',
  classes: // not sure what this is yet...,
  doc: // a stringified version of the tag information and metadata
}
```

The `doc` field is a JSON string of a tag data which has the following form:

```
{
  "_id": "geo:geonames.2514042",
  "displayName": "Maspalomas",
  "location": {
    "lat": "27.76056",
    "lon": "-15.58602"
  },
  "tags": [
    {
      "tagId": "geo:geonames.6360189",
      "inherited": false,
      "active": true
    }
  ],
  "metadata": [
    {
      "key": "label:en",
      "values": ["Hotel A"]
    }
  ]
}
```

The lambda function is invoked with the tag data as fields in the event object i.e the `event` object has the form:

```
{
  _id, // string
  location, // object with lat and lon keys
  displayName, // string
  tags, // an array of objects
  metadata // an array of objects
}
```

The tag is added/updated in CloudSearch in several steps:

### Step 1
A CloudSearch query is launched with a tag id of a modified/newly created tag (**NEW_TAG**) to get the full tag document if it exists.
A new tag document is created with the tag data from the event parameters.

### Step 2
The new document for **NEW_TAG** is uploaded to CloudSearch - if **NEW_TAG** exists already, then it is overwritten with the new tag document _(NB: You cannot update selected fields, the full document is overwritten with the new version)_.

### Step 3
If **NEW_TAG** already exists, the 'tags' array in the old tag document is compared with the 'tags' array in the new tag document to check if any of the tags which have the `inherited` property set to false have changed - these are the first level linked tags.

If any of the first level links have changed, then the [lambda-taggable-inheritance-indexer](https://github.com/numo-labs/lambda-taggable-inheritance-indexer) function is called with the tag id of **NEW_TAG**. This lambda updates the linked tags array of all the tags which have been tagged with **NEW_TAG** (either directly or through inheritance).

### Sample queries:

 **Structured query**

(and activetags:'hotel:NE.wvHotelPartId.12345' (not activetags:'marketing:tile.romantic_beaches'))

(not classes:'geo:geonames')
(not classes:'geo:geonameswikipedia')

### Further Reading
* AWS SDK CloudSearch http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudSearchDomain.html
* Preparing Data for CloudSearch http://docs.aws.amazon.com/cloudsearch/latest/developerguide/preparing-data.html#adding-documents
