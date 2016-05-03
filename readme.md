# lambda-taggable-createDocument

[![Codeship](https://img.shields.io/codeship/d827f9c0-cce6-0133-f31d-66f6dcee1305.svg)](https://codeship.com/projects/140359/)

This Lambda is used to add / update documents in the Numo Labs taggable system.
The tagging system structure is shown below:

![taggable-diagram](https://cloud.githubusercontent.com/assets/5912647/14384190/8ca7489e-fd91-11e5-94e0-aea421945a1b.png)

The taggable system stores all documents in an S3 Bucket (`'numo-taggy'`).  
e.g: https://numo-taggy.s3.amazonaws.com/ci/geo/geonames/geo%3Ageonames.2985244.json  
When a tag (`.json` file) is inserted/updated in the S3 Bucket
this triggers *two* Lambda functions:
+ 1. Update record in CloudSearch `taggy-ci` domain
+ 2.

Both Neo4J and CloudSearch are run as a managed service in the AWS cloud.

The tags can be searched by any of their index fields.


The lambda function is invoked with the tag data as fields in the event object
i.e the `event` object has the form:

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

## Environment Variables

To run this Lambda *Locally* you will need an `.env` file in the root of your
project with the following Environment Variables:

```sh
export AWS_S3_BUCKET=numo-taggy
export AWS_REGION=eu-west-1
export AWS_IAM_ROLE=arn:aws:iam::123456789:role/lambdafull
export AWS_ACCESS_KEY_ID=YORKIE
export AWS_SECRET_ACCESS_KEY=SUPERSECRET
```
> Obviously you will need to set the correct values for the

### Further Reading
* AWS SDK CloudSearch http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudSearchDomain.html
* Preparing Data for CloudSearch http://docs.aws.amazon.com/cloudsearch/latest/developerguide/preparing-data.html#adding-documents
