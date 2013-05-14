/**
 * Nix this for now.
 */

define(function(require){
  var
    utils   = require('utils')
  , troller = require('troller')
  ;

  return utils.View.extend({
    className: 'product-photo-viewer'

  , initialize: function(options){
      options = options || {};

      options.size = options.size || {
        width:  600
      , height: 600
      };

      return this;
    }

  , render: function(){
      return this;
    }
  });
});