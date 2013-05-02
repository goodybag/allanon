define(function(require){
  var
    utils   = require('./utils')

  , Troller = function(){}
  ;

  Troller.prototype.add = function(name, definition){
    var key, obj = this;
    name = name.split('.');
    while (name.length > 0){
      key = name.shift();
      if (name.length === 0) obj[key] = definition;
      else if (typeof this[key] !== "object") obj[key] = {};
      obj = obj[key];
    }
    return this;
  };

  return new Troller();
});