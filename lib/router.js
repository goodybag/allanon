define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , user      = require('user')
  , api       = require('api')
  , config    = require('config')
  ;

  return utils.Router.extend({
    routes: {
      '':                                                 'index'

    , 'explore':                                          'explore'
    , 'explore/products/:id':                             'explore'
    , 'explore/products/:id/add-new-collection':          'explore'

    , 'explore/:type':                                    'explore'
    , 'explore/:type/products/:id':                       'explore'
    , 'explore/:type/products/:id/add-new-collection':    'explore'

    , 'collections':                                      'collections'

    , 'settings':                                         'settings'
    }

  , index: function(){
      console.log('home');
      // utils.history.navigate('/dashboard', { trigger: true });
    }

  , explore: function(type, productId){
      if (+type > 0 || +type <= 0) {
        productId = type;
        type = null;
      }

      if (!productId) troller.modals.close();

      if (!type) type = 'popular';

      troller.spinner.spin();

      (function(callback){
        if (type != 'nearby') return callback();

        utils.geo.getPosition(callback);
      })(function(error, position){

        if (error) position = config.defaults.position;

        var options = {};

        if (type) options.sort = '-' +
          (type == 'popular' ? 'popular'  : (
           type == 'nearby'  ? 'distance' : (
           type == 'random'  ? 'random'   : null
          )));

        if (position){
          options.lat = position.lat;
          options.lon = position.lon;
        }

        troller.app.changePage('explore', options);

        // If we're on a single product view, then open the modal
        if (productId){
          troller.modals.open('product-details', { productId: productId }, function(error, modal){
            if (error) return troller.error(error);

            if (utils.history.location.hash.indexOf('add-new-collection') == -1) return;

            // Ensure we've got a user id first
            user.isLoggedIn(function(error){
              if (error) return troller.error(error);

              // If we're in the add new collection phase, go to collections
              modal.goToAddToCollections();

              // Open add new collection modal
              troller.modals.open('add-new-collection');
            });

          });
        }
      });
    }

  , collections: function(){
      troller.modals.close();

      troller.app.changePage('collections', function(error, view){
        if (error) return troller.error(error);
      });
    }

  , settings: function(){
      troller.modals.close();

      troller.app.changePage('settings', function(error, view){
        if (error) return troller.error(error);
      });
    }
  });
});