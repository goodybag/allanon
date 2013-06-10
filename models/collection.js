define(function(require){
  var
    utils   = require('utils')
  , config  = require('config')
  , user    = require('user')
  , api     = require('api')
  , Base    = require('./base')
  ;

  return Base.extend({
    acceptable: [
      'id'
    , 'userId'
    , 'name'
    , 'isHidden'
    , 'numProducts'
    , 'photoUrl'
    ]

  , defaults: {
      'name':           'New Collection'
    , 'isHidden':       true
    , 'numProducts':    0
    , 'photoUrl':       null
    }

  , resource: 'products'

  , getSupplementalIds: function(){
      return [user.get('id')];
    }

  , getProducts: function(options, callback){
      if (typeof options == 'function'){
        callback = options;
      }
      api.collections.products.apply({}, this.getSupplementalIds().concat(options, callback));
    }

  , addProduct: function(pid, callback){
      api.collections.add.apply(
        {}
      , this.getSupplementalIds().concat(this.attributes.id, pid, callback)
      );
    }

  , removeProduct: function(pid, callback){

    }
  });
});