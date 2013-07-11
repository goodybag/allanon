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

  , regions: {
      addToCollections:    '.add-to-collections'
    }

  , initialize: function(options){
      options = options || {};
      this.product = options.product || {};

      if (options.product) this.children.addToCollections.provideProduct(this.product);

      troller.on('user:collections:change', utils.bind(this.render, this));

      this.children.addToCollections.on('checkbox:change', utils.bind(this.onCheckboxChange, this))

      return this;
    }

  , onShow: function(options){
      this.product = options.product;
      this.children.addToCollections.provideProduct(this.product);

      var this_ = this;

      troller.spinner.spin();

      user.getCollections(function(error, collections){
        if (error) return troller.error(error);

        this_.provideCollections(collections);

        troller.spinner.stop();

        this_.render();
      });
    }

  , provideCollections: function(collections){
      this.collections = collections;
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
        template({ collections: this.collections, product: this.product })
      );

      this.applyRegions();

      this.delegateEvents();

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
      this.children.addToCollections.save();
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
      if (this.children.addToCollections.numPending == 0){
        this.$el.find('.btn-cancel, .btn-save').addClass('hide');
        this.$el.find('.btn-back').removeClass('hide');
      } else {
        this.$el.find('.btn-cancel, .btn-save').removeClass('hide');
        this.$el.find('.btn-back').addClass('hide');
      }
    }
  });
});
