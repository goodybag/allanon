define(function(require){
  var geo = {
    isSupported: function(){
      return "geolocation" in navigator;
    }

  , getPosition: function(callback){
      if (!geo.isSupported())
        return callback ? callback(new Error('Geo Location not supported')) : null;

      var onSuccess = function(position){
        if (callback) return callback(null, {
          lat: position.coords.latitude
        , lon: position.coords.longitude
        }, position);
      };

      var onError = callback;

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
  };

  return geo;
});