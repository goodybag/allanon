define(function(require){
  var utils = require('utils');
  var user = require('user');

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
      this.on({'change:userWants': this.onChangeUserWants,
               'change:userLikes': this.onChangeUserLikes,
               'change:userTried': this.onChangeUserTried
              });
      this.listenTo(user, 'deauth', this.onUserDeauth, this);
    },

    onChangeUserWants: function(model, collection, options) {
      if (this.changed.userWants != null && this.previousAttributes().userWants != null && !options.deauth)
        this.set('wants', this.get('wants') + (this.changed.userWants ? 1 : -1));
    },

    onChangeUserLikes: function(model, collection, options) {
      if (this.changed.userLikes != null && this.previousAttributes().userLikes != null && !options.deauth)
        this.set('likes', this.get('likes') + (this.changed.userLikes ? 1 : -1));
    },

    onChangeUserTried: function(model, collection, options) {
      if (this.changed.userTried != null && this.previousAttributes().userTried != null && !options.deauth)
        this.set('tries', this.get('tries') + (this.changed.userTried ? 1 : -1));
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
