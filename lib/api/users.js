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

  , delete: function(id, callback){
      utils.api.del('v1/users/' + id, callback);
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

    , delete: function(id, callback){
        utils.api.del('v1/consumers/' + id, callback);
      }
    }

  , sales: {
      list: function(query, callback){
        utils.api.get('v1/sales', query, callback);
      }

    , get: function(id, callback){
        utils.api.get('v1/sales/' + id, callback);
      }

    , create: function(data, callback){
        utils.api.post('v1/sales', data, callback);
      }

    , update: function(id, data, callback){
        utils.api.update('v1/sales/' + id, data, callback);
      }

    , delete: function(id, callback){
        utils.api.del('v1/sales/' + id, callback);
      }
    }

  , tapinStations: {
      list: function(query, callback){
        utils.api.get('v1/tapin-stations', query, callback);
      }

    , get: function(id, callback){
        utils.api.get('v1/tapin-stations/' + id, callback);
      }

    , create: function(data, callback){
        utils.api.post('v1/tapin-stations', data, callback);
      }

    , update: function(id, data, callback){
        utils.api.update('v1/tapin-stations/' + id, data, callback);
      }

    , delete: function(id, callback){
        utils.api.del('v1/tapin-stations/' + id, callback);
      }
    }

  , managers: {
      list: function(query, callback){
        utils.api.get('v1/managers', query, callback);
      }

    , get: function(id, callback){
        utils.api.get('v1/managers/' + id, callback);
      }

    , create: function(data, callback){
        utils.api.post('v1/managers', data, callback);
      }

    , update: function(id, data, callback){
        utils.api.update('v1/managers/' + id, data, callback);
      }

    , delete: function(id, callback){
        utils.api.del('v1/managers/' + id, callback);
      }
    }

  , cashiers: {
      list: function(query, callback){
        utils.api.get('v1/cashiers', query, callback);
      }

    , get: function(id, callback){
        utils.api.get('v1/cashiers/' + id, callback);
      }

    , create: function(data, callback){
        utils.api.post('v1/cashiers', data, callback);
      }

    , update: function(id, data, callback){
        utils.api.update('v1/cashiers/' + id, data, callback);
      }

    , delete: function(id, callback){
        utils.api.del('v1/cashiers/' + id, callback);
      }
    }

  , tapinStations: {
      list: function(query, callback){
        utils.api.get('v1/tapin-stations', query, callback);
      }

    , get: function(id, callback){
        utils.api.get('v1/tapin-stations/' + id, callback);
      }

    , create: function(data, callback){
        utils.api.post('v1/tapin-stations', data, callback);
      }

    , update: function(id, data, callback){
        utils.api.update('v1/tapin-stations/' + id, data, callback);
      }

    , delete: function(id, callback){
        utils.api.del('v1/tapin-stations/' + id, callback);
      }
    }
  };
});