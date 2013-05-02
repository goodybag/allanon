define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

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

  , delete: function(id, callback){
      utils.api.delete('v1/product-tags/' + id, callback);
    }
  };
});