define(function(require) {
  var utils      = require('utils');
  var api        = require('api');
  var config     = require('config');
  var troller    = require('troller');
  var Collection = require('./collection');

  var getCollectionLookAheadFn = function(uid, collection){
      var options = {
        limit: 3
      , offset: parseInt(Math.random() * (collection.numProducts - 3))
      };

      if (options.offset < 0) options.offset = 0;

      return function(done){
        api.collections.products(uid, collection.id, options, function(error, results, meta){
          done(error, results);
        });
      };
    }
  ;

  var UserCollections = utils.Collection.extend({
    model: Collection
  , url: function() { return '/consumers/' + this.user.id + '/collections'; }
  , fetch: function(options) {
      options = options || {};
      var success = options.success;
      options.success = function(coll, resp, opts) {
        if (opts.withSecondaries) coll.invoke('getSecondaries');
        success.apply(this, arguments);
      };
      utils.Collection.prototype.fetch.call(this, options);
    }
  });

  return utils.Model.extend({
    defaults: {
      avatarUrl:  config.defaults.avatarUrl
    }

  , urlRoot: '/consumers'

  , initialize: function(attrs, options) {
      this.collections = new UserCollections([], {user: this});
    }

  // TODO: figure out why this is a separate route
  , updatePassword: function(currPw, newPw, callback){
      utils._ajax({
        type: 'POST'
      , url: config.apiUrl + 'consumers/' + this.get('id') + '/password'
      , data: { password: newPw }
      , headers: {
          authorization: 'Basic ' + utils.base64.encode( this.get('email') + ":" + currPw )
        }
      , xhrFields: { withCredentials: true }
      , crossDomain: true
      , success: function(results){
          if (typeof results == 'string' && results) results = JSON.parse(results);
          results = results || {};
          callback && callback(results.error, results.data, results.meta);
        }
      , error: function(error, results, res, r){
          try {
            callback && callback(error.responseText ? JSON.parse(error.responseText).error : error);
          } catch (e) {
            callback && callback({
              type: 'UNKNOWN'
            , message: "An unknown error occurred"
            });
          }
        }
      });

      return this;
    }

  // TODO: is this just this.fetch?
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

  , auth: function(email, password, remember, callback){
      if (typeof remember === 'function' && callback == null) {
        callback = remember;
        remember = null;
      }

      var this_ = this;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback ? callback(error) : troller.error(error);

        if (loggedIn) return callback ? callback() : null;

        this_.set('email', email);

        api.session.auth(email, password, remember, function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.loggedIn = true;
          this_.set(result);

          this_.getConsumerRecord(function(error, result){
            if (error) return callback ? callback(error) : troller.error(error);

            this_.trigger('auth');
            troller.trigger('user.auth')
            troller.analytics.track('Auth Email');


            if (callback) callback();
          });
        });
      });
    }

  , oauth: function(code, callback){
      var this_ = this;

      api.session.oauth(code, function(error, result){
        // Maybe leave it to the callback to tell app about error
        if (error) return callback ? callback(error) : troller.app.error(error);

        this_.loggedIn = true;
        this_.set(result);

        this_.trigger('auth');
        troller.trigger('user.auth')
        troller.analytics.track('Auth Facebook');

        if (callback) callback(null, result);
      });
    }

  , register: function(email, password, username, callback){
      if (typeof username === 'function' && callback == null) {
        callback = username;
        username = null;
      }

      var this_ = this;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback ? callback(error) : troller.error(error);

        if (loggedIn) return callback ? callback() : null;

        this_.set('email', email);
        this_.set('username', username);

        var data = { email: email,
                     password: password,
                     screenName: username
                   };

        api.consumers.create(data, function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.loggedIn = true;
          this_.set(result);

          this_.getConsumerRecord(function(error, result){
            if (error) return callback ? callback(error) : troller.error(error);

            this_.trigger('auth');
            troller.trigger('user.auth')
            troller.analytics.track('User Registered Email');

            if (callback) callback();
          });
        });
      });
    }

  , completeRegistration: function(token, email, password, username, callback) {
      if (typeof username === 'function' && callback == null) {
        callback = username;
        username = null;
      }

      var data = { email: email,
                   password: password,
                   screenName: username
                 };
      api.users.completeRegistration(token, data, function(error, result) {
        if (error) return callback ? callback(error) : troller.error(error);

        this_.set('email', email);
        this_.set('username', username);
        this_.loggedIn = true;
        this_.set(result);

        this_.getConsumerRecord(function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.trigger('auth');
          troller.trigger('user.auth')

          if (callback) callback();
        });
      });
    }

  , logout: function(callback){
      callback = callback || utils.noop;

      var this_ = this;

      api.session.destroy(function(error){
        if (error) return callback ? callback(error) : null;

        this_.clear();
        this_.set(this_.defaults);
        this_.loggedIn = false;
        this_.trigger('deauth');
        troller.trigger('user.deauth')

        if (callback) callback();
      })
    }

  , isLoggedIn: function(callback){
      var this_ = this;
      // We previously set this to true, so it must be true!
      if (this.loggedIn === true) return callback ? callback(null, true) : null;

      // We're uncertain, so make an api call
      api.session.get(function(error, result){
        if (error) return callback ? callback(error) : troller.app.error(error);

        if (!result || !result.id) return callback ? callback(null, false) : null;

        this_.loggedIn = true;
        this_.set(result);

        this_.getConsumerRecord(function(error, result){
          if (error) return callback ? callback(error) : troller.error(error);

          this_.trigger('auth');
          troller.trigger('user.auth')

          if (callback) callback();
        });
      });

      return this;
    }

  // TODO: replace with model.save on product model.  should work now.
  , updateProductFeelings: function(pid, feelings, callback){
      var this_ = this;

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
          , function(done){ this_.addToCollection('all',  pid, done); }
          , function(done){ this_.addToCollection('food', pid, done); }
          ]

        , total   = batch.length
        , current = 0
        , cancel  = false

        , done = function(){
            var track = { productId: pid };
            for (var key in feelings) track[key] = feelings[key];

            troller.analytics.track('Feelings.Update', track);

            if (callback) callback();
          }
        ;

        while (batch.length > 0){
          batch.pop()(function(error){
            if (cancel) return;

            if (error){
              cancel = true;
              return callback ? callback(error) : troller.error(error);
            }

            if (++current >= current && callback) done();
          });
        }
      });
    }

  // TODO: again, this is just this.save()
  , setKeytag: function(keytag, callback) {
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

        api.consumers.update(this_.get('id'), {cardId:keytag}, callback);
      });
    }

  , forgotPassword: function(email, callback) {
      var url = 'users/password-reset';
      utils.api.post(url, {email: email}, callback);
    }

  , resetPassword: function(token, password, callback) {
      var url = 'users/password-reset/' + token;
      utils.api.post(url, {password: password}, callback);
    }
  });
});
