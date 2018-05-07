var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var utils = {
    is: {
        array: function array(input) {
            return !this.nullOrUndefined(input) && Array.isArray(input);
        },
        object: function object(input) {
            return this.getConstructor(input) === Object;
        },
        number: function number(input) {
            return this.getConstructor(input) === Number && !Number.isNaN(input);
        },
        string: function string(input) {
            return this.getConstructor(input) === String;
        },
        boolean: function boolean(input) {
            return this.getConstructor(input) === Boolean;
        },
        function: function _function(input) {
            return this.getConstructor(input) === Function;
        },
        htmlElement: function htmlElement(input) {
            return this.instanceof(input, HTMLElement);
        },
        nodeList: function nodeList(input) {
            return this.instanceof(input, NodeList);
        },
        nullOrUndefined: function nullOrUndefined(input) {
            return input === null || typeof input === 'undefined';
        },
        hexColor: function hexColor(input) {
            var regex = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$');
            return this.string(input) && regex.test(input);
        },
        objectId: function objectId(input) {
            return this.string(input) && /^[a-f\d]{24}$/i.test(input);
        },
        currencyCode: function currencyCode(input) {
            return this.string(input) && /^[A-z]{3}$/.test(input);
        },
        empty: function empty(input) {
            return this.nullOrUndefined(input) || (this.string(input) || this.array(input) || this.nodeList(input)) && !input.length || this.object(input) && !Object.keys(input).length;
        },
        instanceof: function _instanceof$$1(input, constructor) {
            return Boolean(input && constructor && input instanceof constructor);
        },
        getConstructor: function getConstructor(input) {
            return !this.nullOrUndefined(input) ? input.constructor : null;
        }
    },

    // Toggle class on an element
    toggleClass: function toggleClass(name, toggle) {
        var element = this;

        if (utils.is.htmlElement(element)) {
            element.classList[toggle ? 'add' : 'remove'](name);
        }
    },


    // Fix iframe white flash
    preventFlash: function preventFlash(callback) {
        var iframe = this;

        // Need an iframe
        if (!utils.is.htmlElement(iframe) || iframe.tagName.toLowerCase() !== 'iframe') {
            return;
        }

        // Prevent white flash (hide the iframe until loaded)
        iframe.style.opacity = 0;
        iframe.style.visibility = 'hidden';

        // Handle iframe loaded
        iframe.addEventListener('load', function () {
            // Slight delay for reduced jankness
            setTimeout(function () {
                iframe.style.opacity = 1;
                iframe.style.visibility = 'visible';

                // If there's a callback, fire it
                if (typeof callback === 'function') {
                    callback.call(iframe);
                }
            }, 300);
        });
    },


    // Determine if page is iframed
    isIframed: function isIframed() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },


    // Parse a URL
    // https://gist.github.com/jlong/2428561
    parseUrl: function parseUrl(input) {
        // Create a faux anchor
        var parser = document.createElement('a');

        // Use the current url as fallback
        var url = utils.is.string(input) ? input : window.location.href;

        // Set the href to the url to parse
        parser.href = url;

        // Return the parts we need
        // Fix pathname for IE
        var info = {
            host: parser.host,
            hostname: parser.hostname,
            hash: parser.hash,
            protocol: parser.protocol,
            pathname: parser.pathname.indexOf('/') !== 0 ? '/' + parser.pathname : parser.pathname,
            search: parser.search
        };

        // Get the filename from path
        var parts = info.pathname.split('/');
        info.filename = parts[parts.length - 1];

        return info;
    },


    // Get all URL query parameters
    getUrlQueries: function getUrlQueries() {
        var url = this;

        // Use curreny URL if not supplied
        if (url === null || typeof url !== 'string') {
            url = window.location.href;
        }

        url = utils.parseUrl(url);

        // Get queries
        var queries = decodeURIComponent(url.search).substr(1).split('&');

        if (queries[0] === '') {
            return {};
        }

        var results = {};

        queries.forEach(function (query) {
            var parts = query.split('=');
            results[parts[0]] = parts.length === 2 ? decodeURIComponent(parts[1].replace(/\+/g, ' ')) : '';
        });

        return results;
    },


    // Add a URL query to a URL
    addUrlQuery: function addUrlQuery(key, value) {
        var url = this;

        if (!utils.is.string(url)) {
            url = window.location.href;
        }

        var parts = url.split('?');
        var parameters = utils.getUrlQueries.call(url);
        var hash = parts.length > 1 ? parts[1].split('#')[1] : null;
        var search = '';

        // Add the new parameter
        parameters[key] = value;

        // Construct the parameters
        Object.keys(parameters).forEach(function (k) {
            var parameter = parameters[k];
            search += '' + (search.length ? '&' : '?') + k + (parameter.length ? '=' + parameter : null);
        });

        // Reconstruct the URL
        return '' + parts[0] + search + (hash ? '#' + hash : '');
    },


    // Remove URL parameter
    removeUrlQuery: function removeUrlQuery(key) {
        var url = this;

        if (!utils.is.string(url)) {
            url = window.location.href;
        }

        // Get URL parts
        var parts = url.split('#');
        var search = parts[0].split('?');
        var hash = parts[1];

        if (search.length >= 2) {
            var prefix = encodeURIComponent(key) + '=';
            var parameters = search[1].split(/[&;]/g);

            // Reverse iteration as may be destructive
            parameters.reverse().forEach(function (parameter, index) {
                if (parameter.startsWith(prefix)) {
                    parameters.splice(index, 1);
                }
            });

            // Reconstruct the URL
            return search[0] + (parameters.length ? '?' + parameters.join('&') : '') + (hash ? '#' + hash : '');
        }
        return url;
    },


    // Open a new popup window
    popup: function popup(url, width, height) {
        // Get position
        var left = 0;
        var top = 0;

        if (window.screen.availLeft !== undefined && window.screen.availTop !== undefined) {
            left = window.screen.availLeft;
            top = window.screen.availTop;
        } else if (window.screenLeft !== undefined && window.screenTop !== undefined) {
            left = window.screenLeft;
            top = window.screenTop;
        } else {
            var _window$screen = window.screen;
            left = _window$screen.left;
            top = _window$screen.top;
        }

        // Open in the centre of the screen
        var x = window.screen.width / 2 - width / 2 + left;
        var y = window.screen.height / 2 - height / 2 + top;

        // Create a popup window
        var popup = window.open(url, '_blank', 'top=' + y + ',left=' + x + ',height=' + height + ',width=' + width);

        // Puts focus on the newWindow
        if (window.focus) {
            popup.focus();
        }
    },


    /**
     * Convert an Object to FormData
     * @param {Object} source - source Object
     * @param {FormData} form - existing FormData object
     * @param {String} namespace - namespace for FormData
     */
    buildFormData: function buildFormData(source, form, namespace) {
        var data = form || new FormData();
        var formKey = void 0;

        // Source must be an object
        if (!utils.is.object(source)) {
            return data;
        }

        // Loop through the object to convert
        Object.keys(source).forEach(function (key) {
            if (namespace) {
                formKey = namespace + '[' + key + ']';
            } else {
                formKey = key;
            }

            // If the property is an object, but not a File, use recursivity
            if (_typeof(source[key]) === 'object' && !(source[key] instanceof File)) {
                utils.buildFormData(source[key], data, key);
            } else {
                data.append(formKey, source[key]);
            }
        });

        return data;
    },


    // Deep extend destination object with N more objects
    extend: function extend() {
        var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            sources[_key - 1] = arguments[_key];
        }

        if (!sources.length) {
            return target;
        }

        var source = sources.shift();

        if (!utils.is.object(source)) {
            return target;
        }

        Object.keys(source).forEach(function (key) {
            if (utils.is.object(source[key])) {
                if (!Object.keys(target).includes(key)) {
                    Object.assign(target, defineProperty({}, key, {}));
                }

                utils.extend(target[key], source[key]);
            } else {
                Object.assign(target, defineProperty({}, key, source[key]));
            }
        });

        return utils.extend.apply(utils, [target].concat(toConsumableArray(sources)));
    }
};

function getBase(env) {
    return 'https://' + (!utils.is.empty(env) ? env + '-' : '') + 'selz.com/sdk/';
}

var config = {
    urls: {
        /**
         * Get URL for product data by URL
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} url - Short or full URL for a product
         */
        product: function product(env) {
            var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'product?url=' + url;
        },


        /**
         * Get URL for all products by User ID
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - The User ID for the store
         * @param {string} query - Search query
         * @param {number} page - Page to fetch
         */
        products: function products(env, id) {
            var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
            var page = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

            return getBase(env) + 'products/' + id + '?q=' + query + '&p=' + page;
        },


        /**
         * Get URL for User ID by domain
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} url - The URL for the store
         */
        userId: function userId(env) {
            var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'userid?domain=' + url;
        },


        /**
         * Create a new cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Store ID
         */
        createCart: function createCart(env) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'createcart/' + id;
        },


        /**
         * Get cart from ID
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        getCart: function getCart(env) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'cart/' + id;
        },


        /**
         * Check carts still exist server side
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Cart IDs
         */
        checkCarts: function checkCarts(env) {
            var ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'checkcarts?ids=' + ids;
        },


        /**
         * Add product to cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        addToCart: function addToCart(env) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'addtocart/' + id;
        },


        /**
         * Update a cart item quantity
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        updateCartItemQuantity: function updateCartItemQuantity(env) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'updatecartitemquantity/' + id;
        },


        /**
         * Remove product from cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        removeFromCart: function removeFromCart(env) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return getBase(env) + 'removefromcart/' + id;
        }
    }
};

var mapObj = function mapObj(obj, cb) {
	var ret = {};
	var keys = Object.keys(obj);

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var res = cb(key, obj[key], obj);
		ret[res[0]] = res[1];
	}

	return ret;
};

/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES = {
  tr: {
    regexp: /[\u0069]/g,
    map: {
      'i': '\u0130'
    }
  },
  az: {
    regexp: /[\u0069]/g,
    map: {
      'i': '\u0130'
    }
  },
  lt: {
    regexp: /[\u0069\u006A\u012F]\u0307|\u0069\u0307[\u0300\u0301\u0303]/g,
    map: {
      'i\u0307': 'I',
      'j\u0307': 'J',
      '\u012F\u0307': '\u012E',
      'i\u0307\u0300': '\xCC',
      'i\u0307\u0301': '\xCD',
      'i\u0307\u0303': '\u0128'
    }
  }

  /**
   * Upper case a string.
   *
   * @param  {String} str
   * @return {String}
   */
};var upperCase = function upperCase(str, locale) {
  var lang = LANGUAGES[locale];

  str = str == null ? '' : String(str);

  if (lang) {
    str = str.replace(lang.regexp, function (m) {
      return lang.map[m];
    });
  }

  return str.toUpperCase();
};

/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES$1 = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      '\u0130': 'i',
      'I': '\u0131',
      'I\u0307': 'i'
    }
  },
  az: {
    regexp: /[\u0130]/g,
    map: {
      '\u0130': 'i',
      'I': '\u0131',
      'I\u0307': 'i'
    }
  },
  lt: {
    regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
    map: {
      'I': 'i\u0307',
      'J': 'j\u0307',
      '\u012E': '\u012F\u0307',
      '\xCC': 'i\u0307\u0300',
      '\xCD': 'i\u0307\u0301',
      '\u0128': 'i\u0307\u0303'
    }
  }

  /**
   * Lowercase a string.
   *
   * @param  {String} str
   * @return {String}
   */
};var lowerCase = function lowerCase(str, locale) {
  var lang = LANGUAGES$1[locale];

  str = str == null ? '' : String(str);

  if (lang) {
    str = str.replace(lang.regexp, function (m) {
      return lang.map[m];
    });
  }

  return str.toLowerCase();
};

var nonWordRegexp = /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g;

var camelCaseRegexp = /([\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])([\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g;

var trailingDigitRegexp = /([\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([^\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g;

/**
 * Sentence case a string.
 *
 * @param  {String} str
 * @param  {String} locale
 * @param  {String} replacement
 * @return {String}
 */
var sentenceCase = function sentenceCase(str, locale, replacement) {
  if (str == null) {
    return '';
  }

  replacement = replacement || ' ';

  function replace(match, index, string) {
    if (index === 0 || index === string.length - match.length) {
      return '';
    }

    return replacement;
  }

  str = String(str)
  // Support camel case ("camelCase" -> "camel Case").
  .replace(camelCaseRegexp, '$1 $2')
  // Support digit groups ("test2012" -> "test 2012").
  .replace(trailingDigitRegexp, '$1 $2')
  // Remove all non-word characters and replace with a single space.
  .replace(nonWordRegexp, replace);

  // Lower case the entire string.
  return lowerCase(str, locale);
};

/**
 * Camel case a string.
 *
 * @param  {String} string
 * @param  {String} [locale]
 * @return {String}
 */
var camelCase = function camelCase(string, locale, mergeNumbers) {
  var result = sentenceCase(string, locale);

  // Replace periods between numeric entities with an underscore.
  if (!mergeNumbers) {
    result = result.replace(/(\d) (?=\d)/g, '$1_');
  }

  // Replace spaces between words with an upper cased character.
  return result.replace(/ (.)/g, function (m, $1) {
    return upperCase($1, locale);
  });
};

/**
 * Upper case the first character of a string.
 *
 * @param  {String} str
 * @return {String}
 */
var upperCaseFirst = function upperCaseFirst(str, locale) {
  if (str == null) {
    return '';
  }

  str = String(str);

  return upperCase(str.charAt(0), locale) + str.substr(1);
};

/**
 * Pascal case a string.
 *
 * @param  {String} string
 * @param  {String} [locale]
 * @return {String}
 */
var pascalCase = function pascalCase(string, locale) {
  return upperCaseFirst(camelCase(string, locale), locale);
};

var pascalcaseKeys = function pascalcaseKeys(obj) {
  return mapObj(obj, function (key, val) {
    return [pascalCase(key), val];
  });
};

/**
 * Custom fetch wrapper
 * @param {string} url - The URL of the endpoint
 * @param {object} options - Object of options for the request
 */
var CustomFetch = function CustomFetch(url, options) {
    var defaults = {
        mode: 'cors',
        redirect: 'follow'
    };

    return new Promise(function (resolve, reject) {
        fetch(url, Object.assign(defaults, options)).then(function (response) {
            response.json().then(function (json) {
                if (json.success) {
                    resolve(json.data);
                } else {
                    reject(json.errors);
                }
            }).catch(reject);
        }).catch(reject);
    });
};

var http = {
    /**
     * GET remote URL and parse as JSON
     * @param {string} url - The endpoint URL
     */
    get: function get(url) {
        return new CustomFetch(url);
    },


    /**
     * POST to remote URL and parse as JSON
     * @param {string} url - The endpoint URL
     * @param {object} data - The POST data payload
     */
    post: function post(url, data) {
        var options = {
            method: 'POST'
        };

        // Convert POST data to FormData for C#
        if (utils.is.object(data)) {
            options.body = utils.buildFormData(pascalcaseKeys(data));
        }

        return new CustomFetch(url, options);
    }
};

var client = null;

var ProductUrls = function ProductUrls(urls) {
    classCallCheck(this, ProductUrls);

    this.full = urls.full;
    this.store = urls.store;
    this.short = urls.short;
    this.checkout = urls.checkout;
};

var ProductImage = function ProductImage(image) {
    classCallCheck(this, ProductImage);

    this.pico = image.pico;
    this.icon = image.icon;
    this.thumb = image.thumb;
    this.small = image.small;
    this.compact = image.compact;
    this.medium = image.medium;
    this.large = image.large;
    this.grande = image.grande;
    this.mucho_grande = image.mucho_grande;
    this.huge = image.huge;
    this.original = image.original;
    this.featured = image.is_featured;
    this.default = image.is_default;
};

var ProductMedia = function ProductMedia(media) {
    classCallCheck(this, ProductMedia);

    this.type = media.type;
    this.state = media.state;
    this.url = media.url;
    this.cover = new ProductImage(media.cover);
};

var ProductFile = function ProductFile(file) {
    classCallCheck(this, ProductFile);

    this.name = file.file_name;
    this.size = file.file_size;
};

var ProductVariant = function ProductVariant(variant) {
    var selected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    classCallCheck(this, ProductVariant);

    this.id = variant.id;
    this.title = variant.title;
    this.sku = variant.sku;
    this.price = variant.price;
    this.price_formatted = variant.price_formatted;
    this.quantity = variant.quantity;
    this.quantity_available = variant.quantity_available;
    this.options = variant.options;
    this.selected = variant.id === selected;
};

var ProductVariantAttributeOption = function ProductVariantAttributeOption(id, label) {
    classCallCheck(this, ProductVariantAttributeOption);

    this.id = id;
    this.label = label;
};

var ProductVariantAttribute = function ProductVariantAttribute(variant) {
    classCallCheck(this, ProductVariantAttribute);

    this.id = variant.id;
    this.name = variant.name;
    this.options = Object.keys(variant.options).map(function (id) {
        return new ProductVariantAttributeOption(id, variant.options[id]);
    });
};

var Product = function () {
    function Product(instance, product) {
        var variantId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        classCallCheck(this, Product);

        if (!utils.is.object(product)) {
            return;
        }

        this.id = product.id;
        this.title = product.title;
        this.description = product.description;
        this.sku = product.sku;

        this.currency_code = product.currency_code;
        this.currency_symbol = product.currency_symbol;
        this.price = product.price;
        this.regular_price = product.regular_price;
        this.price_formatted = product.price_formatted;
        this.regular_price_formatted = product.regular_price_formatted;

        this.quantity = product.quantity;
        this.quantity_available = product.quantity_available;

        // Product URLs
        if (utils.is.object(product.urls)) {
            this.urls = new ProductUrls(product.urls);
        }

        // Media (Video, YouTube, Vimeo, Audio)
        if (utils.is.object(product.media)) {
            this.media = new ProductMedia(product.media);
        }

        // Images
        if (utils.is.array(product.images)) {
            this.images = product.images.map(function (image) {
                return new ProductImage(image);
            });
        }

        // Files for digital products
        if (utils.is.array(product.download_files)) {
            this.files = product.download_files.map(function (file) {
                return new ProductFile(file);
            });
        }

        // Variants
        if (utils.is.array(product.variants) && product.variants.length) {
            var selected = !utils.is.empty(variantId) ? variantId : product.variants[0].id;
            this.variants = product.variants.map(function (variant) {
                return new ProductVariant(variant, selected);
            });
        }
        if (utils.is.array(product.variant_attributes) && product.variant_attributes.length) {
            this.variant_attributes = product.variant_attributes.map(function (attribute) {
                return new ProductVariantAttribute(attribute);
            });
        }

        this.cards_enabled = product.cards_enabled;
        this.extra_cards_enabled = product.extra_cards_enabled;
        this.paypal_enabled = product.pay_pal_enabled;

        this.display_sku = product.display_sku;
        this.display_quantity = product.display_quantity;
        this.display_powered_by = product.display_powered_by;

        this.created_by = product.created_by;
        this.created_time = product.created_time;
        this.updated_by = product.updated_by;
        this.updated_time = product.updated_time;

        client = instance;
    }

    // eslint-disable-next-line camelcase


    createClass(Product, [{
        key: 'view',


        /**
         * View product in modal
         * @param {string} discount - Discount code for the product
         * @param {object} colors - Colors object for the modal
         */
        value: function view(discount, colors) {
            var url = this.urls.full;

            if (utils.is.string(discount)) {
                url = utils.addUrlQuery.call(url, 'code', discount);
            }

            client.modal.open(url, utils.is.object(colors) ? colors : client.config.colors);
        }

        /**
         * Buy product
         * @param {string} [discount] - Discount code for the product
         * @param {object} colors - Colors object for the modal
         */

    }, {
        key: 'buy',
        value: function buy(discount, colors) {
            var url = this.urls.checkout;

            if (utils.is.string(discount)) {
                url = utils.addUrlQuery.call(url, 'code', discount);
            }

            client.modal.open(url, utils.is.object(colors) ? colors : client.config.colors);
        }
    }, {
        key: 'featured_image',
        get: function get$$1() {
            return this.images.find(function (image) {
                return image.featured;
            });
        }

        // eslint-disable-next-line camelcase

    }, {
        key: 'is_sold_out',
        get: function get$$1() {
            return this.quantity_available === 0;
        }

        // eslint-disable-next-line camelcase

    }, {
        key: 'selected_variant',
        get: function get$$1() {
            if (utils.is.empty(this.variants)) {
                return null;
            }

            return this.variants.find(function (variant) {
                return variant.selected;
            });
        }
    }]);
    return Product;
}();

var client$1 = null;

var CartItem = function () {
    function CartItem(item, cartId) {
        var _this = this;

        classCallCheck(this, CartItem);

        this.index = item.index;
        this.cartId = cartId;

        this.product = new Product(client$1, item.product, item.variant_id);

        this.price = item.price;
        this.price_formatted = item.price_formatted;

        this.has_buyers_price = item.has_buyers_price;
        this.buyers_price = item.buyers_price;
        this.buyers_price_formatted = item.buyers_price_formatted;

        this.has_discount = item.has_discount;
        this.discount_code = item.discount_code;
        this.dicount_name = item.discount_name;
        this.total_discount = item.total_discount;
        this.total_discount_formatted = item.total_discount_formatted;

        this.sub_total = item.sub_total;
        this.sub_total_formatted = item.sub_total_formatted;

        // Semi private for quantity updates so we can bind to getters/setters
        var _quantity = item.quantity;
        this._setQuantity = function () {
            var quantity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            _quantity = quantity;
            client$1.updateCartItemQuantity(_this.cartId, _this.index, quantity);
        };
        this._getQuantity = function () {
            return _quantity;
        };
    }

    createClass(CartItem, [{
        key: 'quantity',
        get: function get$$1() {
            return this._getQuantity();
        },
        set: function set$$1(quantity) {
            this._setQuantity(quantity);
        }
    }]);
    return CartItem;
}();

var Cart = function () {
    function Cart(instance, cart) {
        var active = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        classCallCheck(this, Cart);

        if (cart === null) {
            return;
        }

        client$1 = instance;

        this.id = cart.id;
        this.active = active;
        this.seller_id = cart.seller_id;
        this.url = cart.url;

        this.channel = cart.channel;
        this.tracking_id = cart.tracking_id;

        this.items = Array.from(cart.items).map(function (item) {
            return new CartItem(item, cart.id);
        });

        this.currency_symbol = cart.currency_symbol;
        this.currency_code = cart.currency_code;
        this.total = cart.total;
        this.total_formatted = cart.total_formatted;

        this.created_time = cart.created_time;
        this.updated_time = cart.updated_time;
    }

    /**
     * Checkout a cart
     * @param {object} colors - Colors object for the modal
     */


    createClass(Cart, [{
        key: 'checkout',
        value: function checkout(colors) {
            if (!utils.is.string(this.url)) {
                return;
            }

            client$1.modal.open(this.url, utils.is.object(colors) ? colors : client$1.config.colors);
        }

        /**
         * Add a product to this cart
         * @param {object} product - The product details
         */

    }, {
        key: 'add',
        value: function add(product) {
            return client$1.addToCart(this.id, product);
        }

        /**
         * Remove a product from this cart
         * @param {string} index
         */

    }, {
        key: 'remove',
        value: function remove(index) {
            return client$1.removeFromCart(this.id, index);
        }
    }]);
    return Cart;
}();

// ==========================================================================

var storage = new Map();

var Storage = function () {
    function Storage(keys) {
        classCallCheck(this, Storage);

        this.keys = Object.assign({
            root: 'selz',
            carts: 'carts',
            domains: 'domains'
        }, keys);
    }

    // Check for actual support (see if we can use it)


    createClass(Storage, [{
        key: 'get',
        value: function get$$1(key) {
            var data = storage.get(this.keys.root);

            // Grab from real storage if we can or use faux-storage
            if (Storage.supported) {
                var stored = window.localStorage.getItem(this.keys.root);

                if (!utils.is.empty(stored)) {
                    data = JSON.parse(stored);
                }
            }

            if (utils.is.empty(data)) {
                return null;
            }

            return utils.is.string(key) && key.length ? data[key] : data;
        }
    }, {
        key: 'set',
        value: function set$$1(key, value) {
            // Get current storage
            var data = this.get() || {};

            // Inject the new data
            if (Object.keys(data).includes(key)) {
                var base = data[key];
                utils.extend(base, value);
            } else {
                data[key] = value;
            }

            // Set in faux-storage
            storage.set(this.keys.root, data);

            // Bail if no real support
            if (!Storage.supported) {
                return;
            }

            // Update storage
            try {
                window.localStorage.setItem(this.keys.root, JSON.stringify(data));
            } catch (e) {
                // Do nothing
            }
        }
    }, {
        key: 'getCarts',
        value: function getCarts(seller) {
            var data = this.get(this.keys.carts) || {};

            // If no carts
            if (utils.is.empty(data)) {
                return null;
            }

            // Get all carts
            if (!utils.is.number(seller)) {
                return data;
            }

            // Seller not found
            if (!Object.keys(data).includes(seller.toString())) {
                return null;
            }

            // Get all for a seller
            return data[seller.toString()];
        }
    }, {
        key: 'getCart',
        value: function getCart(seller, currency) {
            var carts = this.getCarts(seller);

            // No carts
            if (utils.is.empty(carts)) {
                return null;
            }

            // Get all for a seller
            if (!utils.is.string(currency)) {
                return carts;
            }

            // Currency not found
            if (!Object.keys(carts).includes(currency.toUpperCase())) {
                return null;
            }

            return carts[currency.toUpperCase()];
        }
    }, {
        key: 'setCart',
        value: function setCart(seller, currency, cart) {
            var update = {};
            update[seller] = {};
            update[seller][currency.toUpperCase()] = {
                id: cart.id,
                active: cart.active
            };

            this.set(this.keys.carts, update);
        }
    }, {
        key: 'setCarts',
        value: function setCarts(seller) {
            var carts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var update = {};
            update[seller] = carts;

            this.set(this.keys.carts, update);
        }
    }, {
        key: 'getSeller',
        value: function getSeller(domain) {
            var data = this.get(this.keys.domains) || {};

            if (!utils.is.string(domain) || utils.is.empty(data) || !Object.keys(data).includes(domain)) {
                return null;
            }

            return data[domain];
        }
    }, {
        key: 'setSeller',
        value: function setSeller(domain, id) {
            var update = {};
            update[domain] = id;

            this.set(this.keys.domains, update);
        }
    }], [{
        key: 'supported',
        get: function get$$1() {
            if (!window.localStorage) {
                return false;
            }

            var key = '___test';

            // Try to use it
            try {
                window.localStorage.setItem(key, key);
                window.localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        }
    }]);
    return Storage;
}();

// Check for CSS3 support
var support = {
    get animation() {
        var test = document.createElement('div');
        var prefixes = 'Webkit Moz O ms Khtml'.split(' ');
        return prefixes.some(function (prefix) {
            return test.style[prefix + 'AnimationName'] !== undefined;
        });
    },
    get pointerEvents() {
        var x = document.createElement('x');
        x.style.cssText = 'pointer-events:auto';
        return x.style.pointerEvents === 'auto';
    }
};

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = "@-webkit-keyframes selz-fade-in{0%{opacity:0}to{opacity:1}}@keyframes selz-fade-in{0%{opacity:0}to{opacity:1}}@-webkit-keyframes selz-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes selz-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@font-face{font-family:Selz;src:url(https://cdn.selzstatic.com/fonts/circular/circular-book-custom.woff2) format(\"woff2\"),url(https://cdn.selzstatic.com/fonts/circular/circular-book-custom.woff) format(\"woff\");font-weight:400;font-display:swap}.selz-modal,.selz-modal__body,.selz-modal__iframe{width:100%;height:100%}.selz-modal{box-sizing:border-box;-webkit-overflow-scrolling:touch;overflow:auto;position:fixed;z-index:999999999;top:0;left:0;right:0;bottom:0;background:rgba(46,52,61,.85);-webkit-animation:\"selz-fade-in\" .2s cubic-bezier(.4,0,.2,1);animation:\"selz-fade-in\" .2s cubic-bezier(.4,0,.2,1);font:400 16px/1.5 Selz,Circular,Circular-Std,Avenir,Avenir Next,sans-serif;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased}.selz-modal *,.selz-modal :after,.selz-modal :before{box-sizing:inherit}.selz-modal[hidden],.selz-modal [hidden]{display:none}.selz-modal__body{position:relative;text-align:center}.selz-modal__iframe{display:block;border:0;-webkit-animation:\"selz-fade-in\" .2s cubic-bezier(.4,0,.2,1);animation:\"selz-fade-in\" .2s cubic-bezier(.4,0,.2,1)}.selz-modal--is-loading .selz-modal__iframe{display:none}.selz-modal--is-loading .selz-modal__loader{display:block}.selz-modal__loader{display:none;position:absolute;top:50%;left:50%;width:120px;-webkit-transform:translate(-60px,-50%);transform:translate(-60px,-50%);color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.1);text-align:center;line-height:1}.selz-modal.supports-cssanimations .selz-modal__loader:before{content:\"\";width:24px;height:24px;border:2px solid currentColor;border-left-color:transparent;border-bottom-color:transparent;-webkit-animation:\"selz-spin\" .5s infinite linear;animation:\"selz-spin\" .5s infinite linear;-webkit-transform-origin:50%;transform-origin:50%;border-radius:50%;display:block;margin:0 auto 15px}";
styleInject(css);

var Modal = function () {
    function Modal(options) {
        classCallCheck(this, Modal);

        this.namespace = 'selz-modal';

        this.config = Object.assign({
            minSize: {
                checkout: {
                    width: 400,
                    height: 400
                },
                item: {
                    width: 800,
                    height: 600
                }
            },
            popup: {
                checkout: {
                    width: 400,
                    height: 600
                }
            },
            colors: {
                buttons: {
                    background: null,
                    text: null
                },
                checkout: {
                    background: null,
                    text: null
                }
            }
        }, options);

        // Scroll position
        this.scroll = null;

        // Elements
        this.elements = {
            modal: null,
            loader: null,
            iframe: null,
            wrapper: null
        };
    }

    // Event listeners


    createClass(Modal, [{
        key: 'listeners',
        value: function listeners() {
            var _this = this;

            // Listen for messages
            window.addEventListener('message', function (event) {
                return _this.messageHandler.call(_this, event);
            }, false);

            // Bind escape key to close
            document.addEventListener('keydown', function (event) {
                if (event.keyCode === 27) {
                    _this.hide();
                }
            }, false);

            // Listen for browser close
            window.addEventListener('beforeunload', function () {
                if (_this.elements.iframe) {
                    _this.elements.iframe.contentWindow.postMessage(JSON.stringify({
                        key: 'beforeunload'
                    }), '*');
                }
            }, false);
        }

        // Get colors in weird format

    }, {
        key: 'messageHandler',


        // Receive postMessage from iframe
        value: function messageHandler(event) {
            // Get data
            var message = event.data;
            var domain = 'https://' + (utils.is.string(this.config.env) && this.config.env.length ? this.config.env + '-' : '') + 'selz.com';

            // Make sure we consume only selz messages
            // Bail if it's not a string
            if (event.origin !== domain || !utils.is.string(message)) {
                return;
            }

            // Handle message
            try {
                var json = JSON.parse(message);

                switch (json.key) {
                    case 'modal-loaded':
                        this.show();
                        break;

                    case 'modal-theme':
                        // Send back the colors
                        event.source.postMessage(JSON.stringify({
                            key: 'modal-theme',
                            data: this.theme
                        }), domain);
                        break;

                    case 'modal-reloading':
                        this.loading();
                        break;

                    // Close modal
                    case 'modal-close':
                        this.hide();
                        break;

                    default:
                        break;
                }
            } catch (exception) {
                // Invalid JSON, do nothing
            }
        }

        // Check if we need to open a new window or modal
        // If we are within iframe return true
        // If the height or width of the container smaller then config values, return true

    }, {
        key: 'canOpenModal',
        value: function canOpenModal(isCheckout) {
            // If script not within iframe, skip this function
            if (!utils.isIframed()) {
                return true;
            }

            // Retrive size of iframe
            var width = window.innerWidth;
            var height = window.innerHeight;

            // Check if current wrapper(iframe) dimensions are within defined parameters in the config
            if (isCheckout) {
                if (height >= this.config.minSize.checkout.height && width >= this.config.minSize.checkout.width) {
                    return true;
                }
            } else if (height >= this.config.minSize.item.height && width >= this.config.minSize.item.width) {
                return true;
            }

            return false;
        }

        // Hide the modal

    }, {
        key: 'hide',
        value: function hide() {
            if (!this.elements.modal) {
                return;
            }

            this.elements.modal.setAttribute('hidden', '');

            // Reset to initial state
            this.config.colors = null;

            // Enable scrolling
            this.toggleScroll();

            // Refocus body
            // TODO: This should really re-focus the original element that had focus
            document.body.focus();
        }

        // Loading state

    }, {
        key: 'loading',
        value: function loading(toggle) {
            this.elements.modal.classList[toggle ? 'add' : 'remove'](this.namespace + '--is-loading');
        }

        // Show it

    }, {
        key: 'show',
        value: function show() {
            // Clear loading state
            this.loading(false);

            // Show modal incase it's been hidden
            this.elements.modal.removeAttribute('hidden');

            // Show and focus iframe
            this.elements.iframe.removeAttribute('hidden');
            this.elements.iframe.focus();
        }

        // Disable scrolling the body
        // Scroll is done within the modal iframe

    }, {
        key: 'toggleScroll',
        value: function toggleScroll(input) {
            var toggle = utils.is.boolean(input) ? input : false;

            // Save where the user scroll position
            if (toggle) {
                this.scroll = {
                    x: window.pageXOffset || 0,
                    y: window.pageYOffset || 0
                };
            } else {
                window.scrollTo(this.scroll.x, this.scroll.y);
            }

            // Toggle body scroll (iOS ignores this, of course)
            document.body.style.overflow = toggle ? 'hidden' : '';
            document.documentElement.style.overflow = toggle ? 'hidden' : '';

            // Toggle scroll on iOS
            // https://github.com/twbs/bootstrap/issues/16557
            if (/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
                document.documentElement.style.position = toggle ? 'fixed' : '';
                document.documentElement.style.height = toggle ? '100%' : '';
                document.documentElement.style.width = toggle ? '100%' : '';
            }
        }

        // Render the modal elements

    }, {
        key: 'build',
        value: function build(label) {
            // Modal container
            var modal = document.createElement('div');
            modal.setAttribute('class', this.namespace);

            // Add class if animations supported
            utils.toggleClass.call(modal, 'supports-cssanimations', support.animation);

            // Loader
            var loader = document.createElement('div');
            loader.setAttribute('class', this.namespace + '__loader');
            loader.innerHTML = utils.is.string(label) ? label : 'Loading...';

            // Iframe
            var iframe = document.createElement('iframe');
            iframe.setAttribute('class', this.namespace + '__iframe');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'geolocation');
            iframe.setAttribute('hidden', '');

            // Prevent white flash
            utils.preventFlash.call(iframe);

            // Wrapper
            var wrapper = document.createElement('div');
            wrapper.setAttribute('class', this.namespace + '__body');

            // Cache elements
            this.elements.modal = modal;
            this.elements.loader = loader;
            this.elements.iframe = iframe;
            this.elements.wrapper = wrapper;

            // Inject elements
            wrapper.appendChild(iframe);
            modal.appendChild(loader);
            modal.appendChild(wrapper);
            document.body.appendChild(modal);

            // Event listeners
            this.listeners();
        }

        // Public functions

    }, {
        key: 'open',
        value: function open(link, colors, label) {
            var url = link.toLowerCase();

            // Store colors if passed
            if (utils.is.object(colors)) {
                Object.assign(this.config, { colors: colors });
            }

            // Set frame type
            url = utils.addUrlQuery.call(url, 'frame', 'modal');

            // Set channel
            url = utils.addUrlQuery.call(url, 'channel', 'jssdk');

            if (!url.includes('?_ga') && !url.includes('&_ga') && utils.is.function(window.ga) && utils.is.object(window.gaplugins) && utils.is.function(window.gaplugins.Linker)) {
                // Cross-domain tracking for iframe - we need to add _ga to query string if it's not already added
                // https://www.knewledge.com/en/blog/2013/11/cross-domain-tracking-for-links-with-gtm/
                // https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#iframe
                window.ga(function (tracker) {
                    // GTM does not expose tracker
                    if (typeof tracker === 'undefined' && utils.is.function(window.ga.getAll)) {
                        var gaTrackers = window.ga.getAll();

                        if (gaTrackers.length) {
                            tracker = gaTrackers[0]; // eslint-disable-line
                        }
                    }

                    if (typeof tracker !== 'undefined') {
                        var linker = new window.gaplugins.Linker(tracker);
                        url = linker.decorate(url);
                    }
                });
            }

            var isCheckout = utils.parseUrl(url).pathname.indexOf('/checkout') === 0;

            // Check if window meets min sizes
            if (!this.canOpenModal(isCheckout)) {
                if (isCheckout) {
                    var _config$popup$checkou = this.config.popup.checkout,
                        width = _config$popup$checkou.width,
                        height = _config$popup$checkou.height;

                    utils.popup(url, width, height);
                } else {
                    // Strip URL queryssss
                    url = utils.removeUrlQuery.call(url, 'frame');

                    // Open window
                    window.open(url);
                }
            }

            // Disable scroll
            this.toggleScroll(true);

            // If the modal doesn't exist, render it
            if (this.elements.modal === null) {
                this.build(label);
            }

            // Set loading state
            this.loading(true);

            // Set the URL
            this.elements.iframe.src = url;
        }
    }, {
        key: 'theme',
        get: function get$$1() {
            var formatted = {};
            var colors = this.config.colors;

            // Buttons

            if (utils.is.hexColor(colors.buttons.background)) {
                formatted.cb = colors.buttons.background;
            }
            if (utils.is.hexColor(colors.buttons.text)) {
                formatted.ct = colors.buttons.text;
            }

            // Checkout
            if (utils.is.hexColor(colors.checkout.background)) {
                formatted.chbg = colors.checkout.background;
            }
            if (utils.is.hexColor(colors.checkout.text)) {
                formatted.chtx = colors.checkout.text;
            }

            return formatted;
        }
    }]);
    return Modal;
}();

var SelzClient = function () {
    function SelzClient(props) {
        classCallCheck(this, SelzClient);

        this.config = Object.assign({
            env: '',
            domain: '',
            id: -1,
            colors: {}
        }, props);

        if (!this.isIdSet() && !this.isDomainSet()) {
            throw Error('User or domain are required');
        }

        this.storage = new Storage();

        this.modal = new Modal(this.config);
    }

    createClass(SelzClient, [{
        key: 'isIdSet',
        value: function isIdSet() {
            return Number.isInteger(this.config.id) && this.config.id !== -1;
        }
    }, {
        key: 'isDomainSet',
        value: function isDomainSet() {
            return typeof this.config.domain === 'string' && this.config.domain.length;
        }

        /**
         * Get the Store ID
         * TODO: Queue this somehow?
         */

    }, {
        key: 'getUser',
        value: function getUser() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                // Already set
                if (_this.isIdSet()) {
                    resolve(_this.config.id);
                    return;
                }

                // Cached
                var cached = _this.storage.getSeller(_this.config.domain);
                if (!utils.is.empty(cached)) {
                    _this.config.id = cached;
                    resolve(cached);
                    return;
                }

                http.get(config.urls.userId(_this.config.env, _this.config.domain)).then(function (id) {
                    _this.config.id = id;
                    _this.storage.setSeller(_this.config.domain, id);
                    resolve(id);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Get product data
         * @param {string} url - Short or full URL for a product
         */

    }, {
        key: 'getProduct',
        value: function getProduct(url) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                http.get(config.urls.product(_this2.config.env, url)).then(function (json) {
                    resolve(new Product(_this2, json));
                }).catch(reject);
            });
        }

        /**
         * Get all products
         */

    }, {
        key: 'getProducts',
        value: function getProducts() {
            var _this3 = this;

            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return new Promise(function (resolve, reject) {
                _this3.getUser().then(function () {
                    http.get(config.urls.products(_this3.config.env, _this3.config.id, query, page < 1 ? 1 : page)).then(function (json) {
                        resolve(json.map(function (p) {
                            return new Product(_this3, p);
                        }));
                    }).catch(reject);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Create a new shopping cart
         * @param {string} currency - ISO currency code
         * @param {string} [discount] - Discount code
         */

    }, {
        key: 'createCart',
        value: function createCart(currency, discount) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (utils.is.empty(currency)) {
                    reject(new Error('currency is required'));
                    return;
                }

                _this4.getUser().then(function () {
                    var currencyCode = currency.toUpperCase();

                    http.post(config.urls.createCart(_this4.config.env, _this4.config.id), {
                        currency: currencyCode,
                        discount: typeof discount === 'string' && discount.length ? discount : null
                    }).then(function (json) {
                        var cart = new Cart(_this4, json);

                        // Store reference to cart id for later
                        _this4.storage.setCart(_this4.config.id, currencyCode, cart);

                        resolve(cart);
                    }).catch(function (error) {
                        return reject(error);
                    });
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Get a shopping cart or create one if needed
         * @param {string} currency - The shopping cart ISO currency code
         */

    }, {
        key: 'getCartId',
        value: function getCartId(currency) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                if (utils.is.empty(currency)) {
                    reject(new Error('currency is required'));
                    return;
                }

                _this5.getUser().then(function () {
                    var currencyCode = currency.toUpperCase();
                    var currentCart = _this5.storage.getCart(_this5.config.id, currencyCode);

                    // Create cart if it doesn't exist
                    if (utils.is.empty(currentCart)) {
                        _this5.createCart(currencyCode).then(function (cart) {
                            return resolve(cart.id);
                        }).catch(function (error) {
                            return reject(error);
                        });
                    } else {
                        resolve(currentCart.id);
                    }
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Get a shopping cart
         * @param {string} input - The shopping cart ISO currency code or cart ID
         */

    }, {
        key: 'getCart',
        value: function getCart(input) {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                var isCurrency = utils.is.currencyCode(input);
                var isObjectId = utils.is.objectId(input);

                if (!isCurrency && !isObjectId) {
                    reject(new Error('A valid currency or cart id are required'));
                    return;
                }

                _this6.getUser().then(function () {
                    if (isCurrency) {
                        var currencyCode = input.toUpperCase();

                        _this6.getCartId(currencyCode).then(function (id) {
                            if (utils.is.empty(id)) {
                                reject(new Error('Could not find matching cart for currency \'' + currencyCode + '\''));
                                return;
                            }

                            _this6.getCart(id).then(function (cart) {
                                return resolve(cart);
                            }).catch(function (error) {
                                return reject(error);
                            });
                        });
                    } else {
                        http.get(config.urls.getCart(_this6.config.env, input)).then(function (json) {
                            var activeId = _this6.getActiveCart();
                            resolve(new Cart(_this6, json, json.id === activeId));
                        }).catch(function (error) {
                            return reject(error);
                        });
                    }
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Get all current carts
         */

    }, {
        key: 'getCarts',
        value: function getCarts() {
            var _this7 = this;

            var validate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            return new Promise(function (resolve, reject) {
                _this7.getUser().then(function () {
                    var carts = _this7.storage.getCarts(_this7.config.id);

                    if (utils.is.empty(carts)) {
                        resolve(null);
                        return;
                    }

                    // Check the carts still exist in the server
                    if (validate) {
                        var ids = Object.keys(carts).map(function (currency) {
                            return carts[currency].id;
                        });

                        http.get(config.urls.checkCarts(_this7.config.env, ids.join(','))).then(function (json) {
                            // Filter out carts that don't exist
                            var remove = Object.keys(carts).filter(function (cart) {
                                return json[cart.id];
                            });

                            // Remove non existant carts
                            remove.forEach(function (currency) {
                                delete carts[currency];
                            });

                            // Set active to first if none exist
                            var currencies = Object.keys(carts);
                            if (currencies.length && !currencies.some(function (currency) {
                                return carts[currency].active;
                            })) {
                                // Set active
                                currencies.forEach(function (currency) {
                                    var cart = carts[currency];
                                    cart.active = cart.id === carts[currencies[0]].id;
                                });
                            }

                            // Update storage
                            _this7.storage.setCarts(_this7.config.id, carts);

                            resolve(carts);
                        }).catch(function (error) {
                            return reject(error);
                        });
                    } else {
                        resolve(carts);
                    }
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Set the active cart based on currency
         * @param {string} input - The shopping cart ISO currency code or cart ID
         */

    }, {
        key: 'setActiveCart',
        value: function setActiveCart(input) {
            var _this8 = this;

            return new Promise(function (resolve, reject) {
                var isCurrency = utils.is.currencyCode(input);
                var isObjectId = utils.is.objectId(input);

                if (!isCurrency && !isObjectId) {
                    reject(new Error('A valid currency or cart id are required'));
                    return;
                }

                _this8.getUser().then(function () {
                    _this8.getCarts(false).then(function (data) {
                        var carts = data;

                        // No carts
                        if (utils.is.empty(carts)) {
                            resolve(null);
                            return;
                        }

                        if (isCurrency) {
                            var currencyCode = input.toUpperCase();
                            var currencies = Object.keys(carts);

                            // Bail if not included
                            if (!currencies.includes(currencyCode)) {
                                reject(new Error('No carts for ' + currencyCode));
                                return;
                            }

                            // Set active
                            currencies.forEach(function (code) {
                                carts[code].active = code === currencyCode;
                            });
                        } else {
                            // Set active
                            Object.keys(carts).forEach(function (code) {
                                var cart = carts[code];
                                cart.active = cart.id === input;
                            });
                        }

                        // Store again
                        _this8.storage.setCarts(_this8.config.id, carts);

                        resolve(carts);
                    });
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Get the current active cart
         */

    }, {
        key: 'getActiveCart',
        value: function getActiveCart() {
            var _this9 = this;

            var fetch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            return new Promise(function (resolve, reject) {
                _this9.getUser().then(function () {
                    var carts = _this9.storage.getCarts(_this9.config.id);

                    if (!Object.keys(carts).length) {
                        resolve(null);
                        return;
                    }

                    var actives = Object.keys(carts).filter(function (c) {
                        return carts[c].active;
                    });

                    if (!actives.length) {
                        resolve(null);
                        return;
                    }

                    var active = carts[actives[0]];

                    if (!fetch) {
                        resolve(active.id);
                        return;
                    }

                    _this9.getCart(active.id).then(function (cart) {
                        return resolve(cart);
                    }).catch(function (error) {
                        return reject(error);
                    });
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Add a product to a cart
         * @param {string} id - The cart ID
         * @param {object} product - The product details
         */

    }, {
        key: 'addToCart',
        value: function addToCart(id, product) {
            var _this10 = this;

            return new Promise(function (resolve, reject) {
                if (!utils.is.objectId(id)) {
                    reject(new Error('A valid id is required'));
                    return;
                }

                if (utils.is.empty(product)) {
                    reject(new Error('A valid product is required'));
                    return;
                }

                _this10.getUser().then(function () {
                    http.post(config.urls.addToCart(_this10.config.env, id), product).then(function (json) {
                        var cart = new Cart(_this10, json, true);

                        // Set the active cart
                        _this10.setActiveCart(cart.currency_code);

                        resolve(cart);
                    }).catch(reject);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Update an items quantity in the shopping cart
         * @param {string} id - The shopping cart ID
         * @param {string} index - The shopping cart item quid
         * @param {number} quantity - Desired quantity
         */

    }, {
        key: 'updateCartItemQuantity',
        value: function updateCartItemQuantity(id, index) {
            var _this11 = this;

            var quantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            return new Promise(function (resolve, reject) {
                if (!utils.is.objectId(id)) {
                    reject(new Error('A valid id is required'));
                    return;
                }

                if (utils.is.empty(index)) {
                    reject(new Error('A valid index is required'));
                    return;
                }

                _this11.getUser().then(function () {
                    http.post(config.urls.updateCartItemQuantity(_this11.config.env, id), { index: index, quantity: quantity }).then(function (json) {
                        var cart = new Cart(_this11, json, true);

                        // Set the active cart
                        _this11.setActiveCart(cart.currency_code);

                        resolve(cart);
                    }).catch(reject);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Remove a product from a cart
         * @param {string} id - The shopping cart id
         * @param {string} index - The shopping cart item guid
         */

    }, {
        key: 'removeFromCart',
        value: function removeFromCart(id, index) {
            var _this12 = this;

            return new Promise(function (resolve, reject) {
                if (!utils.is.objectId(id)) {
                    reject(new Error('A valid id is required'));
                    return;
                }

                if (utils.is.empty(index)) {
                    reject(new Error('A valid index is required'));
                    return;
                }

                _this12.getUser().then(function () {
                    http.post(config.urls.removeFromCart(_this12.config.env, id), { index: index }).then(function (json) {
                        var cart = new Cart(_this12, json, true);

                        // Set the active cart
                        _this12.setActiveCart(cart.currency_code);

                        resolve(cart);
                    }).catch(reject);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }
    }]);
    return SelzClient;
}();

export default SelzClient;
