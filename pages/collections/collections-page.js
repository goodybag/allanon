define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , troller     = require('troller')
  , Components  = require('components')
  , user        = require('user')

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
      var self = this;
      user.collections.fetch({
        success: function() {
          self.provideCollections(user.collections);
          self.render();
        }
      , withSecondaries: true
      });
    }

  , onShow: function(options) {
      if (options && options.collections) {
        this.provideCollections(opitons.collections);
        this.render();
      }
    }

  , provideCollections: function(collections){
      this.stopListening(this.collections);
      this.collections = collections;
      this.listenTo(this.collections, 'change fetch:secondaries', this.render)
      return this;
    }

  , render: utils.debounce(function(){
      console.log('render collections');
      this.$el.html( template({ collections: this.collections.toJSON({withSecondaries: true}) }) );
      return this;
    }, 100)

  , onCollectionClick: function(e){
      var $target = utils.dom(e.target);
      if ($target.hasClass('add-new-collection')) return;

      var id = $target.closest('li.collection').data('id');
      var collection = this.collections.get(id);

      utils.navigate('/collections/' + collection.id + '/explore');
      troller.app.changePage('explore-collection', { collection: collection });
    }

  , onNewCollectionClick: function(e){
      troller.modals.open('add-new-collection');
    }
  });
});
