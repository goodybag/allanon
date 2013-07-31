define(function(require) {
  var network = require('./network');
  var config  = require('config');

  var api = {};

  var methodMap = {
    get: 'get',
    post: 'post',
    patch: 'put',
    update: 'put',
    put: 'put',
    del: 'del'
  };

  for (var key in methodMap) {
    // mutate the first param but leave all others unchanged
    api[key] = _.wrap(network[methodMap[key]], function(method, url) {
      var fullUrl = config.apiUrl + '/v' + config.apiVersion + '/' + url;
      var args = [fullUrl].concat(Array.prototype.slice.call(arguments, 2));
      return method.apply(network, args);
    });
  }

  return api;
});
