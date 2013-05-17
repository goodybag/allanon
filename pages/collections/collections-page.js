define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , Components  = require('../../components/index')

  , template    = require('hbt!./collections-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-collections'

  , events: {
      'click .new-collection':          'onNewCollectionClick'
    }

  , initialize: function(){

    }

  , onShow: function(options){

    }

  , provideCollections: function(collections){
      this.collections = collections;
      return this;
    }

  , render: function(){
      this.$el.html( template({ collections: this.collections }) );
      return this;
    }

  , onNewCollectionClick: function(e){
      troller.modals.open('add-new-collection');
    }
  });
});