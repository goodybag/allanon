define(function(require){
  var
    utils = require('utils')
  , Base = require('./base')
  ;

  return Base.extend({
    acceptable: [
      'id'
    , 'name'
    , 'description'
    , 'price'
    , 'tags'
    , 'categories'
    , 'photoUrl'
    , 'businessId'
    ]

  , defaults: {
      id:                           'New'
    , name:                         'New Product'
    , price:                        0
    , tags:                         []
    , categories:                   []
    , description:                  null
    }

  , resource: 'products'
  });
});