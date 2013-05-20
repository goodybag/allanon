define(function(require){
  var
    utils   = require('utils')
  , troller = require('troller')
  ;

  return utils.View.extend({
    className: 'pages'

  , initialize: function(options){
      options = options || {};

      // Non-instantiated views
      this.Pages = options.Pages;

      // Instantiated views
      this.pages = {};

      this.parentView = options.parentView;

      // Current page
      this.current = null;

      return this;
    }

  , get: function(name){
      return this.pages[name];
    }

  , providePages: function(Pages){
      this.Pages = Pages;
      return this;
    }

  // , render: function(){
  //     return this.renderCurrent();
  //   }

  , renderCurrent: function(){
      if (this.current){
        this.pages[this.current].render();
        this.pages[this.current].delegateEvents();
      }
      return this;
    }

  , changePage: function(page, options, callback){
      if (typeof options == 'function'){
        callback = options;
        options = null;
      }

      if (!this.Pages[page]){
        // TODO: don't do this
        var error = {
          message: "Cannot find page: " + page
        , page: page
        };

        if (callback) callback(error);
        else troller.error(error);

        return this;
      }

      if (!this.pages[page]){
        // Attach parent view to Page
        if (this.parentView)
          this.Pages[page].prototype.parentView = this.parentView;

        this.pages[page] = new this.Pages[page](options);
        this.pages[page].hide(options);

        // Allow child pages to request change pages
        this.pages[page].setPageManager(this);

        // Set initial display to none so we can switch them out
        if (options && options.renderFn) options.renderFn();

        this.$el.append(this.pages[page].$el);
      }

      // Hide the current
      if (this.current) this.pages[this.current].hide();

      // Now show the new page
      this.pages[page].show(options);
      this.current = page;

      if (!callback){
        this.pages[page].render();
        this.pages[page].delegateEvents();
      }

      if (callback) callback(null, this.pages[page]);

      return this;
    }
  });
});