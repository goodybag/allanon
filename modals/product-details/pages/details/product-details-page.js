define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('components')

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

  , initialize: function(options) {
      return this;
    }

  , provideModel: function(model) {
      this.stopListening(this.model);
      this.model = model;
      this.listenTo(this.model, 'change:likes', this.onChangeLikeCount);
      this.children.wlt.provideModel(this.model);
      return this;
    }

  , render: function() {
      this.$el.html(
        template({
          product: this.model.toJSON()
        })
      );
      this.applyRegions();
      return this;
    }

  , onChangeLikeCount: function(e) {
      this.$el.find('.product-stat-likes > .product-stat-value').text(this.model.get('likes'));
    }

  , onAddToCollections: function(e){
      var this_ = this;
      if (!user.get('loggedIn')) return troller.promptUserLogin();
      this.pageManager.changePage('add-to-collections', { product: this.model });
    }
  });
});
