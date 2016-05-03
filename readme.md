# lambda-taggable-createDocument

[![Codeship](https://img.shields.io/codeship/d827f9c0-cce6-0133-f31d-66f6dcee1305.svg)](https://codeship.com/projects/140359/)

This Lambda is used to add / update documents in the Numo Labs taggable system.  
The tagging system structure is shown below:

![taggable-diagram](https://cloud.githubusercontent.com/assets/5912647/14384190/8ca7489e-fd91-11e5-94e0-aea421945a1b.png)

The taggable system stores all documents in an S3 Bucket (`'numo-taggy'`).  
e.g: https://numo-taggy.s3.amazonaws.com/ci/geo/geonames/geo%3Ageonames.2985244.json  
When a tag (`.json` file) is inserted/updated in the S3 Bucket
this triggers *two* Lambda functions:
+ 1. Update record in CloudSearch `taggy-ci`: https://github.com/numo-labs/lambda-taggable-cloudsearch-indexer
+ 2. Update record in Neo4J: https://github.com/numo-labs/lambda-taggable-neo4j-indexer

Both Neo4J and CloudSearch are run as a managed service in the AWS cloud.


The lambda function is invoked with the tag data as fields in the `event` object
i.e the `event` object has the form:

```
{
  _id, // string
  location, // object with lat and lon keys
  displayName, // string
  tags, // an array of objects
  metadata, // an array of objects
  markets // object of objects
}
```
see:

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
> Obviously you will need to set the correct values.
> If you are stuck ask!
