define(function(require) {
  var utils   = require('utils');
  var user    = require('user');
  var Product = require('./product');

  var acceptable = [
    'id',
    'userId',
    'name',
    'isHidden',
    'numProducts',
    'photoUrl',
    'totalMyLikes',
    'totalMyWants',
    'totalMyTries'
  ];

  var GBCollection = utils.Collection.extend({
    url: function() {
      return '/consumers/' + user.id + '/collections/' + this.id + '/products';
    },

    model: Product,

    queryParams: {
      include: ['collections', 'userPhotos']
    },

    initialize: function(models, options) {
      utils.Collection.prototype.initialize.apply(this, arguments);
      if (options && options.id) this.id = options.id;
    }
  });

  return utils.Model.extend({
    validate: function(attrs, options) {
      for (key in attrs)
        if (acceptable.indexOf(key) === -1) return key + ' is not an acceptable attribute';

      if (attrs.name == null)
        return 'name is required';
    },

    defaults: {
      isHidden: false,
      numProducts: 0,
      totalMyLikes: 0,
      totalMyWants: 0,
      totalMyTries: 0
    },

    urlRoot: function() {
      return '/consumers/' + user.id + '/collections'
    },

    initialize: function(attrs, options) {
      this.products = new GBCollection([], {id: this.id});

      this.listenTo(this.products, 'change:userWants', function(model, value, options) {
        if (model.changed.userWants != null && model.previousAttributes().userWants != null && !options.deauth)
          this.set('totalMyWants', this.get('totalMyWants') + (value ? 1 : -1));
      });

      this.listenTo(this.products, 'change:userLikes', function(model, value, options) {
        if (model.changed.userLikes != null && model.previousAttributes().userLikes != null && !options.deauth)
          this.set('totalMyLikes', this.get('totalMyLikes') + (value ? 1 : -1));
      });

      this.listenTo(this.products, 'change:userTried', function(model, value, options) {
        if (model.changed.userTried != null && model.previousAttributes().userTried != null && !options.deauth)
          this.set('totalMyTries', this.get('totalMyTries') + (value ? 1 : -1));
      });
    }
  });
});
