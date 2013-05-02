define(function(require){
  var
    utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/products', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/products/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/products', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/products/' + id, data, callback);
    }

  , delete: function(id, callback){
      utils.api.del('v1/products/' + id, callback);
    }


  , categories: {
      list: function(pid, query, callback){
        utils.api.get('v1/products/' + pid + '/categories', query, callback);
      }

    , get: function(pid, id, callback){
        utils.api.get('v1/products/' + pid + '/categories/' + id, callback);
      }

    , create: function(pid, data, callback){
        utils.api.post('v1/products/' + pid + '/categories', data, callback);
      }

    , update: function(pid, id, data, callback){
        utils.api.update('v1/products/' + pid + '/categories/' + id, data, callback);
      }

    , delete: function(pid, id, callback){
        utils.api.del('v1/products/' + pid + '/categories/' + id, callback);
      }
    }
  };
});