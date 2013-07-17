define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , template  = require('hbt!./product-search-tmpl');

  return utils.View.extend({
    className: 'product-search-view'

  , events: {
      'submit #explore-search-form':           'onSearchSubmit'
    , 'keyup .field-search':                   'onSearchSubmit'
    , 'click .search-form-btn':                'onSearchSubmit'
    , 'click .field-search-clear':             'onSearchClearClick'
    }

  , initialize: function(options) {
      options = options || {};

      // 666ms based on averge users of 40 wpm.
      this.throttle = options.throttle || 666;

      return this;
    }

  , render: function() {
      this.$el.html(
        template({ })
      );

      return this;
    }

  , onSearchSubmit: function(e) {
      e.preventDefault();
      console.log('hi');
    }
    
  });
});
