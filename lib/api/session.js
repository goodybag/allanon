define(function(require){
  var utils  = require('utils');

  return {
    get: function(callback){
      return utils.api.get('v1/session', callback);
    }

  , auth: function(email, password, remember, callback){
      var data = { email: email, password: password, remember: remember };
      return utils.api.post('v1/session', data, callback);
    }

  , oauth: function(code, callback){
      var data = { code: code, group: 'consumer' };
      return utils.api.post('v1/oauth', data, callback);
    }

  , getOauthUrl: function(url, service, callback){
      var data = { redirect_uri: url, service: service };
      return utils.api.get('v1/oauth', data, callback);
    }

  , destroy: function(callback){
      return utils.api.del('v1/session', callback);
    }
  };
});
