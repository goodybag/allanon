define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')
  , template  = require('hbt!./add-to-collection-tmpl')
  ;

  return utils.View.extend({
    className: 'add-to-collection-view'

  , initialize: function(options){
      return this;
    }

  , provideCollections: function(collections){
      this.collections = collections;
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
  });
});