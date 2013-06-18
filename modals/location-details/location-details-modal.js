define(function(require){
  var
    utils       = require('utils')
  , troller     = require('troller')
  , user        = require('user')
  , config      = require('config')
  , Components  = require('../../components/index')
  , template    = require('hbt!./location-details-tmpl')
  ;

  return Components.Modal.Main.extend({
    className: 'modal hide fade modal-span7 location-details-modal'

  , tagName: 'section'

  , events: {

    }

  , initialize: function(options){
      Components.Modal.Main.prototype.initialize.apply(this, arguments);
      return this;
    }

  , onOpen: function(options){
      var this_ = this;

      this.business = options.business;
      this.render();

      this.checkModalHeightStuff();

      this.throttledResize = utils.throttle( function(e){
        this_.checkModalHeightStuff();
      }, 500);

      utils.dom(window).on('resize', this.throttledResize);
    }

  , onClose: function(){
      utils.dom(window).off('resize', this.throttledResize);
      utils.history.navigate('locations');
    }

  , render: function(){
      this.$el.html( template({ business: this.business }) );
    }

    // Make the modal do overflow scroll and set the modal content height
  , checkModalHeightStuff: function(){
    console.log("check modal");
      var $content = this.$el.find('.modal-content');
      var winHeight = parseInt(utils.dom(window).height());

      var buffer = 50 + (winHeight * 0.1);
      console.log(parseInt(this.$el.height()) + buffer, winHeight)
      if ((parseInt(this.$el.height()) + buffer) > winHeight){
        $content.css({
          'overflow-y': 'scroll'
        , 'height':     (winHeight - buffer) + "px"
        });
      } else if ($content.css('overflow-y') == 'scroll') {
        $content.css({
          'overflow-y': null
        , 'height':     'auto'
        });
      }
    }
  });
});
