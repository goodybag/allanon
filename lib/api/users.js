define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('v1/users', query, callback);
    }

  , get: function(id, callback){
      return utils.api.get('v1/users/' + id, callback);
    }

  , create: function(data, callback){
      return utils.api.post('v1/users', data, callback);
    }

  , update: function(id, data, callback){
      return utils.api.update('v1/users/' + id, data, callback);
    }

  , getPartialRegistration: function(token, callback) {
      var url = 'v1/users/complete-registration/' + token;
      return utils.api.get(url, callback);
    }

  , completeRegistration: function(token, data, callback) {
      var url = 'v1/users/complete-registration/' + token;
      return utils.api.post(url, data, callback);
    }

  , getCardUpdate: function(token, callback) {
      var url = 'v1/users/card-update' + token;
      utils.api.get(url, callback);
    }

  , updateCard: function(token, callback) {
      var url = 'v1/users/card-update' + token;
      utils.api.post(url, callback);
    }

  , cancelCardUpdate: function(token, callback) {
      var url = 'v1/users/card-update' + token;
      utils.api.del(url, callback);
    }

  , consumers: {
      list: function(query, callback){
        return utils.api.get('v1/consumers', query, callback);
      }

    , get: function(id, callback){
        return utils.api.get('v1/consumers/' + id, callback);
      }

    , create: function(data, callback){
        return utils.api.post('v1/consumers', data, callback);
      }

    , update: function(id, data, callback){
        return utils.api.update('v1/consumers/' + id, data, callback);
      }
    }
  };
});
