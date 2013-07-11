define(function(require) {
  var utils   = require('utils');
  var api     = require('api');
  var Product = require('./product');

  var productsCache = new utils.Collection({}, {model: Product});

  utils.Backbone.sync = function(method, model, options) {
    var options = options || {};
    // half copied from backbone source

    // Ensure that we have a URL.

    var url = !options.url ? utils.result(model, 'url') : options.url;

    // add query params to url, if any
    var queryParams = utils.extend(model.queryParams || {}, options.queryParams);
    if (queryParams) {
      // denormalize array notation, each into it's own pair.  e.g. {a: [1, 2, 3], b: 4} becomes [["a[]", 1], ["a[]", 2], ["a[]", 3], ["b", 4]]
      var pairs = utils.reduce(utils.map(utils.pairs(queryParams), function(pair) {
        return !utils.isArray(pair[1]) ? [pair] : utils.map(pair[1], function(elem) {
          return [pair[0] + '[]', elem];
        });
      }), function(a, b) { return a.concat(b); }, []);

      url += '?' + utils.map(pairs, function(pair) {
        return utils.map(pair, function(param) {
          return encodeURIComponent(param);
        }).join('=');
      }).join('&');
    }

    // the api methods assume paths do not start with / even though they are relative to root.
    if (url.substring(0, 1) === '/') url = url.slice(1, url.length);

    var data;
    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch'))
      data = JSON.stringify(options.attrs || model.toJSON(options));
    if (options.data != null)
      data = options.data;

    var func = {
      'create': utils.api.post,
      'update': utils.api.put,
      'patch':  utils.api.patch,
      'delete': utils.api.del,
      'read':   utils.api.get
    }[method];

    func(url, data, function(error, data, meta) {
      options.complete = options.complete || function() {};
      options.error    = options.error    || function() {};
      options.success  = options.success  || function() {};

      if (error) return options.error(error), options.complete(error);

      // make products singletons
      if (model instanceof utils.Collection && model.model === Product) {
        productsCache.add(data, {merge: true});
        var data = utils.map(data, function(m) { return productsCache.get(m); });
      }

      return options.success(data), options.complete(null, data);
    });
  }
});
