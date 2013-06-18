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

    }

  , initialize: function(){
      this.business = {};
      this.locations = [];
      return this;
    }

  , onShow: function(options){
      if (options.businessId == this.business.id) return;

      this.changeBusiness(options.businessId);
    }

  , changeBusiness: function(id){
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
      }, function(error, results){
        if (error) return troller.error(error);

        this_.business = results.business;
        this_.locations = results.locations;

        utils.index(this_.locations, this_.locationsById = {}, 'id');

        this_.currentLocation = this_.locations.length > 0 ? this_.locations[0] : null;

        troller.spinner.stop();

        this_.render();
      });
    }

  , changeLocation: function(id){
      if (!this.locationsById[id]) return troller.error("Cannot find Location ID: " + id);

      this.currentLocation = this.locationsById[id];
      this.render();
      return this;
    }

  , render: function(){
    console.log(this.locationsById);
      this.$el.html(
        template({
          business: this.business
        , location: this.currentLocation
        })
      );
      return this;
    }
  });
});