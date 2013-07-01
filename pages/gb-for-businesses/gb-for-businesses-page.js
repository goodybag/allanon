define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./gb-for-businesses-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-gb-for-businesses'

  , title: 'Goodybag for Businesses'

  , events: {
      'submit #business-contact-form':      'onContactFormSubmit'
    }

  , initialize: function(){
      this.model = user;
    }

  , render: function(){
      this.$el.html( template() );
      return this;
    }

  , onContactFormSubmit: function(e){
      e.preventDefault();

      var this_ = this;

      troller.spinner.spin();

      utils.api.post(
        'businesses/contact-requests'

      , {
          name:         this.$el.find('.field-name').val()
        , businessName: this.$el.find('.field-businessName').val()
        , email:        this.$el.find('.field-email').val()
        , zip:          +this.$el.find('.field-zip').val()
        , comments:     this.$el.find('.field-comments').html()
        }

      , function(error){
          troller.spinner.stop();
          if (error) return troller.error(error, this_.$el);

          this_.$el.find('input, textarea').each(function(i, el){
            if ('value' in el) el.value = "";
            else el.innerHTML = "";
          });

          var $title = this_.$el.find('.form-title');
          var oldTitle = $title.html();

          $title.text("Thanks! We got your message and we'll be contact shortly");

          setTimeout(function(){ $title.html( oldTitle ) }, 5000);
        }
      );
    }
  });
});