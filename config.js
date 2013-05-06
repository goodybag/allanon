define(function(require){
  var config = {
    default: {

      niceNames: {
        lat:            'Latitude'
      , lon:            'Longitude'
      , phone:          'Phone Number'
      , city:           'City'
      , zip:            'Zip'
      , name:           'Name'
      , street1:        'Street 1'
      , street2:        'Street 2'
      , description:    'Description'
      , categories:     'Categories'
      , tags:           'Tags'
      , photoUrl:       'Photo'
      , price:          'Price'
      , order:          'Order'
      }

    , typekitUrl: '//use.typekit.net/vhr1yyf.js'

    , defaults: {
        photoUrl: 'http://cdn.filepicker.io/api/file/TovGkwF7TCeFj3MQowEr'
      }

    , spinner: {
        lines: 13             // The number of lines to draw
      , length: 20            // The length of each line
      , width: 10             // The line thickness
      , radius: 30            // The radius of the inner circle
      , corners: 1            // Corner roundness (0..1)
      , rotate: 0             // The rotation offset
      , direction: 1          // 1: clockwise, -1: counterclockwise
      , color: '#000'         // #rgb or #rrggbb
      , speed: 1              // Rounds per second
      , trail: 60             // Afterglow percentage
      , shadow: false         // Whether to render a shadow
      , hwaccel: false        // Whether to use hardware acceleration
      , className: 'spinner'  // The CSS class to assign to the spinner
      , zIndex: 2e9           // The z-index (defaults to 2000000000)
      , top: 'auto'           // Top position relative to parent in px
      , left: 'auto'          // Left position relative to parent in px
      }
    }

  , dev: {
      apiUrl: 'http://localhost:3000/'
    }

  , prod: {
      apiUrl: 'http://magic.goodybag.com/'
    }
  };

  for (var key in config.default){
    if (!(key in config.dev)) config.dev[key]   = config.default[key];
    if (!(key in config.prod)) config.prod[key] = config.default[key];
  }

  // Build step will change this to prod
  return config.prod;
});