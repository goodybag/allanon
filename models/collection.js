define(function(require){
  var
    utils   = require('utils')
  , config  = require('config')
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
  });
});