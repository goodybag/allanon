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
      this.pending = {};
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
          collections:  this.collections.toJSON()
        , product:      this.product.toJSON()
        })
      );
      this.delegateEvents();
      return this;
    }

  , cancel: function(){
      this.pending = {};
      return this;
    }

  , save: function(callback){
      var fns = utils.map(this.pending, function(val, key, obj) {
        var collection = this.collections.get(key);
        return utils.bind(collection.products[val ? 'addProduct' : 'removeProduct'], collection.products, this.product);
      }, this);

      var this_ = this;
      utils.parallel( fns, function(error, results){
        if (error) return callback ? callback(error) : troller.error(error);
        this_.cancel(); // Reset pending
        if (callback) callback(error, results);
      });

      return this;
    }

  , onCheckboxChange: function(e){
      var val = e.target.value;
      this.pending[val] == null ? this.pending[val] = e.target.checked : delete this.pending[val];
      this.trigger('checkbox:change', val, e.target.checked);
    }
  });
});
