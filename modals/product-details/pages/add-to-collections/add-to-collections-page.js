define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , api         = require('api')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('../../../../components/index')

  , template    = require('hbt!./add-to-collections-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-add-to-collections'

  , events: {
      'click .btn-back':        'onCancelClick'
    }

  , children: {
      addToCollections: new Components.AddToCollections.Main()
    }

  , regions: {
      addToCollections:    '.add-to-collections'
    }

  , initialize: function(options){
      this.product = {};
      return this;
    }

  , onShow: function(options){
      this.product = options.product;

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
        template({ collections: this.collections })
      );

      this.applyRegions();

      this.delegateEvents();

      return this;
    }

  , onCancelClick: function(e){
      this.pageManager.changePage('details');
    }
  });
});