define(function(require){
  var utils  = require('utils');

  return {
    list: function(query, callback){
      return utils.api.get('users', query, callback);
    }

  , get: function(id, callback){
      return utils.api.get('users/' + id, callback);
    }

  , create: function(data, callback){
      return utils.api.post('users', data, callback);
    }

  , update: function(id, data, callback){
      return utils.api.update('users/' + id, data, callback);
    }

  , getPartialRegistration: function(token, callback) {
      var url = 'users/complete-registration/' + token;
      return utils.api.get(url, callback);
    }

  , completeRegistration: function(token, data, callback) {
      var url = 'users/complete-registration/' + token;
      return utils.api.post(url, data, callback);
    }

  , getCardUpdate: function(token, callback) {
      var url = 'users/card-update' + token;
      utils.api.get(url, callback);
    }

  , updateCard: function(token, callback) {
      var url = 'users/card-update' + token;
      utils.api.post(url, callback);
    }

  , cancelCardUpdate: function(token, callback) {
      var url = 'users/card-update' + token;
      utils.api.del(url, callback);
    }

  , consumers: {
      list: function(query, callback){
        return utils.api.get('consumers', query, callback);
      }

    , get: function(id, callback){
        return utils.api.get('consumers/' + id, callback);
      }

    , create: function(data, callback){
        return utils.api.post('consumers', data, callback);
      }

    , update: function(id, data, callback){
        return utils.api.update('consumers/' + id, data, callback);
      }
    }
  };
});
