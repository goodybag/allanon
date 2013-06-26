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

  , title: 'My Collections'

  , events: {
      'click .add-new-collection':          'onNewCollectionClick'
    , 'click .collection':                  'onCollectionClick'
    }

  , initialize: function(){
      troller.on('user:collections:change', utils.bind(this.render, this));
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

  , onCollectionClick: function(e){
      if (e.target.className.indexOf('add-new-collection') > -1) return;

      // Get parent LI
      while (e.target.tagName != 'LI') e.target = e.target.parentElement;

      var id = $(e.target).data('id'), collection;

      for (var i = 0, l = this.collections.length; i < l; ++i){
        if (this.collections[i].id == id){
          collection = this.collections[i];
          break;
        }
      }

      utils.navigate('/collections/' + collection.id + '/explore');
      troller.app.changePage('explore-collection', { collection: collection });
    }

  , onNewCollectionClick: function(e){
      troller.modals.open('add-new-collection');
    }
  });
});