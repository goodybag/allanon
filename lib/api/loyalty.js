define(function(require){
  var utils  = require('../utils');

  return {
    list: function(query, callback){
      utils.api.get('v1/loyalty', query, callback);
    }

  , get: function(id, query, callback){
      utils.api.get('v1/loyalty/' + id, query, callback);
    }
  };
});