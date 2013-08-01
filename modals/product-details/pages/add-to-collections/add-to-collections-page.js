define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , api         = require('api')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('components')

  , template    = require('hbt!./add-to-collections-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-add-to-collections'

  , events: {
      'click .btn-back':            'onBackClick'
    , 'click .btn-cancel':          'onCancelClick'
    , 'click .btn-save':            'onSaveClick'
    , 'click a.add-new-collection': 'onNewCollectionClick'
    }

  , children: {
      addToCollections: new Components.AddToCollections.Main()
    }

  , manualRender: true

  , regions: {
      addToCollections:    '.add-to-collections'
    }

  , initialize: function(options){
      options = options || {};
      this.product = options.product || {};

      if (options.product) this.children.addToCollections.provideProduct(this.product);

      var done = utils.bind(function() {
        this.provideCollections(user.collections);
        this.render();
      }, this);

      if (user.collections.length === 0)
        user.collections.fetch({ success: done });
      else
        done();


      this.children.addToCollections.on('checkbox:change', this.onCheckboxChange, this)

      return this;
    }

  , onShow: function(options){
      this.product = options.product;
      this.children.addToCollections.provideProduct(this.product);
      this.children.addToCollections.render();

      var this_ = this;

      if (options.collections) {
        this.provideCollections(options.collections);
        this.render();
      }

      this.delegateEvents();
      utils.invoke(this.children, 'delegateEvents');
    }

  , provideCollections: function(collections){
      this.stopListening(this.collections);
      this.collections = collections;
      this.listenTo(this.collections, 'change', this.render, this);

      this.children.addToCollections.provideCollections(collections);
      return this;
    }

  , provideProduct: function(product){
      this.product = product;
      this.children.addToCollections.provideProduct(product);
      return this;
    }

  , render: function(){
      this.$el.html(
        template({ collections: this.collections.toJSON(), product: this.product.toJSON() })
      );

      this.applyRegions();

      return this;
    }

  , onBackClick: function(e){
      e.preventDefault();
      this.pageManager.changePage('details');
    }

  , onCancelClick: function(e){
      e.preventDefault();
      this.children.addToCollections.cancel();
      this.pageManager.changePage('details');
    }

  , onSaveClick: function(e){
      e.preventDefault();
      this.children.addToCollections.save(utils.bind(this.onCheckboxChange, this));
      this.pageManager.changePage('details');
    }

  , onNewCollectionClick: function(e){
      e.preventDefault();
      utils.history.navigate(
        utils.history.location.hash + e.target.href.split('#')[1]
      );
      troller.modals.open('add-new-collection');
    }

  , onCheckboxChange: function(collectionId, checked){
      // TODO: think about using .toggle instead of .toggleClass('hide'
      var save = utils.size(this.children.addToCollections.pending) > 0;
      this.$el.find('.btn-cancel, .btn-save').toggleClass('hide', !save);
      this.$el.find('.btn-back').toggleClass('hide', save);
    }
  });
});
