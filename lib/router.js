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

    , '_=_':                                              'singlyOauth'
    , 'reset-password/:token':                            'resetPassword'
    , 'complete-registration/:token':                     'completeRegistration'
    , 'card-update/:token':                               'cardUpdate'

    , 'explore':                                          'explore'
    , 'explore/products/:id':                             'explore'
    , 'explore/products/:id/add-new-collection':          'explore'

    , 'explore/:type':                                    'explore'
    , 'explore/:type/products/:id':                       'explore'
    , 'explore/:type/products/:id/add-new-collection':    'explore'

    , 'collections':                                      'collections'

    , 'collections/:cid':                                 'redirectToExploreCollection'
    , 'collections/:cid/explore':                         'exploreCollection'
    , 'collections/:cid/explore/products/:pid':           'exploreCollection'

    , 'settings':                                         'settings'

    , 'my-punchcards':                                    'myPunchcards'

    , 'businesses/:bid':                                  'singleBusiness'
    , 'businesses/:bid/locations/:lid':                   'singleBusiness'

    , 'locations':                                        'locations'
    , 'locations/:lid':                                   'singleLocation'

    , 'legal':                                            'legal'
    , 'privacy':                                          'privacy'
    , 'charities':                                        'charities'
    , 'gb-for-businesses':                                'gb-for-businesses'
    , 'about-us':                                         'about-us'
    , 'how-it-works':                                     'how-it-works'
    , 'support':                                          'support'

    , '*404':                                             'catchall'
    }

  , index: function(){
      utils.history.navigate('/explore', { trigger: true, replace: true });
    }

  , singlyOauth: function(){
      var code = utils.parseQueryParams().code;

      // Refresh, getting rid of ?code=alksdjflkjasdkfj
      if (!code) return window.location.href = '/';

      user.oauth(code, function(error){
        if (error) return troller.error(error);

        window.location.href = utils.cookie('gb_hash') ? ('/' + utils.cookie('gb_hash')) : '/';
      });
    }

  , resetPassword: function(token) {
      troller.modals.close();
      troller.modals.open('reset-password', {token: token});
      troller.analytics.pageview();
    }

  , completeRegistration: function(token) {
      troller.modals.close();
      troller.modals.open('complete-registration', {token: token});
      troller.analytics.pageview();
    }

  , cardUpdate: function(token) {
      troller.modals.close();
      troller.app.changePage('card-update', {token: token});
      troller.analytics.pageview();
    }

  , explore: function(type, productId){
      if (+type > 0 || +type <= 0) {
        productId = type;
        type = null;
      }

      troller.modals.close();

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

        troller.app.changePage('explore', options, function(error, page){
          if (error) return troller.error(error);
        });

        // If we're on a single product view, then open the modal
        if (productId){
          troller.modals.open('product-details', { productId: productId }, function(error, modal){
            if (error) return troller.error(error);

            modal.once('close', function(){
              troller.app.setTitle('Explore Goodybag');
            });

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

      // if (!user.get('loggedIn'))
      //   return troller.promptUserLogin({ fromUrlChange: true });

      // troller.spinner.spin();

      troller.app.changePage('collections', function(error, view){
        if (error) return troller.error(error);

        troller.spinner.spin();

        user.getCollections({ withSecondaries: true, force: true }, function(error, collections){
          if (error) return troller.error(error);

          view.provideCollections(collections);
          troller.spinner.stop();
          view.render();
        });
      });
    }

  , redirectToExploreCollection: function(cid) {
      utils.history.navigate('/collections/'+cid+'/explore', {trigger: true});
    }

  , exploreCollection: function(cid, pid){
      troller.modals.close();

      if (!user.get('loggedIn'))
        return troller.promptUserLogin({ fromUrlChange: true });

      troller.spinner.spin();

      api.collections.get(user.get('id'), cid, function(error, collection){
        troller.spinner.stop();
        if (error) {
          if (error.status === 404 || parseInt(error.httpCode) === 404) {
            troller.modals.close(null, {silent: true});
            troller.app.changePage('404');
            return;
          }
          return troller.error(error);
        }

        troller.app.changePage('explore-collection', { collection: collection }, function(error, page){
          page.render();

          if (!pid) return;

          troller.modals.open('product-details', { productId: pid }, function(error, modal){
            modal.once('close', function(){
              troller.app.setTitle(page.title);
            });
          });
        });
      });
    }

  , settings: function(){
      troller.modals.close();

      if (!user.get('loggedIn'))
        return troller.promptUserLogin({ fromUrlChange: true });

      troller.app.changePage('settings');
    }

  , myPunchcards: function(){
      troller.modals.close();

      if (!user.get('loggedIn'))
        return troller.promptUserLogin({ fromUrlChange: true });

      troller.app.changePage('my-punchcards', { renderOnce: true });
    }

  , legal: function(){
      troller.modals.close();

      troller.app.changePage('legal', { renderOnce: true });
    }

  , privacy: function(){
      troller.modals.close();

      troller.app.changePage('privacy', { renderOnce: true });
    }

  , charities: function(){
      troller.modals.close();

      troller.app.changePage('charities', { renderOnce: true });
    }

  , 'gb-for-businesses': function(){
      troller.modals.close();

      troller.app.changePage('gb-for-businesses', { renderOnce: true });
    }

  , 'about-us': function(){
      troller.modals.close();

      troller.app.changePage('about-us', { renderOnce: true });
    }

  , 'how-it-works': function(){
      troller.modals.close();

      troller.app.changePage('how-it-works', { renderOnce: true });
    }

  , 'support': function() {
      troller.modals.close();
      troller.app.changePage('support', { renderOnce: true });
    }

  , locations: function(){
      troller.modals.close();

      troller.app.changePage('locations');
    }

  , singleLocation: function(id){
      troller.modals.close();

      troller.app.changePage('locations', { businessId: id });
    }

  , singleBusiness: function(id, lid){
      troller.modals.close();

      troller.app.changePage('business', { businessId: id, locationId: lid }, function(error, view){
        if (error) return troller.error(error);
      });
    }

  , catchall: function() {
      troller.modals.close();
      troller.app.changePage('404');
    }
  });
});
