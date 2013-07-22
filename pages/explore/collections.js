define(function(require) {
  var utils  = require('utils');
  var models = require('models');
  var user   = require('user');

  var exports = {};

  exports.Products = utils.Collection.extend({
    model: models.Product,

    url: '/products',

    queryParams: {
      include: ['collections'],
      hasPhoto: true
    },

    initialize: function(models, options) {
      options = options || {};
      if (options.pageSize) this.pageSize = options.pageSize;
      this.queryParams = utils.extend(utils.clone(this.queryParams), options.queryParams || {});

      this.listenTo(user, 'auth', this.onUserAuth, this);
    },

    onUserAuth: function() {
      this.reset([]);
      this.nextPage();
    }
  });

  exports.Nearby = exports.Products.extend({
    sync: function() {
      var self = this;
      var args = arguments;
      utils.geo.getPosition(function(error, pos) {
        if (error) pos = config.defaults.position;
        utils.extend(self.queryParams, utils.pick(pos, ['lat', 'lon']));
        utils.Collection.prototype.sync.apply(self, args);
      });
    },
    initialize: function(model, options) {
      options.queryParams = utils.extend({sort: '-distance'}, options.queryParams);
      exports.Products.prototype.initialize.apply(this, arguments);
    }
  })

  return exports;
});
