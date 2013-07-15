**Components.Alert** extends utils.View

**Example**

Constructing a new Alert view

    var alert = require('Components').Alert({
      success: true
    , header: 'Settings Saved!'
    , message: 'You are very handsome.'
    });
    
Render and attach alert view to parent $el

    alert.render();    
    this.$el.find('alert-container').html(alert.$el);
    
Usage

    alert.hide();
    alert.show();
    
Change options

    alert.setOptions({
      header: 'Oh noes!'
    , message: 'Passwords do not match, please try again.'
    });
