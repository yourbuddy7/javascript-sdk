"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _humps = _interopRequireDefault(require("humps"));

var _formData = _interopRequireDefault(require("./form-data"));

var _objects = require("./objects");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// ==========================================================================
// Fetch
// ==========================================================================
var defaults = {
  type: 'GET',
  body: {},
  responseType: 'json'
};
/**
 * Custom immitation fetch using XHR
 * @param {String} url - The URL of the endpoint
 * @param {Object} options - Object of options for the request
 */

function _default(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _extend = (0, _objects.extend)({}, defaults, options),
      type = _extend.type,
      body = _extend.body,
      responseType = _extend.responseType;

  return new Promise(function (resolve, reject) {
    try {
      var xhr = new XMLHttpRequest(); // Check for CORS support

      if (!('withCredentials' in xhr)) {
        var error = new Error('No CORS support');
        error.request = xhr;
        throw error;
      } // Handle failures
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status


      var fail = function fail() {
        var error = new Error(xhr.status);
        error.request = xhr;
        reject(error);
      }; // Successfully made the request


      xhr.addEventListener('load', function () {
        var response = xhr.response; // Something went wrong either with the request or server

        if (xhr.status >= 400) {
          fail();
          return;
        } // Parse JSON responses


        if (responseType === 'json') {
          (0, _objects.parseJSON)(response).then(function (json) {
            if (json.success) {
              var data = _humps["default"].camelizeKeys(json.data);

              resolve(data);
            } else {
              var _error = new Error('Request failed');

              _error.errors = json.errors;
              reject(_error);
            }
          })["catch"](reject);
        } else {
          resolve(response);
        }
      }); // Request failed

      xhr.addEventListener('error', fail); // Start the request

      xhr.open(type, url, true); // Set the required response type
      // 'json' responseType is much slower, so we parse later
      // https://github.com/arendjr/fetch-vs-xhr-perf

      if (responseType !== 'json') {
        xhr.responseType = responseType;
      } // Send data if passed


      xhr.send((0, _formData["default"])(body));
    } catch (error) {
      reject(error);
    }
  });
}