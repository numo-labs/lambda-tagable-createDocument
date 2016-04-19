exports.event = {
  _id: 'foo-id',
  displayName: 'foo-display-name',
  location: {
    lat: '0',
    lon: '0'
  },
  tags: [
    {
      tagId: 'geo:geonames.123',
      source: 'tag:source.user.12234',
      inherited: false,
      active: true
    },
    {
      tagId: 'geo:geonames.125',
      source: 'tag:source.user.12235',
      inherited: true,
      active: false
    }
  ],
  metadata: [
    {
      key: 'label:en',
      values: ['Hotel ABC']
    },
    {
      key: 'search:en',
      values: ['Hotel ABC']
    }
  ],
  content: {}
};

exports.mockCloudSearchResult = {
  hits: {
    found: 1,
    hit: [
      {
        fields: {
          doc: [
            '{"id": "12345"}'
          ]
        }
      }
    ]
  }
};

exports.hotel_mhid_77bvb7p = {
  _id: 'hotel:mhid.77bvb7p',
  displayName: 'All Seasons Resort Europa',
  location: {
    lat: '13.1777',
    lon: '-59.63560'
  },
  tags: [
    {
      tagId: 'geo:geonames.3374084',
      source: 'geonames',
      inherited: false,
      active: true
    },
    {
      tagId: 'hotel:NE.wvHotelPartId.12345',
      source: 'master_hotel_mapping',
      inherited: false,
      active: true
    },
    {
      tagId: 'marketing:concept.sunprime',
      source: 'geo:geonames.3374084',
      inherited: true,
      active: true
    },
    {
      tagId: 'amenity:hotel.swimmingpool',
      source: 'user',
      inherited: false,
      active: true
    },
    {
      tagId: 'tile:concept.other',
      source: 'user',
      inherited: true,
      active: true
    }
  ],
  metadata: [
    {
      key: 'search:en',
      values: ['All Seasons Resort Europe']
    },
    {
      key: 'search:fr',
      values: ['All Seasons Resort en Europe', 'All Seasons Resort Europe'] // Can search for both when in language FR context
    },
    {
      key: 'label:en',
      values: ['All Seasons Resort Europa']
    }
  ],
  content: {}
};

exports.newLinkedTags = [
  { tagId: 'hotel:12345', active: true, inherited: true },
  { tagId: 'amenity:12345', active: true, inherited: false },
  { tagId: 'geo:12345', active: true, inherited: true },
  { tagId: 'tile:12345', active: true, inherited: false },
  { tagId: 'marketing:1234', active: true, inherited: false }
];

exports.currentLinkedTags = [
  { tagId: 'hotel:12345', active: true, inherited: true },
  { tagId: 'amenity:12345', active: true, inherited: false },
  { tagId: 'geo:12345', active: true, inherited: true },
  { tagId: 'tile:12345', active: true, inherited: false },
  { tagId: 'marketing:12345', active: true, inherited: false },
  { tagId: 'marketing:1234', active: false, inherited: false }
];

exports.updatedTagDoc = {
  '_id': '1234',
  'location': {
    'lat': '',
    'lon': ''
  },
  'displayName': '1234',
  'tags': [
    {
      'tagId': 'hotel:12345',
      'active': true,
      'inherited': true
    },
    {
      'tagId': 'amenity:12345',
      'active': true,
      'inherited': false
    },
    {
      'tagId': 'geo:12345',
      'active': true,
      'inherited': true
    },
    {
      'tagId': 'tile:12345',
      'active': true,
      'inherited': false
    },
    {
      'tagId': 'marketing:12345',
      'active': true,
      'inherited': false
    },
    {
      'tagId': 'marketing:1234',
      'active': false,
      'inherited': false
    }
  ],
  'metadata': [],
  content: {}
};
