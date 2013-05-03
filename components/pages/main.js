define(function(require){
  var
    utils = require('utils')
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

  , providePages: function(Pages){
      this.Pages = Pages;
      return this;
    }

  , renderCurrent: function(){
      if (this.current){
        this.pages[this.current].render();
        this.pages[this.current].delegateEvents();
      }
      return this;
    }

  , changePage: function(page, options, callback){
      // if (this.current === page) return this;

      if (typeof options == 'function'){
        callback = options;
        options = null;
      }

      callback = callback || utils.noop;

      if (!this.Pages[page]) return callback({
        message: "Cannot find page: " + page
      , page: page
      }), this;

      if (!this.pages[page]){
        // Attach parent view to Page
        if (this.parentView)
          this.Pages[page].prototype.parentView = this.parentView;

        this.pages[page] = new this.Pages[page](options);
        this.pages[page].hide(options);

        // Set initial display to none so we can switch them out
        if (options && options.renderFn) options.renderFn();
        else this.pages[page].render();
        this.pages[page].delegateEvents();
        this.$el.append(this.pages[page].$el);
      }

      // Hide the current
      if (this.current) this.pages[this.current].hide();

      // Now show the new page
      this.pages[page].show(options);
      this.current = page;

      callback(null, this.pages[page]);

      return this;
    }
  });
});