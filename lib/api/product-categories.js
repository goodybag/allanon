define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/product-categories', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/product-categories/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/product-categories', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/product-categories/' + id, data, callback);
    }

  , delete: function(id, callback){
      utils.api.del('v1/product-categories/' + id, callback);
    }
  };
});