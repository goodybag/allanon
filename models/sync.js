define(function(require) {
  var utils = require('utils');
  var api   = require('api');

  utils.Backbone.sync = function(method, model, options) {
    var options = options || {};
    // half copied from backbone source

    // Ensure that we have a URL.

    var url = !options.url ? (utils.result(model, 'url') || urlError()) : options.url;

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
      if (error) return options.error(error);
      return options.success(model, data, options);
    });
  }
});
