define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./business-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-business'

  , events: {
      'click .view-punchcard':          'onViewPunchCardClick'
    , 'click .product-item':            'onProductItemClick'
    }

  , initialize: function(){
      this.business = {};
      this.locations = [];
      return this;
    }

  , onShow: function(options){
      if (options.businessId != this.business.id){
        this.changeBusiness(options.businessId, options.locationId);
      }
      else if (options.locationId != this.currentLocation.id)
        this.changeLocation(options.locationId);
    }

  , changeBusiness: function(id, lid){
      var this_ = this;
      troller.spinner.spin();

      utils.parallel({
        business: function(done){
          api.businesses.get(id, function(error, business, meta){
            done(error, business);
          })
        }

      , locations: function(done){
          api.businesses.locations.list(id, function(error, locations, meta){
            done(error, locations);
          })
        }

      , products: function(done){
          var options = {
            include: ['categories', 'collections']
          , limit: 1000
          };

          api.businesses.products.list(id, options, function(error, products, meta){
            done(error, products);
          });
        }
      }, function(error, results){
        if (error) return troller.error(error);

        this_.destroyProductEvents();

        this_.business    = results.business;
        this_.locations   = results.locations;
        this_.categories  = utils.getProductsByCategory( results.products );
        this_.products    = utils.index(results.products, 'id');

        utils.index(this_.locations, this_.locationsById = {}, 'id');

        if (lid)
          this_.currentLocation = this_.locations.length > 0 ? this_.locationsById[lid] : null;
        else
          this_.currentLocation = this_.locations.length > 0 ? this_.locations[0] : null;

        troller.spinner.stop();

        this_.render();

        this_.setupProductEvents();
      });
    }

  , changeLocation: function(id){
      if (!this.locationsById[id]) return troller.error("Cannot find Location ID: " + id);

      this.currentLocation = this.locationsById[id];
      this.render();
      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          business:   this.business
        , location:   this.currentLocation
        , categories: this.categories
        })
      );
      return this;
    }

  , setupProductEvents: function(){
      this._boundWltChange = utils.bind(this.onWltChange, this);

      for (var id in this.products){
        troller.on('product:' + id + ':change:wlt', this._boundWltChange);
      }

      return this;
    }

  , destroyProductEvents: function(){
      if (this._boundWltChange){
        for (var id in this.products){
          troller.off('product:' + id + ':change:wlt', this._boundWltChange);
        }
      }

      return this;
    }

  , onWltChange: function(change, model){
      if (change != 'like') return;

      this.$el.find('#product-list-item-' + model.id + ' .product-menu-like-count').html(model.likes);
    }

  , onViewPunchCardClick: function(e){
      e.preventDefault();

      if (!user.get('loggedIn')) return troller.promptUserLogin();

      troller.spinner.spin();

      api.loyalty.userBusiness( user.get('id'), this.business.id, function(error, result){
        troller.spinner.stop();
        if (error) return troller.error(error);

        troller.modals.open('punchcard', { punchcard: result });
      });
    }

  , onProductItemClick: function(e){
      while (e.target.className.indexOf('product-item') == -1)
        e.target = e.target.parentElement;

      troller.modals.open('product-details', {
        product: this.products[ utils.dom(e.target).data('id') ]
      });
    }
  });
});