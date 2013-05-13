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
    console.log('product-details-page.provideModel', model);
      this.model = model;
      this.children.wlt.provideModel(this.model);
      return this;
    }

  , render: function(){
    console.log('product-details-page.render');
      this.$el.html(
        template({
          product: this.model
        })
      );
      this.applyRegions();
    }

  , onWltChange: function(change, model){
      // Update like count if necessary
      if (change == 'like')
        this.$el.find('.product-stat-likes > .product-stat-value').text(model.likes);
    }

  , onShow: function(options){
console.log('called onshow');
    }

  , onHide: function(){

    }

  , onAddToCollections: function(e){
      this.pageManager.changePage('add-to-collections');
    }
  });
});