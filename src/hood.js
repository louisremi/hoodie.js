// Hoodie Core
// -------------
//
// the door to world domination (apps)
//


module.exports = function (baseUrl) {

  var self = this;

  // enforce initialization with `new`
  if (!(this instanceof Hoodie)) {
    throw new Error('usage: new Hoodie(url);');
  }

  if (baseUrl) {
    // remove trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  var events = require('./hoodie/events')(self);
  var promises = require('./hoodie/promises');
  var connection = require('./hoodie/connection');

  //
  // Extending hoodie core
  //

  // * hoodie.bind
  // * hoodie.on
  // * hoodie.one
  // * hoodie.trigger
  // * hoodie.unbind
  // * hoodie.off
  self.bind = events.bind;
  self.on = events.on;
  self.one = events.one;
  self.trigger = events.trigger;
  self.unbind = events.unbind;
  self.off = events.off;


  // * hoodie.defer
  // * hoodie.isPromise
  // * hoodie.resolve
  // * hoodie.reject
  // * hoodie.resolveWith
  // * hoodie.rejectWith
  self.defer = promises.defer;
  self.isPromise = promises.isPromise;
  self.resolve = promises.resolve;
  self.reject = promises.reject;
  self.resolveWith = promises.resolveWith;


  // * hoodie.request
  self.request = require('./hoodie/request');


  // * hoodie.isOnline
  // * hoodie.checkConnection
  self.isOnline = connection.isOnline;
  self.checkConnection = connection.checkConnection;


  // * hoodie.uuid
  self.UUID = require('./hoodie/uuid');


  // * hoodie.dispose
  self.dispose = require('./hoodie/dispose');


  // * hoodie.open
  self.open = require('./hoodie/open')(self);


  // * hoodie.store
  self.store = require('./hoodie/store')(self);


  // * hoodie.task
  self.task = require('./hoodie/task');


  // * hoodie.config
  self.config = require('./hoodie/config');


  // * hoodie.account
  self.account = require('./hoodie/account');


  // * hoodie.remote
  self.remote = require('./hoodie/remote_store');


  //
  // Initializations
  //

  // set username from config (local store)
  self.account.username = self.config.get('_account.username');

  // check for pending password reset
  self.account.checkPasswordReset();

  // clear config on sign out
  events.on('account:signout', self.config.clear);

  // hoodie.store
  self.store.patchIfNotPersistant();
  self.store.subscribeToOutsideEvents();
  self.store.bootstrapDirtyObjects();

  // hoodie.remote
  self.remote.subscribeToEvents();

  // hoodie.task
  self.task.subscribeToStoreEvents();

  // authenticate
  // we use a closure to not pass the username to connect, as it
  // would set the name of the remote store, which is not the username.
  self.account.authenticate().then(function( /* username */ ) {
    self.remote.connect();
  });

  // check connection when browser goes online / offline
  global.addEventListener('online', self.checkConnection, false);
  global.addEventListener('offline', self.checkConnection, false);


  // start checking connection
  self.checkConnection();

};

