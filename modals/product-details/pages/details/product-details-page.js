define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../../../components/index')

  , template    = require('hbt!./product-details-page-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-product-details'

  , events: {
      'click .btn-add-to-collection': 'onAddToCollections'
    }

  , children: {
      wlt: new Components.WLT.Main()
    }

  , regions: {
      wlt:    '.wlt'
    }

  , initialize: function(options){
      return this;
    }

  , provideModel: function(model){
      this.model = model;
      this.children.wlt.provideModel(this.model);
      this.children.wlt.on('wlt:change', utils.bind(this.onWltChange, this));
      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          product: this.model
        })
      );
      this.applyRegions();
      return this;
    }

  , onWltChange: function(change, model){
      // Update like count if necessary
      if (change == 'like')
        this.$el.find('.product-stat-likes > .product-stat-value').text(model.likes);
    }

  , onAddToCollections: function(e){
      var this_ = this;
      this.pageManager.changePage('add-to-collections', { product: this.model });
    }
  });
});