define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('locations', query, callback);
    }

  , get: function(id, callback){
      return utils.api.get('locations/' + id, callback);
    }

  , create: function(data, callback){
      return utils.api.post('locations', data, callback);
    }

  , post: function(data, callback){
      return utils.api.post('locations', data, callback);
    }

  , update: function(id, data, callback){
      return utils.api.update('locations/' + id, data, callback);
    }
  };
});