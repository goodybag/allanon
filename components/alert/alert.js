define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , template  = require('hbt!./alert-tmpl');

  return utils.View.extend({
    className: 'alert-view'

  , events: {
      'click .alert .close':  'onCloseClick'
    }

  , initialize: function(options) {
      this.setOptions(options);
      this.hide();
      return this;
    }

  , render: function() {
      this.$el.html(
        template({ 
          success:  this.success
        , header:   this.header
        , message:  this.message 
        })
      );

      return this;
    }

  , setOptions: function(options) {
      options         = options || {};

      this.success    = options.success || false;
      this.header     = options.header || 'Alert!';
      this.message    = options.message || 'Something has gone awry..';
      this.className  = options.className || this.className;      
    }

  , onCloseClick: function(e) {
      e.preventDefault();
      this.hide();
    }

  , hide: function() {
      this.$el.hide();
    }

  , show: function(options) {
      options = options || {};
      if(options.render)
        this.render();
      
      this.$el.show();
    }
  });
});