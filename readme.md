# Taggable 

The microservice below is used to add / update documents of the taggable system. 
[![Codeship](https://img.shields.io/codeship/d827f9c0-cce6-0133-f31d-66f6dcee1305.svg)](https://codeship.com/projects/140359/)


The tagable system stores all documents in a elastic search instance which runs as a managed service in AWS cloud. 



# Template for elasticsearch

We defined a custom template for elasticsearch and removed analysers from id fields. This to ensure we can easily do exact matches. 
The template has to be executed using a post method against the following URI

https://search-taggable-ci-{your-details}.es.amazonaws.com/tags/_mappings/tag

The body looks like: 

{
  "properties": {
    "displayName": {
      "type": "string"
    },
    "id": {
      "type": "string",
      "index": "not_analyzed" 
    },
    "geohash": {
      "type": "string",
      "index": "not_analyzed" 
    },
    "metadata": {
      "properties": {
        "key": {
          "type": "string",
          "index": "not_analyzed" 
        },
        "values": {
          "type": "string"
        }
      }
    },
    "activeTags": {
      "type": "string",
      "index": "not_analyzed" 
    },
    "disabledTags": {
      "type": "string",
      "index": "not_analyzed" 
    },
    "tags": {
      "properties": {
        "active": {
          "type": "boolean"
        },
        "source": {
          "type": "string",
          "index": "not_analyzed" 
        },
        "tagId": {
          "type": "string",
          "index": "not_analyzed" 
        },
        "tagType": {
          "type": "string",
          "index": "not_analyzed" 
        }
      }
    }
  }
}

