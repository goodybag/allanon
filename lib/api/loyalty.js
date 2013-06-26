define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('v1/loyalty', query, callback);
    }

  , get: function(id, query, callback){
      return utils.api.get('v1/loyalty/' + id, query, callback);
    }

  , userBusiness: function(uid, bid, callback){
      utils.api.get('v1/consumers/' + uid + '/loyalty/' + bid, callback);
    }
  };
});