define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/users', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/users/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/users', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/users/' + id, data, callback);
    }

  , consumers: {
      list: function(query, callback){
        utils.api.get('v1/consumers', query, callback);
      }

    , get: function(id, callback){
        utils.api.get('v1/consumers/' + id, callback);
      }

    , create: function(data, callback){
        utils.api.post('v1/consumers', data, callback);
      }

    , update: function(id, data, callback){
        utils.api.update('v1/consumers/' + id, data, callback);
      }
    }
  };
});