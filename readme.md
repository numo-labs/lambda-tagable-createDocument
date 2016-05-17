# lambda-taggable-createDocument

[![Codeship](https://img.shields.io/codeship/d827f9c0-cce6-0133-f31d-66f6dcee1305.svg)](https://codeship.com/projects/140359/)

This Lambda is used to add / update documents in the Numo Labs taggable system.  
The tagging system structure is shown below:

![inspirational-search-taggable-system](https://cloud.githubusercontent.com/assets/194400/15318968/6fdf0eba-1c20-11e6-8dbe-1d54a597e940.png)
[Link to edit this diagram](https://docs.google.com/presentation/d/1J2tsHMdnq84XQeZI10T_7vL1vTj-BWMZSgW1Dg-YzV8/edit#slide=id.g12364df475_3_0)

The taggable system stores all documents in an S3 Bucket (`'numo-taggy'`).  
e.g: https://numo-taggy.s3.amazonaws.com/ci/geo/geonames/geo%3Ageonames.2985244.json  
When a tag (`.json` file) is inserted/updated in the S3 Bucket
this ***triggers two Lambda functions***:
+ 1 - Update record in CloudSearch `taggy-ci`: https://github.com/numo-labs/lambda-taggable-cloudsearch-indexer
+ 2 - Update record in Neo4J: https://github.com/numo-labs/lambda-taggable-neo4j-indexer

Both CloudSearch & Neo4J are run as a managed service in the AWS cloud.
Ask [Pascal](https://twitter.com/plaenen) for for more info.


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

> If you need a sample event to test-run this lambda in the AWS Console,
see: [/test/fixtures/test_hotel_tag.json](https://github.com/numo-labs/lambda-taggable-createDocument/blob/7c742e5963aaa25bfea2eee1d2ee55d66c3c9a6f/test/fixtures/test_hotel_tag.json)  
> In the AWS Console you should see something like:  
> `--> Tag test:hotel.mhid.77bvb7p Saved to S3: [https://numo-taggy.s3-eu-west-1.amazonaws.com/ci/test/hotel/test%3Ahotel.mhid.77bvb7p.json](https://numo-taggy.s3-eu-west-1.amazonaws.com/ci/test/hotel/test%3Ahotel.mhid.77bvb7p.json)  
The URL is is your newly created/updated tag.

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
