define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      utils.api.get('v1/product-tags', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/product-tags/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/product-tags', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/product-tags/' + id, data, callback);
    }
  };
});