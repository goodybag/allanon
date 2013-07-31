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
    'collections'
  ]

  return utils.Model.extend({
    validate: function(attrs, options) {
      for (key in attrs)
        if (acceptable.indexOf(key) === -1) return key + ' is not an acceptable attribute';

      if (attrs.name == null)
        return 'name is required';
    },

    defaults: {
      price:       0,
      tags:        [],
      categories:  [],
      collections: [],
      likes:       0,
      wants:       0,
      tries:       0,
      userLikes:   false,
      userWants:   false,
      userTried:   false
    },

    urlRoot: '/products',

    initialize: function() {
      this.on({'change:userWants': utils.bind(this.onChangeFeeling, this, 'userWants', 'wants'),
               'change:userLikes': utils.bind(this.onChangeFeeling, this, 'userLikes', 'likes'),
               'change:userTried': utils.bind(this.onChangeFeeling, this, 'userTried', 'tries')
              });
      this.listenTo(require('user'), 'deauth', this.onUserDeAuth, this);
    },

    onChangeFeeling: function(prop, count, model, value, options) {
      if (this.changed[prop] != null && this.previousAttributes()[prop] != null && !options.deauth) {
        this.set(count, this.get(count) + (value ? 1 : -1));
        if (value && !utils.contains(this.get('collections'), 'food'))
          require('user').collections.get('food').products.addProduct(this);
      }
    },

    onUserDeAuth: function(e) {
      this.set({
        userLikes: false,
        userWants: false,
        userTried: false
      }, {deauth: true});
    }
  });
});
