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
    console.log(this.product, this.collections);
      this.$el.html(
        template({
          collections:  this.collections
        , product:      this.product
        })
      );
      return this;
    }

  , onCheckboxChange: function(e){
      var val = e.target.value;
      if (e.target.checked){
        if (this.product.collections.indexOf(val) == -1)
          this.product.collections.push(val);

        user.addToCollection( e.target.value, this.product.id );
      } else {
        this.product.collections = utils.without(this.product.collections, val);
        user.removeFromCollection( e.target.value, this.product.id );
      }
console.log(val, this.product.collections, this.collections);
    }
  });
});