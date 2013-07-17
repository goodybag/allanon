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

  , byCategory: function(){
      var cats  = [{ name: 'Uncategorized', products: [] }];
      var _cats = { 'Uncategorized': cats[0] };
      var pcats;

      this.each(function(product){
        if (product.get('categories') && product.get('categories').length){
          pcats = product.get('categories');

          for (var ii = 0, ll = pcats.length; ii < ll; ++ii){
            if (!_cats[pcats[ii].name]){
              cats.push(
                _cats[pcats[ii].name] = {
                  name:     pcats[ii].name
                , products: [ product.toJSON() ]
                }
              );
            } else {
              _cats[pcats[ii].name].products.push( product.toJSON() );
            }
          }
        } else {
          _cats.Uncategorized.products.push( product.toJSON() );
        }
      });

      if (cats[0].products.length == 0) cats.shift();

      _cats = null;

      return cats;
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
      var this_ = this;
      this.punchcard   = new utils.Model({}, {url: function() {
        return '/consumers/' + user.get('id') + '/loyalty/' + this_.business.id;
      }});

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

      this.products = new BusinessProducts({}, { url: '/businesses/' + id + '/products' });

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
          this_.products.fetch({
            complete: done
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
      if (id == null) return this;
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
        , categories: this.products.byCategory()
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

      var self = this;

      this.punchcard.fetch({
        error: function(err) { troller.error(err); }
      , success: function() { troller.modals.open('punchcard', {punchcard: self.punchcard.toJSON()}); }
      , complete: function() { troller.spinner.stop(); }
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
