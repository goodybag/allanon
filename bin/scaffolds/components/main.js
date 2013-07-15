define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , template  = require('hbt!./NAME-tmpl');

  return utils.View.extend({
    className: 'NAME-view'

  , events: {
      'change class-name':      'onClassNameChange'
    }

  , initialize: function(options) {
      return this;
    }

  , render: function() {
      this.$el.html(
        template({ })
      );

      return this;
    }
  });
});
