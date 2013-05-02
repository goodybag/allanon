define(function(require){
  var
    utils  = require('../utils')
  ;

  return {
    get: function(callback){
      utils.api.get('v1/session', callback);
    }

  , auth: function(email, password, callback){
      var data = { email: email, password: password };
      utils.api.post('v1/session', data, callback);
    }

  , oauth: function(code, callback){
      var data = { code: code, group: 'consumer' };
      utils.api.post('v1/oauth', data, callback);
    }

  , getOauthUrl: function(url, service, callback){
      var data = { redirect_uri: url, service: service };
      utils.api.get('v1/oauth', data, callback);
    }

  , destroy: function(callback){
      utils.api.del('v1/session', callback);
    }
  };
});