define(function(require) {
  var network = require('./network');
  var config  = require('config');

  api = {};

  api.get = function(url, data, callback){
    return network.get(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  api.post = function(url, data, callback){
    return network.post(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  api.patch = function(url, data, callback){
    return network.put(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  api.update = function(url, data, callback){
    return network.put(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  api.put = function(url, data, callback){
    return network.put(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  api.del = function(url, data, callback){
    return network.del(config.apiUrl + '/v' + config.apiVersion + '/' + url, data, callback);
  };

  return api;

});
