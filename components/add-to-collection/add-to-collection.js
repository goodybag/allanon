define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')
  , template  = require('hbt!./add-to-collection-tmpl')
  ;

  return utils.View.extend({
    className: 'add-to-collection-view'

  , events: {
      'change input[type="checkbox"]':      'onCheckboxChange'
    }

  , initialize: function(options){
      return this;
    }

  , provideCollections: function(collections){
      this.collections = collections;
      return this;
    }

  , provideProduct: function(product){
      this.product = product;
      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          collections: this.collections
        })
      );
      return this;
    }

  , onCheckboxChange: function(e){
      user[(e.target.checked ? 'addTo' : 'removeFrom') + 'Collection'](
        parseInt(e.target.value)
      , this.product.id
      );
    }
  });
});