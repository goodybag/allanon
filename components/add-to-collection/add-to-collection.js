define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')
  , template  = require('hbt!./add-to-collection-tmpl')

  , getAddFn = function(cid, pid){
      return function(done){
        user.addToCollection( cid, pid, done );
      };
    }

  , getRemoveFn = function(cid, pid){
      return function(done){
        user.removeFromCollection( cid, pid, done );
      };
    }
  ;

  return utils.View.extend({
    className: 'add-to-collection-view'

  , events: {
      'change input[type="checkbox"]':      'onCheckboxChange'
    }

  , initialize: function(options){
      this.pending = {
        add:    {}
      , remove: {}
      };

      this.numPending = 0;

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
          collections:  this.collections
        , product:      this.product.toJSON()
        })
      );
      return this;
    }

  , cancel: function(){
      this.pending = {
        add:    {}
      , remove: {}
      };

      this.numPending = 0;

      return this;
    }

  , save: function(callback){
      var fns = [], this_ = this;

      var collections = this.product.get('collections');

      for (var id in this.pending.add){
        fns.push( getAddFn( id, this.product.id ) );
        collections.push(id);
      }

      for (var id in this.pending.remove){
        fns.push( getRemoveFn( id, this.product.id ) );
        collections = utils.without(collections, id);
      }

      this.product.set('collections', collections);

      utils.parallel( fns, function(error, results){
        if (error) return callback ? callback(error) : troller.error(error);

        // Reset pending
        this_.cancel();
      });

      return this;
    }

  , onCheckboxChange: function(e){
      var val = e.target.value;
      var newList = e.target.checked ? this.pending.add : this.pending.remove;
      var oldList  = e.target.checked ? this.pending.remove : this.pending.add;

      if (!oldList[val]) newList[val] = true;
      delete oldList[val];
      this.numPending = utils.size(this.pending.add) + utils.size(this.pending.remove);

      this.trigger('checkbox:change', val, e.target.checked);
    }
  });
});
