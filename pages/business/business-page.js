define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , models      = require('models')
  , Components  = require('components')

  , template    = require('hbt!./business-tmpl')
  ;

  var BusinessProducts = utils.Collection.extend({
    model: models.Product
    , queryParams: {
      include: ['categories', 'collections']
      , limit: 1000
    }
  });

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
          var prods = new BusinessProducts({}, { url: '/businesses/' + id + '/products' });


          prods.fetch({
            complete: function(error) {
              done(error, prods);
            }
          });
        }
      }, function(error, results){
        troller.spinner.stop();

        if (error) {
          if (error.status === 404) {
            troller.modals.close(null, {silent: true});
            troller.app.changePage('404');
            return;
          }
          return troller.error(error);
        }

        this_.destroyProductEvents();

        this_.business    = results.business;
        this_.locations   = results.locations;
        this_.products    = results.products;

        var Category = utils.Collection.extend({ model: models.Product });
        var categories = utils.pluck(utils.union.apply(utils, this_.products.pluck('categories')), 'name').concat(['uncategorized']);
        this_.categories = utils.map(categories, function(name) {
          return {
            name: name
          , products: new Category( this_.products.filter(function(product) {
              if (name === 'uncategorized') return product.get('categories').length === 0;
              return utils.contains(utils.pluck(product.get('categories'), 'name'), name);
            }))
          };
        });

        utils.index(this_.locations, this_.locationsById = {}, 'id');

        if (lid) {
          var loc = this_.locationsById[lid];
          if (loc == null) {
            troller.modals.close(null, {silent: true});
            troller.app.changePage('404');
            return;
          }
          this_.currentLocation = this_.locations.length > 0 ? loc : null;
        } else
          this_.currentLocation = this_.locations.length > 0 ? this_.locations[0] : null;

        this_.render();

        this_.setupProductEvents();

        this_.title = this_.business.name;
        troller.app.setTitle(this_.business.name);
      });
    }

  , changeLocation: function(id){
      if (!this.locationsById[id]) {
        troller.modals.close(null, {silent: true});
        troller.app.changePage('404');
        return;
      }

      this.currentLocation = this.locationsById[id];
      this.render();
      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          business:   this.business
        , location:   this.currentLocation
        , categories: utils.map(this.categories, function(cat) { return {name: cat.name, products: cat.products.toJSON()}; })
        })
      );
      return this;
    }

  , setupProductEvents: function(){
      var self = this;
      this.products.each(function(product) {
        var selector = '#product-list-item-' + product.id + ' .product-menu-like-count';
        self.listenTo(product, 'change:likes', function(e) {
          self.$el.find(selector).html(product.get('likes'));
        });
      });

      return this;
    }

  , destroyProductEvents: function(){
      if (this.products) this.products.each(function(product) { this.stopListening(product); }, this);

      return this;
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
      var this_ = this;

      while (e.target.className.indexOf('product-item') == -1)
        e.target = e.target.parentElement;

      var product = this.products.get(utils.dom(e.target).data('id'));
      troller.app.setTitle(product.get('name'));

      troller.modals.open('product-details', {
        product: product
      }, function(error, modal){
        modal.once('close', function(){
          troller.app.setTitle(this_.title);
        });
      });
    }
  });
});
