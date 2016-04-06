# lambda-taggable-createDocument

[![Codeship](https://img.shields.io/codeship/d827f9c0-cce6-0133-f31d-66f6dcee1305.svg)](https://codeship.com/projects/140359/)

This Lambda is used to add / update documents in the Numo Labs taggable system.

The taggable system stores all documents in a CloudSearch instance which runs as a managed service in the AWS cloud.

Each tag document has the following format:

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
  doc: // a stringified version of the tag information and metadat
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
      "key": "label",
      "value": "test"
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

The tag is added to CloudSearch in several steps

### Step 1


### Step 2


### Step 3


### Sample queries:

 (and activetags:'hotel:NE.wvHotelPartId.12345' (not activetags:'marketing:tile.romantic_beaches')) --> structured query parser !!!


(not classes:'geo:geonames')
(not classes:'geo:geonameswikipedia')
