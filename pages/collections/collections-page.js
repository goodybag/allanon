define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./collections-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-collections'

  , events: {
      'click .add-new-collection':          'onNewCollectionClick'
    }

  , initialize: function(){
      troller.on('user:collections:change', utils.bind(this.render, this));
    }

  , onShow: function(options){

    }

  , provideCollections: function(collections){
      this.collections = collections;
      return this;
    }

  , render: function(){
      // Ensure secondaries
      for (var i = 0, l = this.collections.length; i < l; ++i){
        if (!this.collections[i].secondaries)
          this.collections[i].secondaries = [{}, {}, {}];
      }

      this.$el.html( template({ collections: this.collections }) );
      return this;
    }

  , onNewCollectionClick: function(e){
      troller.modals.open('add-new-collection');
    }
  });
});