define(function(require) {
  require('backbone');
  var _ = require('underscore') || window._;

  var wrapError = function (model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };


  var Collection = Backbone.Collection.extend({
    fetch: function(options) {
      options = options ? utils.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        if (utils.contains(['set', 'reset', 'add'], options.method)) method = options.method;
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    fetchedLastPage: false,

    page: 0,

    pageSize: 30,

    nextPage: function(options) {
      if (this.fetchedLastPage) return;
      if (this.page == null || this.pageSize == null) return;
      options = options || {};
      var coll = this;
      var success = options.success;
      options.queryParams = _.extend(options.queryParams || {}, {
        offset: coll.pageSize * coll.page,
        method: 'add',
        success: function(data) {
          coll.fetchedLastPage = data.length < coll.pageSize;
          success.apply(this, arguments);
        }
      });

    }
  });

  return Collection;
});
