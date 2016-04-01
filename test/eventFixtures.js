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
    metadata: [
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

exports.hotel_mhid_77bvb7p = function () {
  return {
    _id: 'hotel:mhid.77bvb7p',
    displayName: 'All Seasons Resort Europa',
    location: {
      lat: '13.1777',
      long: '-59.63560'
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
    ]
  };
};
