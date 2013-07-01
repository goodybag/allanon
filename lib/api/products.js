define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('products', query, callback);
    }

  , food: function(query, callback){
      return utils.api.get('products/food', query, callback);
    }

  , get: function(id, options, callback){
      return utils.api.get('products/' + id, options, callback);
    }

  , create: function(data, callback){
      return utils.api.post('products', data, callback);
    }

  , update: function(id, data, callback){
      return utils.api.update('products/' + id, data, callback);
    }

  , feelings: function(id, feelings, callback){
      return utils.api.post('products/' + id + '/feelings', feelings, callback);
    }

  , categories: {
      list: function(pid, query, callback){
        return utils.api.get('products/' + pid + '/categories', query, callback);
      }

    , get: function(pid, id, callback){
        return utils.api.get('products/' + pid + '/categories/' + id, callback);
      }

    , create: function(pid, data, callback){
        return utils.api.post('products/' + pid + '/categories', data, callback);
      }

    , update: function(pid, id, data, callback){
        return utils.api.update('products/' + pid + '/categories/' + id, data, callback);
      }
    }
  };
});