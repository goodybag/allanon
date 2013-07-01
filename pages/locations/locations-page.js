define(function(require){
  var
    utils       = require('utils')
  , config      = require('config')
  , user        = require('user')
  , api         = require('api')
  , troller     = require('troller')
  , Components  = require('../../components/index')

  , template    = require('hbt!./locations-tmpl')
  , bizTmpl     = require('hbt!./business-tmpl')

  , requestMessages = [
      'Oh yeah, that\'s a good one!'
    , 'Roger. We\'ll get right on that'
    , 'We love that place too!'
    , 'We\'re putting our best people on the job'
    ]
  ;

  return Components.Pages.Page.extend({
    className: 'page page-locations'

  , title: 'Goodybag Locations'

  , events: {
      'click  .business-listing > .business':   'onBusinessClick'
    , 'submit .businesses-search':              'onBusinessSearch'
    , 'keyup  #business-search':                'onBusinessSearchKeyup'
    , 'submit .businesses-request':             'onBusinessRequest'
    }

  , initialize: function(){
      this.businesses = [];
      this.businessesPerRow = 5;
    }

  , onShow: function(options){
      options = options || {};

      if (this.businesses.length > 0){
        if (options.businessId) this.openBusiness(options.businessId);
        this.renderBusinesses();
        return;
      }

      var this_ = this;

      troller.spinner.spin();

      api.businesses.list(
        { limit: 1000, isGB: true, include: ['locations'] }
      , function(error, businesses){
          troller.spinner.stop();

          if (error) return troller.error(error);

          this_.businesses = businesses;
          this_.renderBusinesses();

          // Memoize
          this_.businessesById = {};
          for (var i = 0, l = businesses.length; i < l; ++i){
            this_.businessesById[businesses[i].id] = businesses[i];
          }

          if (options.businessId) this_.openBusiness(options.businessId);
        }
      );
    }

  , render: function(){
      this.$el.html( template() );

      this.$bizList = this.$el.find('#business-listing');
      this.$search  = this.$el.find('#business-search');
      this.$request = this.$el.find('#business-request');

      if (this.businesses.length > 0) this.renderBusinesses();

      return this;
    }

  , renderBusinesses: function(businesses){
      businesses = businesses || this.businesses;

      var fragment = document.createDocumentFragment();
      for (var i = 0, l = businesses.length, $el; i < l; ++i){
        $el = utils.dom(bizTmpl( businesses[i] ));

        // Make sure we place the gutter correctly
        if (i % this.businessesPerRow == 0)
          $el.addClass('first');
        if (i % this.businessesPerRow == (this.businessesPerRow - 1))
          $el.addClass('last');

        $el.find('.business-logo').on('error', utils.bind(this.onBusinessLogoError, this));

        fragment.appendChild( $el[0] );
      }

      this.$bizList.html( fragment );

      this.delegateEvents();

      return this;
    }

  , openBusiness: function(id){
      var this_ = this;

      troller.modals.open('location-details', { business: this.businessesById[id] }, function(error, modal){
        modal.once('close', function(){
          troller.app.setTitle(this_.title);
        });

        troller.app.setTitle(this_.businessesById[id].name);
      });

      return this;
    }

  , onBusinessClick: function(e){
      // Get parent LI
      while (e.target.tagName != 'LI') e.target = e.target.parentElement;

      var id = utils.dom(e.target).data('id');

      utils.history.navigate('/locations/' + id)
      this.openBusiness(id);
    }

  , onBusinessSearch: function(e){
      e.preventDefault();

      var search = this.$search.val().toLowerCase();

      if (search == "") return this.renderBusinesses();

      this.renderBusinesses( utils.filter(this.businesses, function(business){
        return business.name.toLowerCase().indexOf( search ) > -1;
      }));
    }

  , onBusinessRequest: function(e){
      e.preventDefault();

      var request = utils.trim(this.$request.val());

      if (request == "") return;

      utils.api.post(
        'businesses/requests'
      , { name: request }
      );

      this.$request.val("");

      var $label = this.$el.find('.businesses-request label');
      var oldText = $label.text();

      $label.fadeOut(function(){
        $label.text(
          requestMessages[ parseInt(Math.random() * requestMessages.length - 1 ) ]
        );

        $label.fadeIn(function(){
          setTimeout(function(){
            $label.fadeOut(function(){
              $label.text( oldText );
              $label.fadeIn();
            });
          }, 5000);
        });

      });

    }

  , onBusinessSearchKeyup: function(e){
      if (e.target.value == "") this.renderBusinesses();
    }

  , onBusinessLogoError: function(e){
      e.target.src = config.defaults.photoUrl;
    }
  });
});