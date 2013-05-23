define(function(require){
  var
    Handlebars = require('handlebars')
  , config     = require('config')
  , utils      = require('utils')

  , fixTime = function(val){
      if (!val) return "??";

      val = val.split(':');
      var ampm = "AM";

      if (val[0] >= 12){
        ampm = "PM";

        if (val[0] > 12){
          val[0] -= 12;
        }
      }

      if (val[0] === "00") val[0] = "12";

      return val[0] + ":" + val[1] + " " + ampm;
    }
  ;

  // Supports a for loop up to context, typeof context == array, typeof context == object
  Handlebars.registerHelper('for', function(context, options){
    var output = "";

    if (+context >= 0 || +context < 0){
      for (var i = 0; i < context; ++i){
        output += options.fn({ index: i });
      }
    } else if (utils.isArray(context)) {
      for (var i = 0, l = context.length; i < l; ++i){
        output += options.fn(context[i]);
      }
    } else if (typeof context == 'object') {
      for (var key in context){
        output += options.fn({ key: key, value: context[key] });
      }
    } else {
      output = options.inverse(this);
    }

    return output;
  });

  Handlebars.registerHelper('forObj', function(obj, block){
    var html = "";
    for (var key in obj){
      html += block({ key: key, value: obj[key] });
    }
    return html;
  });

  Handlebars.registerHelper('filepicker', function(url, width, height){
    if (!url) url = config.defaults.photoUrl;
    else url = url.replace('www', 'cdn');

    if (url.indexOf('convert') == -1)
      url += "/convert?cache=true&fit=crop"

    url += "&w=" + (width   || 100);
    url += "&h=" + (height  || 100);

    return url;
  });

  Handlebars.registerHelper('money', function(value){
    value = value || 0;
    return parseFloat(value / 100, 10).toFixed(2);
  });

  Handlebars.registerHelper('defaultBusinessLogo', function(url){
    return url || config.defaults.business.logoUrl;
  });

  Handlebars.registerHelper('arrayLen', function(a, b, options){
    return options[a.length == b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('eq', function(a, b, options){
    return options[a == b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('dneq', function(a, b, options){
    return options[a != b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('lt', function(a, b, options){
    return options[a < b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('lte', function(a, b, options){
    return options[a <= b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('gt', function(a, b, options){
    return options[a > b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('gte', function(a, b, options){
    return options[a >= b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('truncate', function(str, max){
    if (!str) return "";
    if (str.length <= max) return str;
    return str.substring(0, max) + "...";
  });

  Handlebars.registerHelper('in', function(set, item, options){
    // Set is array of objects with id property and item is object with id
    if (typeof item == 'object' && set.length > 0 && typeof set[0] == 'object' && item.id && set[0].id){
      for (var i = 0, l = set.length; i < l; ++i){
        if (set[i].id == item.id){
          return options.fn(this);
        }
      }
      return options.inverse(this);
    }

    // Set is array of objects with id property and item is id
    if (set.length > 0 && typeof set[0] == 'object' && set[0].id){
      for (var i = 0, l = set.length; i < l; ++i){
        if (set[i].id == item){
          return options.fn(this);
        }
      }
      return options.inverse(this);
    }

    // Set is just an array or string
    if (set.indexOf(item) > -1) return options.fn(this);
    return options.inverse(this);
  });
});