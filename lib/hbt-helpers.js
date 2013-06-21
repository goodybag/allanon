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

  , shortTime = function(time){
      if (!time) return "??";
      time = time.split(':');
      var result = "";
      var hour = parseInt(time[0]);
      var ampm = 'am';

      if (hour > 11) ampm = 'pm';

      if (hour > 12) hour -= 12;

      if (hour == 0) hour = 12;

      result = hour;

      if (time[1] != '00') result += ':' + time[1];

      result += ' ' + ampm;

      return result;
    }

  , daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  ;

  // Screw a general solution, only abbreviate if it's M-F
  Handlebars.registerHelper('biz-hours', function(location, block){
    if (!location) return "";
    var days = daysOfWeek.slice(0);
    var hours = [];
    var currentSeries = 1;
    var output = "";


    // Only loop to Friday
    for (var i = 1, l = days.length - 2; i < l; ++i){
      if (
        location['start' + days[i]] == location['start' + days[i - 1]] &&
        location['end'   + days[i]] == location['end'   + days[i - 1]]
      ) {
        currentSeries++;
      }
    }

    if (currentSeries == 5){
      hours.push({
        day:    'M-F'
      , begin:  shortTime( location.startMonday )
      , end:    shortTime( location.endMonday )
      });

      days = days.slice(5);
    }

    for (var i = 0, l = days.length; i < l; ++i){
      hours.push({
        day:    days[i].substring(0, 3)
      , begin:  shortTime( location['start' + days[i]] )
      , end:    shortTime( location['end' + days[i]] )
      });
    }

    for (var i = 0, l = hours.length; i < l; ++i){
      output += block.fn(hours[i]);
    }

    return output;
  });

  Handlebars.registerHelper('phone', function(str){
    if (str.indexOf("(") > -1) return str;
    return "(" + str.substr(0, 3) + ") " + str.substr(3, 3) + "-" + str.substr(6, 4);
  });

  Handlebars.registerHelper('uri', function(str){
    return str.replace(/\s/g, '+')
  });

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

  Handlebars.registerHelper('truncate', function(str, max, suffix){
    if (!str) return "";
    if (str.length <= max) return str;
    return str.substring(0, max) + (typeof suffix == 'string' ? suffix : "...");
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