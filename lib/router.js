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

    , 'collections/:cid/explore':                         'exploreCollection'
    , 'collections/:cid/explore/products/:pid':           'exploreCollection'

    , 'settings':                                         'settings'

    , 'my-punchcards':                                    'myPunchcards'

    , 'legal':                                            'legal'
    , 'privacy':                                          'privacy'
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

      troller.spinner.spin();

      troller.app.changePage('collections', function(error, view){
        if (error) return troller.error(error);

        user.getCollections({ withSecondaries: true, force: true }, function(error, collections){
          if (error) return troller.error(error);

          view.provideCollections(collections);
          troller.spinner.stop();
          view.render();
        });
      });
    }

  , exploreCollection: function(cid, pid){
      troller.modals.close();
      troller.spinner.spin();

      api.collections.get(user.get('id'), cid, function(error, collection){
        if (error) return troller.error(error);

        troller.spinner.stop();
        troller.app.changePage('explore-collection', { collection: collection });

        if (pid) troller.modals.open('product-details', { productId: pid });
      });
    }

  , settings: function(){
      troller.modals.close();

      troller.app.changePage('settings');
    }

  , myPunchcards: function(){
      troller.modals.close();

      troller.app.changePage('my-punchcards');
    }

  , legal: function(){
      troller.modals.close();

      troller.app.changePage('legal');
    }

  , privacy: function(){
      troller.modals.close();

      troller.app.changePage('privacy');
    }
  });
});