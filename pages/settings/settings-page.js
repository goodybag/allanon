define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , Components  = require('../../components/index')

  , template    = require('hbt!./settings-tmpl')
  ;

  return Components.Pages.Page.extend({
    className: 'page page-settings'

  , events: {
      'submit #form-settings':      'onFormSubmit'
    }

  , initialize: function(){
      this.model = user;
    }

  , render: function(){
      this.$el.html( template({ user: this.model.toJSON() }) );
      return this;
    }

  , onFormSubmit: function(e){
      var this_ = this;
      e.preventDefault();
      this.updateModelWithFormData();
      this.model.save(function(error){
        if (error) return troller.error(error, this_.$el);
      });
    }
  });
});