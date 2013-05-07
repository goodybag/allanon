define(function(require){
  var
    utils   = require('../lib/utils')
  , api     = require('../lib/api')
  , troller = require('../lib/troller')
  ;

  return new (utils.Model.extend({
    defaults: {
      id:         18746
    , loggedIn:   false
    , email:      null
    , screenName: 'Goodybagger'
    }

  , initialize: function(){
      return this;
    }

  , getConsumerRecord: function(callback){
      var this_ = this;

      // Uhmm. yeah
      if (!this.get('id')) throw new Error('Cannot get consumer record when id is null');

      api.consumers.get(this.get('id'), function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.set(result);

        callback();
      });

      return this;
    }

  , auth: function(email, password, callback){
      var this_ = this;

      callback = callback || utils.noop;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback(error);

        if (loggedIn) return callback();

        this_.set('email', email);

        api.session.auth(email, password, function(error, result){
          if (error) return callback(error);

          this_.set('loggedIn', true);
          this_.set(result);

          this_.trigger('auth');
          troller.trigger('user.auth')

          callback();
        });
      });
    }

  , oauth: function(code, callback){
      var this_ = this;

      api.session.oauth(code, function(error, result){
        // Maybe leave it to the callback to tell app about error
        if (error) return troller.app.error(error), callback(error);

        this_.set('loggedIn', true);
        this_.set(result);

        this_.trigger('auth');
        troller.trigger('user.auth')

        callback(null, result);
      });
    }

  , logout: function(callback){
      callback = callback || utils.noop;

      var this_ = this;

      api.session.destroy(function(error){
        if (error) return callback(error);

        this_.set('loggedIn', false);
        this_.trigger('deauth');
        troller.trigger('user.deauth')

        callback();
      })
    }

  , isLoggedIn: function(callback){
      callback = callback || utils.noop;

      var this_ = this;
      // We previously set this to true, so it must be true!
      if (this.get('loggedIn') === true) return callback(null, true);

      // We're uncertain, so make an api call
      api.session.get(function(error, result){
        if (error) return callback(error);

        if (!result || !result.id) return callback(null, false);

        this_.set('loggedIn', true);
        this_.set(result);
        callback(null, true);
        this_.trigger('auth');
        troller.trigger('user.auth')
      });

      return this;
    }

  , updateProductFeelings: function(pid, feelings, callback){
      var this_ = this

      this.isLoggedIn(function(error, result){
        if (error) return callback ? callback(error) : troller.error(error);

        // For now, manually throw this guy in. We need to bring in
        // errors.js from magic
        if (!result){
          var error = {
            type:     'AUTHENTICATION'
          , message:  'You must be authenticated to perform this action'
          };

          return callback ? callback(error) : troller.error(error);
        }

        var
          batch = [
            function(done){ api.products.feelings(pid, feelings, done); }
          , function(done){ api.collections.add(this_.get('id'), 'all', pid, done); }
          , function(done){ api.collections.add(this_.get('id'), 'food', pid, done); }
          ]

        , total   = batch.length
        , current = 0
        , cancel  = false
        ;

        while (batch.length > 0){
          batch.pop()(function(error){
            if (cancel) return;

            if (error){
              cancel = true;
              return callback ? callback(error) : troller.error(error);
            }

            if (++current >= current && callback) callback();
          });
        }
      });

    }
  }))();
});