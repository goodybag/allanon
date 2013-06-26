define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('v1/product-tags', query, callback);
    }

  , get: function(id, callback){
      return utils.api.get('v1/product-tags/' + id, callback);
    }

  , create: function(data, callback){
      return utils.api.post('v1/product-tags', data, callback);
    }

  , update: function(id, data, callback){
      return utils.api.update('v1/product-tags/' + id, data, callback);
    }
  };
});