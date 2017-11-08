'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhoenixWebSocketLink = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _printer = require('graphql/language/printer');

var _apolloLinkCore = require('apollo-link-core');

var _phoenix = require('phoenix');

var _websocket = require('websocket');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PhoenixWebSocketLink = exports.PhoenixWebSocketLink = function () {
  function PhoenixWebSocketLink(opts) {
    _classCallCheck(this, PhoenixWebSocketLink);

    if (typeof window === 'undefined' && !opts.transport) opts.transport = _websocket.w3cwebsocket;
    var socket = new _phoenix.Socket(opts.uri, opts);

    try {
      socket.connect();
      this._joinChannel(socket);
    } catch (err) {
      console.error(err);
    }
  }

  // Required by the NetworkInterface interface spec
  // param: { variables, extensions, operationName, query }


  _createClass(PhoenixWebSocketLink, [{
    key: 'request',
    value: function request(_ref) {
      var _this = this;

      var operationName = _ref.operationName,
          query = _ref.query,
          variables = _ref.variables;

      query = (0, _printer.print)(query);
      // console.log('Phoenix apollo: operationName:', operationName)
      return new _apolloLinkCore.Observable(function (observer) {
        _this._channel.push('doc', { operationName: operationName, query: query, variables: variables }).receive('ok', function (response) {
          // console.log('operation response', response)
          observer.next(response);
          observer.complete();
        }).receive('ignore', function (response) {
          observer.next(response);
          observer.complete();
        }).receive('error', observer.error.bind(observer)).receive('timeout', observer.error.bind(observer));
      });
    }
  }, {
    key: '_joinChannel',
    value: function _joinChannel(socket) {
      var CHANNEL_TOPIC = '__absinthe__:control';
      var channel = socket.channel(CHANNEL_TOPIC, {});
      this._channel = channel;
      channel.join();
      // .receive('ok', response => console.log(`Joined successfully ${CHANNEL_TOPIC}`, response))
      // .receive('error', response => { console.log(`Unable to join ${CHANNEL_TOPIC}`, response) })
    }
  }]);

  return PhoenixWebSocketLink;
}();