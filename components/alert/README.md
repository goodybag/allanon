**Components.Alert.Main** extends utils.View

Example
-----

Constructing a new Alert view

    var alert = require('Components').Alert.Main({
      success: true
    , header: 'Settings Saved!'
    , message: 'You are very handsome.'
    });
    
Render and attach alert view to parent $el

    alert.render();    
    this.$el.find('alert-container').html(alert.$el);
    
Basic usage

    alert.hide();
    alert.show();
    
Swapping between alerts

    alert.show({
      success: true
    , header: 'Success!'
    , message: 'User settings saved'
    });
    
    ...
    
    alert.show({
      success: false
    , header: 'Validation Error:'
    , message: 'Last Name Missing'
    });

API
----

**new Alert.Main([options])**

The `options` object is used to populate the alert dialog. The following fields may be used:

  * success: boolean - For showing a success or error style alert
  * header: string - A bolded header
  * message: string - The main alert message
  * className: string - Override the $el class name
  * randomize: boolean - Override `message` with a default string. Comes in two flavors, based on the `success` 
    value.

**setOptions(options)**

Use `setOptions` to restyle the alert dialog. In addition to the above options, you can specify

  * render: boolean - Force re-rendering the view

**hide()**

Hides the alert box

**show([options])**

Shows alert box. Passing in `options` can be used for handling multiple types of 
alerts using a single Alert View.
