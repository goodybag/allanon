define(function(require){
  var
    utils     = require('utils')
  , troller   = require('troller')
  , template  = require('hbt!./alert-tmpl');

  return utils.View.extend({
    className: 'alert-view'

  , successMessages: [
      'You are very handsome.'
    , 'Well done!'
    , 'That looks about right.'
    , 'You are the best.'
    , 'I like the way you think.'
    ]

  , errorMesages: [
      'It\'s only a flesh wound'
    , 'That ain\'t right'
    , 'I don\'t think we\'re in Kansas anymore'
    , 'Reticulating splines, please try again'
    ]

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
      this.randomize  = options.randomize || false;

      if (this.randomize)
        this.setRandomMessage();

      if (options.render)
        this.render();
    }

  , setRandomMessage: function() {
      if (this.success)
        this.message = this.successMessages[Math.floor(Math.random()*this.successMessages.length)];
      else
        this.message = this.errorMesages[Math.floor(Math.random()*this.errorMesages.length)];
    }

  , onCloseClick: function(e) {
      e.preventDefault();
      this.hide();
    }

  , hide: function() {
      this.$el.hide();
    }

  , show: function(options) {
      if (options)
         this.setOptions(options);
      this.$el.show();
    }
  });
});