exports.getEvent = function () {
  return {
    _id: 'foo-id',
    displayName: 'foo-display-name',
    tags: [
      {
        tagId: 'geography:geonames.123',
        tagType: 'geography',
        source: 'tag:source.user.12234',
        active: true
      },
      {
        tagId: 'geography:geonames.125',
        tagType: 'geography',
        source: 'tag:source.user.12235',
        active: false
      }
    ],
    content: [
      {
        key: 'label:en',
        values: ['Hotel ABC']
      },
      {
        key: 'search:en',
        values: ['Hotel ABC']
      }
    ]
  };
};