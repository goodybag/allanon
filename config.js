define(function(require){
  var env = require('./environment');

  var config = {
    // A name for default that IE won't bitch at me for
    __def: {

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

    , segmentToken: 'gg9hhph26y'

    , filepickerKey: 'AF52P8LtHSd6VMD07XdOQz'

    , typekitUrl: '//use.typekit.net/vhr1yyf.js'

    , defaults: {
        photoUrl: 'http://cdn.filepicker.io/api/file/TovGkwF7TCeFj3MQowEr'
      , avatarUrl:'http://cdn.filepicker.io/api/file/31l3OEiQSaMKF3kazHCe'

        // Around Guadalup and E MLK blvd
      , position: {
          lat: 30.2818
        , lon: -97.7421
        }
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

    , ieOnlyModules: ['less!./styles/ie']

    , apiVersion: 1
    }

  , dev: {
      apiUrl: 'http://localhost:3000'
    , oauth: {
        redirectUrl: 'http://localhost:8080' // probably ought to be in environment
      }
    , proxyUrl: "http://localhost:3000/proxy.html"
    }

  , prod: {
      apiUrl: 'http://magic.goodybag.com'
    , oauth: {
        redirectUrl: 'http://www.goodybag.com'
      }
    , proxyUrl: "http://magic.goodybag.com/proxy.html"
    , segmentToken: 'o4oljlbmu5'
    }

  , staging: {
      apiUrl: 'http://magic.staging.goodybag.com'
    , oauth: {
        redirectUrl: 'http://www.staging.goodybag.com'
      }
    , proxyUrl: "http://magic.staging.goodybag.com/proxy.html"
    }
  };
  for (var key in config.__def){
    if (!(key in config[env.mode])) config[env.mode][key] = config.__def[key];
  }

  return config[env.mode];
});
