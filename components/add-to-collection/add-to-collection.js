define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')
  , template  = require('hbt!./add-to-collection-tmpl')

  , getSaveFn = function(action, cid, pid){
      return function(done){
        if (action == 'add')
          user.addToCollection( cid, pid, done );
        else
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
        , product:      this.product
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

      for (var id in this.pending.add){
        fns.push( getSaveFn( 'add', id, this.product.id ) );
        this.product.collections.push(id);
      }

      for (var id in this.pending.remove){
        fns.push( getSaveFn( 'remove', id, this.product.id ) );
        this.product.collections = utils.without(this.product.collections, id);
      }

      utils.parallel( fns, function(error, results){
        if (error) return callback ? callback(error) : troller.error(error);

        // Reset pending
        this_.cancel();
      });

      return this;
    }

  , onCheckboxChange: function(e){
      var val = e.target.value;

      if (e.target.checked){
        // Add to pending adds, remove from pending removes
        if (!this.pending.add[val]){
          if (this.pending.remove[val]){
            delete this.pending.remove[val];
            this.numPending--;
          } else {
            this.pending.add[val] = true;
            this.numPending++;
          }
        }
      } else {
        // Add to pending removes, remove from pending adds
        if (!this.pending.remove[val]){
          if (this.pending.add[val]){
            console.log("SHouldnt be here", this.pending.add[val])
            delete this.pending.add[val];
            this.numPending--;
          } else {
            this.pending.remove[val] = true;
            this.numPending++;
          }
        }
      }
console.log('Collection Change:', val, e.target.checked, this.pending, this.numPending)
      this.trigger('checkbox:change', val, e.target.checked);
    }
  });
});