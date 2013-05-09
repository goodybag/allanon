define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , api       = require('api')
  , config    = require('config')
  ;

  return utils.Router.extend({
    routes: {
      '':                                                 'index'

    , 'explore':                                          'explore'
    , 'explore/products/:id':                             'explore'
    , 'explore/:type':                                    'explore'
    , 'explore/:type/products/:id':                       'explore'

    , 'collections':                                      'collections'

    , 'settings':                                         'settings'
    }

  , index: function(){
      console.log('home');
      // utils.history.navigate('/dashboard', { trigger: true });
    }

  , explore: function(type, productId){
    console.log('CALLED EXPLORE ROUTE');
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
        if (productId) troller.modals.open('product-details', { productId: productId });
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