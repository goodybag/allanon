define(function(require) {
  var utils      = require('utils');
  var api        = require('api');
  var config     = require('config');
  var troller    = require('troller');
  var Collection = require('./collection');

  var UserCollections = utils.Collection.extend({
    model: Collection
  , url: function() { return '/consumers/' + this.user.id + '/collections'; }
  , fetch: function(options) {
      options = options || {};
      var success = options.success;
      options.success = function(coll, resp, opts) {
        if (opts.withSecondaries) coll.invoke('getSecondaries');
        if (success) success.apply(this, arguments);
      };
      utils.Collection.prototype.fetch.call(this, options);
    }
  , initialize: function(attrs, options) {
      if (options && options.user) this.user = options.user;
    }
  });

  return utils.Model.extend({
    defaults: {
      avatarUrl:  config.defaults.avatarUrl
    }

  , urlRoot: '/consumers'

  , initialize: function(attrs, options) {
      this.collections = new UserCollections([], {user: this});
      this.on('auth', this.collections.fetch, this.collections);
      this.on('deauth', this.collections.reset, this.collections);
    }

  // TODO: figure out why this is a separate route
  , updatePassword: function(currPw, newPw, callback){
      utils.api.post('/consumers/' + this.id + '/password', {password: newPw}, callback, {
        headers: { authorization: 'Basic ' + utils.base64.encode( this.get('email') + ":" + currPw ) }
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

          this_.fetch({
            error: function(error){
              callback ? callback(error) : troller.error(error);
            }
          , success: function(result) {
              this_.trigger('auth');
              troller.analytics.track('Auth Email');

              if (callback) callback(null, result);
            }
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

          this_.fetch({
            error: function(error) {
              callback ? callback(error) : troller.error(error);
            }
          , success: function(result) {
              this_.trigger('auth');
              troller.analytics.track('User Registered Email');

              if (callback) callback(null, result);
            }
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

        this_.fetch({
          error: function(error) {
            callback ? callback(error) : troller.error(error);
          }
        , success: function(result) {
            this_.trigger('auth');

            if (callback) callback(null, result);
          }
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

        this_.fetch({
          error: function(error){
            callback ? callback(error) : troller.error(error);
          }
        , success: function(result) {
            this_.trigger('auth');
            if (callback) callback(null, result);
          }
        });
      });

      return this;
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

  , sync: function(method, model, options) {
      if (model === this && utils.contains(['create', 'update'], method) && options.data == null)
        options.data = utils.pick(this.toJSON(), ['username', 'firstName', 'lastName', 'email', 'cardId', 'avatarUrl']);
      utils.Model.prototype.sync.apply(this, arguments);
    }

  , toJSON: function(options) {
      var obj = utils.Model.prototype.toJSON.apply(this, arguments);
      if (options && options.displayName) {
        obj.displayName =
          this.get('screenName')
       || (this.get('firstName') && this.get('lastName') ? this.get('firstName') + ' ' + this.get('lastName')[0] + '.' : '')
       || this.get('firstName')
       || this.get('lastName')
       || '[add name]';
      }

      return obj;
    }
  });
});
