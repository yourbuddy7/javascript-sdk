"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Cart", {
  enumerable: true,
  get: function get() {
    return _Cart.Cart;
  }
});
Object.defineProperty(exports, "CartAddItem", {
  enumerable: true,
  get: function get() {
    return _Cart.CartAddItem;
  }
});
Object.defineProperty(exports, "CartItem", {
  enumerable: true,
  get: function get() {
    return _Cart.CartItem;
  }
});
Object.defineProperty(exports, "Category", {
  enumerable: true,
  get: function get() {
    return _Category["default"];
  }
});
Object.defineProperty(exports, "Product", {
  enumerable: true,
  get: function get() {
    return _Product.Product;
  }
});
Object.defineProperty(exports, "Store", {
  enumerable: true,
  get: function get() {
    return _Store["default"];
  }
});
exports["default"] = void 0;

var _Cart = require("./classes/Cart");

var _Category = _interopRequireDefault(require("./classes/Category"));

var _Product = require("./classes/Product");

var _Store = _interopRequireDefault(require("./classes/Store"));

var _config = _interopRequireDefault(require("./config"));

var _http = _interopRequireDefault(require("./utils/http"));

var _is = _interopRequireDefault(require("./utils/is"));

var _storage = _interopRequireDefault(require("./utils/storage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Client =
/*#__PURE__*/
function () {
  function Client(props) {
    _classCallCheck(this, Client);

    var env = props.env,
        store = props.store,
        source = props.source;
    this.env = !_is["default"].empty(env) ? env : '';
    this.store = store;
    this.source = source;

    if (!_is["default"].url(store) && !_is["default"].number(store)) {
      throw Error('A store ID or URL is required to create a client');
    }

    this.storage = new _storage["default"]();
  }
  /**
   * Get the store ID only
   */


  _createClass(Client, [{
    key: "getStoreId",
    value: function getStoreId() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (_is["default"].number(_this.store)) {
          resolve(_this.store);
          return;
        }

        if (_this.store instanceof _Store["default"]) {
          resolve(_this.store.id);
          return;
        } // URL is required


        if (!_is["default"].url(_this.store)) {
          reject(new Error('Url is required for user lookup'));
        } // Get by URL


        _this.getStore().then(function (store) {
          resolve(store.id);
        })["catch"](reject);
      });
    }
    /**
     * Get the Store for current instance
     */

  }, {
    key: "getStore",
    value: function getStore() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        // Try from cache by ID or URL
        if (_is["default"].number(_this2.store) || _is["default"].url(_this2.store)) {
          var cached = _this2.storage.getStore(_this2.store); // Return cached if we have it


          if (cached !== null && cached instanceof _Store["default"]) {
            resolve(cached);
            return;
          }
        } // If already fetched


        if (_this2.store instanceof _Store["default"]) {
          resolve(_this2.store);
          return;
        } // Fetch from remote by ID or URL


        var url = _config["default"].urls.store(_this2.env, _this2.store);

        _http["default"].get(url).then(function (store) {
          _this2.setStore(store);

          resolve(_this2.store);
        })["catch"](reject);
      });
    }
    /**
     * Set the store details
     * @param {object} store
     */

  }, {
    key: "setStore",
    value: function setStore(store) {
      if (!_is["default"].object(store)) {
        return;
      } // Store reference to lookup URL


      var url = _is["default"].url(this.store) ? this.store : null; // Map to Store

      this.store = new _Store["default"](store); // Add to storage for cache

      this.storage.setStore(this.store, url);
    }
    /**
     * Get product data
     * @param {String} url - Short or full URL for a product
     */

  }, {
    key: "getProduct",
    value: function getProduct(url) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _http["default"].get(_config["default"].urls.product(_this3.env, url)).then(function (json) {
          if (!(_this3.store instanceof _Store["default"])) {
            _this3.setStore(json.store);
          }

          resolve(new _Product.Product(_this3, json));
        })["catch"](reject);
      });
    }
    /**
     * Get all products
     */

  }, {
    key: "getProducts",
    value: function getProducts() {
      var _this4 = this;

      var keyword = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var category = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var page = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      return new Promise(function (resolve, reject) {
        _this4.getStoreId().then(function (id) {
          _http["default"].get(_config["default"].urls.products(_this4.env, id, !_is["default"].empty(keyword) ? keyword : '', _is["default"].string(category) ? category : '', !_is["default"].number(page) || page < 1 ? 1 : page)).then(function (json) {
            resolve(_objectSpread({}, json, {
              products: json.products.map(function (p) {
                return new _Product.Product(_this4, p);
              })
            }));
          })["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Get all categories
     */

  }, {
    key: "getCategories",
    value: function getCategories() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.getStoreId().then(function (id) {
          _http["default"].get(_config["default"].urls.categories(_this5.env, id)).then(function (json) {
            resolve(_objectSpread({}, json, {
              categories: json.categories.map(function (c) {
                return new _Category["default"](c);
              })
            }));
          })["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Buy a product
     * @param {Object} item - The cart item
     * @returns {Cart}
     */

  }, {
    key: "buy",
    value: function buy(item) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        if (_is["default"].empty(item)) {
          reject(new Error('A cart item is required'));
          return;
        } // Map the cart item if required


        var cartItem = item;

        if (_is["default"].object(item) || item instanceof _Product.Product) {
          cartItem = new _Cart.CartAddItem(item);
        }

        if (!(cartItem instanceof _Cart.CartAddItem)) {
          reject(new Error('A valid cart item is required'));
        }

        _http["default"].post(_config["default"].urls.buy(_this6.env), cartItem).then(function (json) {
          var cart = new _Cart.Cart(_this6, json, true); // Cache store

          _this6.setStore(cart.store);

          resolve(cart);
        })["catch"](reject);
      });
    }
    /**
     * Create a new shopping cart
     * @param {String} currency - ISO currency code
     * @param {String} discount - Discount code
     */

  }, {
    key: "createCart",
    value: function createCart(currency, discount) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        if (_is["default"].empty(currency)) {
          reject(new Error('currency is required'));
          return;
        }

        _this7.getStoreId().then(function (id) {
          var currencyCode = currency.toUpperCase();

          _http["default"].post(_config["default"].urls.createCart(_this7.env, id), {
            currency: currencyCode,
            discount: !_is["default"].empty(discount) ? discount : null,
            source: _this7.source
          }).then(function (json) {
            var cart = new _Cart.Cart(_this7, json); // Store reference to cart id for later

            _this7.storage.setCart(id, currencyCode, cart);

            resolve(cart);
          })["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Get a shopping cart or create one if needed
     * @param {String} currency - The shopping cart ISO currency code
     */

  }, {
    key: "getCartId",
    value: function getCartId(currency) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        if (!_is["default"].currencyCode(currency)) {
          reject(new Error('A valid currency code is required'));
          return;
        }

        _this8.getStoreId().then(function (id) {
          var currencyCode = currency.toUpperCase();

          var currentCart = _this8.storage.getCart(id, currencyCode); // Create cart if it doesn't exist


          if (_is["default"].empty(currentCart)) {
            _this8.createCart(currencyCode).then(function (cart) {
              return resolve(cart.id);
            })["catch"](reject);
          } else {
            resolve(currentCart.id);
          }
        })["catch"](reject);
      });
    }
    /**
     * Get a shopping cart
     * @param {String} input - The shopping cart ISO currency code or cart ID
     */

  }, {
    key: "getCart",
    value: function getCart(input) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        var isCurrency = _is["default"].currencyCode(input);

        var isObjectId = _is["default"].objectId(input);

        if (!isCurrency && !isObjectId) {
          reject(new Error('A valid currency code or cart id are required'));
          return;
        }

        if (isCurrency) {
          var currencyCode = input.toUpperCase();

          _this9.getCartId(currencyCode).then(function (id) {
            if (_is["default"].empty(id)) {
              reject(new Error("Could not find matching cart for currency code '".concat(currencyCode, "'")));
              return;
            }

            _this9.getCart(id).then(function (cart) {
              // Update store
              _this9.setStore(cart.store);

              resolve(cart);
            })["catch"](reject);
          })["catch"](reject);
        } else {
          _http["default"].get(_config["default"].urls.getCart(_this9.env, input)).then(function (json) {
            var activeId = _this9.getActiveCart();

            var cart = new _Cart.Cart(_this9, json, json.id === activeId); // Update store

            _this9.setStore(cart.store);

            resolve(cart);
          })["catch"](reject);
        }
      });
    }
    /**
     * Get all current carts
     */

  }, {
    key: "getCarts",
    value: function getCarts() {
      var _this10 = this;

      var validate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      return new Promise(function (resolve, reject) {
        _this10.getStoreId().then(function (id) {
          var carts = _this10.storage.getCarts(id);

          if (_is["default"].empty(carts)) {
            resolve(null);
            return;
          } // Check the carts still exist in the server


          if (validate) {
            var ids = Object.keys(carts).map(function (currency) {
              return carts[currency].id;
            });

            _http["default"].get(_config["default"].urls.checkCarts(_this10.env, ids.join(','))).then(function (json) {
              // Remove non existant carts
              Object.entries(json).forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    cartId = _ref2[0],
                    exists = _ref2[1];

                if (!exists) {
                  var currency = Object.keys(carts).find(function (c) {
                    return carts[c].id === cartId;
                  });
                  delete carts[currency];
                }
              }); // Store again

              _this10.storage.setCarts(id, carts); // Set active


              if (!Object.values(carts).find(function (cart) {
                return cart.active;
              })) {
                _this10.setActiveCart().then(resolve)["catch"](reject);
              } else {
                resolve(carts);
              }
            })["catch"](reject);
          } else {
            resolve(carts);
          }
        })["catch"](reject);
      });
    }
    /**
     * Set the active cart based on currency
     * @param {String} input - The shopping cart ISO currency code or cart ID
     */

  }, {
    key: "setActiveCart",
    value: function setActiveCart() {
      var _this11 = this;

      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return new Promise(function (resolve, reject) {
        _this11.getStoreId().then(function (id) {
          _this11.getCarts(false).then(function (data) {
            var carts = data; // No carts

            if (_is["default"].empty(carts)) {
              resolve(null);
              return;
            } // Currency code was passed...


            if (_is["default"].currencyCode(input)) {
              var currencyCode = input.toUpperCase();
              var currencies = Object.keys(carts); // Bail if not included

              if (!currencies.includes(currencyCode)) {
                reject(new Error("No carts for ".concat(currencyCode)));
                return;
              } // Set active


              currencies.forEach(function (currency) {
                carts[currency].active = currency === currencyCode;
              });
            } else {
              // Set to id if specified, otherwise first
              var cartId = _is["default"].objectId(input) ? input : carts[Object.keys(carts)[0]].id; // Set active

              Object.keys(carts).forEach(function (currency) {
                var cart = carts[currency];
                cart.active = cart.id === cartId;
              });
            } // Store again


            _this11.storage.setCarts(id, carts);

            resolve(carts);
          });
        })["catch"](reject);
      });
    }
    /**
     * Get the current active cart
     */

  }, {
    key: "getActiveCart",
    value: function getActiveCart() {
      var _this12 = this;

      var fetch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return new Promise(function (resolve, reject) {
        _this12.getStoreId().then(function (id) {
          var carts = _this12.storage.getCarts(id);

          if (!Object.keys(carts).length) {
            resolve(null);
            return;
          }

          var active = Object.values(carts).find(function (cart) {
            return cart.active;
          });

          if (!active) {
            resolve(null);
            return;
          }

          if (!fetch) {
            resolve(active.id);
            return;
          }

          _this12.getCart(active.id).then(resolve)["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Add a product to a cart
     * @param {String} id - The cart ID
     * @param {Object} item - The cart item
     */

  }, {
    key: "addToCart",
    value: function addToCart(id, item) {
      var _this13 = this;

      return new Promise(function (resolve, reject) {
        if (!_is["default"].objectId(id)) {
          reject(new Error('A valid id is required'));
          return;
        }

        if (_is["default"].empty(item)) {
          reject(new Error('A cart item is required'));
          return;
        } // Map the cart item if required


        var cartItem = item;

        if (_is["default"].object(item) || item instanceof _Product.Product) {
          cartItem = new _Cart.CartAddItem(item);
        }

        if (!(cartItem instanceof _Cart.CartAddItem)) {
          reject(new Error('A valid cart item is required'));
        }

        _http["default"].post(_config["default"].urls.addToCart(_this13.env, id), cartItem).then(function (json) {
          var cart = new _Cart.Cart(_this13, json, true); // Update store

          _this13.setStore(cart.store); // Set the active cart


          _this13.setActiveCart(cart.id).then(function () {
            resolve(cart);
          })["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Add a product with a flexable price to a cart
     * @param {String} id - The cart ID
     * @param {Object} item - The cart item
     * @param {Number} price - The user decided price
     */

  }, {
    key: "addToCartFlexPrice",
    value: function addToCartFlexPrice(id, item) {
      var _this14 = this;

      var price = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      return new Promise(function (resolve, reject) {
        if (!_is["default"].objectId(id)) {
          reject(new Error('A valid id is required'));
          return;
        }

        if (_is["default"].empty(item)) {
          reject(new Error('A cart item is required'));
          return;
        }

        if (!item.isPriceFlexible) {
          reject(new Error('This product\'s price is not flexible. Please use "addToCart" instead.'));
        }

        if (typeof price != 'number') {
          reject(new Error("The price must be a number. It is currently ".concat(_typeof(price))));
        } // Map the cart item if required


        var cartItem = item;

        if (_is["default"].object(item) || item instanceof _Product.Product) {
          cartItem = new _Cart.CartAddItem(item);
          cartItem.buyersUnitPrice = price;
        }

        if (!(cartItem instanceof _Cart.CartAddItem)) {
          reject(new Error('A valid cart item is required'));
        }

        _http["default"].post(_config["default"].urls.addToCart(_this14.env, id), cartItem).then(function (json) {
          var cart = new _Cart.Cart(_this14, json, true); // Update store

          _this14.setStore(cart.store); // Set the active cart


          _this14.setActiveCart(cart.id).then(function () {
            resolve(cart);
          })["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Update an items quantity in the shopping cart
     * @param {String} id - The shopping cart ID
     * @param {String} index - The shopping cart item quid
     * @param {Number} quantity - Desired quantity
     */

  }, {
    key: "updateCartItemQuantity",
    value: function updateCartItemQuantity(id, index) {
      var _this15 = this;

      var quantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      return new Promise(function (resolve, reject) {
        if (!_is["default"].objectId(id)) {
          reject(new Error('A valid id is required'));
          return;
        }

        if (_is["default"].empty(index)) {
          reject(new Error('A valid index is required'));
          return;
        }

        _http["default"].post(_config["default"].urls.updateCartItemQuantity(_this15.env, id), {
          index: index,
          quantity: quantity
        }).then(function (json) {
          var cart = new _Cart.Cart(_this15, json, true); // Update store

          _this15.setStore(cart.store); // Set the active cart


          _this15.setActiveCart(cart.id).then(function () {
            resolve(cart);
          })["catch"](reject);
        })["catch"](reject);
      });
    }
    /**
     * Remove a product from a cart
     * @param {String} id - The shopping cart id
     * @param {String} index - The shopping cart item guid
     */

  }, {
    key: "removeFromCart",
    value: function removeFromCart(id, index) {
      var _this16 = this;

      return new Promise(function (resolve, reject) {
        if (!_is["default"].objectId(id)) {
          reject(new Error('A valid id is required'));
          return;
        }

        if (_is["default"].empty(index)) {
          reject(new Error('A valid index is required'));
          return;
        }

        _http["default"].post(_config["default"].urls.removeFromCart(_this16.env, id), {
          index: index
        }).then(function (json) {
          // If there's actually a cart left, map it
          if (!_is["default"].empty(json)) {
            var cart = new _Cart.Cart(_this16, json, true); // Set the active cart

            _this16.setActiveCart(cart.id).then(function () {
              resolve(cart);
            })["catch"](reject);
          } else {
            // Otherwise, update carts (as one removed)
            _this16.getCarts().then(function () {
              return resolve(null);
            })["catch"](reject);
          }
        })["catch"](reject);
      });
    }
  }]);

  return Client;
}();

var _default = Client;
exports["default"] = _default;