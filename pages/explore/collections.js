define(function(require) {
  var utils = require('utils');
  var models = require('models');

  var exports = {};

  exports.Products = utils.Collection.extend({
    model: models.Product,
    url: '/products',
    queryParams: {
      include: ['collections'],
      hasPhoto: true
    },
    initialize: function(models, options) {
      this.queryParams = utils.extend(utils.clone(this.queryParams), options.queryParams || {});
    }
  });

  return exports;
});
