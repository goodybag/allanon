define(function(require){
  var utils = require('utils');

  var acceptable = [
    'id',
    'businessId',
    'name',
    'description',
    'price',
    'photoUrl',
    'likes',
    'wants',
    'tries',
    'isVerified',
    'isArchived',
    'isEnabled',
    'businessName',
    'businessIsGB',
    'userLikes',
    'userWants',
    'userTried',
    'popular',
    'tags',
    'categories',
  ]

  return utils.Model.extend({
    validate: function(attrs, options) {
      for (key in attrs)
        if (acceptable.indexOf(key) === -1) return key + ' is not an acceptable attribute';

      if (attrs.name == null)
        return 'name is required';
    },

    defaults: {
      price:      0,
      tags:       [],
      categories: []
    },

    urlRoot: '/products'
  });
});
