"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _is = _interopRequireDefault(require("./utils/is"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getBase = function getBase(env) {
  return "https://".concat(_is["default"].empty(env) || ['selz.com', 'app.selz.com'].includes(env) ? 'app.selz.com/sdk' : "".concat(env, "/sdk"), "/");
};

var config = {
  urls: {
    /**
     * Get URL for product data by URL
     * @param {String} env - Environment (for internal use)
     * @param {String} url - Short or full URL for a product
     */
    product: function product(env) {
      var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "products/find?url=").concat(url);
    },

    /**
     * Get URL for all products by store ID
     * @param {String} env - Environment (for internal use)
     * @param {Number|String} id - The store ID
     * @param {String} keyword - Search keyword
     * @param {ObjectId|String} category - Category ID or relative path
     * @param {Number} page - Page to fetch
     */
    products: function products(env, id) {
      var keyword = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      var category = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
      var page = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
      return "".concat(getBase(env), "products/all/").concat(id, "?q=").concat(keyword, "&c=").concat(category, "&p=").concat(page);
    },

    /**
     * Get all categories for a given store ID
     * @param {String} env - Environment (for internal use)
     * @param {String} id - The store ID
     */
    categories: function categories(env, id) {
      return "".concat(getBase(env), "categories/").concat(id);
    },

    /**
     * Get URL for finding a store by URL or ID
     * @param {String} env - Environment (for internal use)
     * @param {Number|String} input - The ID or URL to lookup
     */
    store: function store(env) {
      var input = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (_is["default"].number(input)) {
        return "".concat(getBase(env), "store/find/").concat(input);
      }

      return "".concat(getBase(env), "store/find?url=").concat(input);
    },

    /**
     * Buy a product
     * @param {String} env - Environment (for internal use)
     */
    buy: function buy(env) {
      return "".concat(getBase(env), "cart/buy");
    },

    /**
     * Create a new cart
     * @param {String} env - Environment (for internal use)
     * @param {Number} id - Store ID
     */
    createCart: function createCart(env) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "cart/create/").concat(id);
    },

    /**
     * Get cart from ID
     * @param {String} env - Environment (for internal use)
     * @param {String} id - Cart ID
     */
    getCart: function getCart(env) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "cart/").concat(id);
    },

    /**
     * Check carts still exist server side
     * @param {String} env - Environment (for internal use)
     * @param {Number} id - Cart IDs
     */
    checkCarts: function checkCarts(env) {
      var ids = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "cart/verify?ids=").concat(ids);
    },

    /**
     * Add product to cart
     * @param {String} env - Environment (for internal use)
     * @param {String} id - Cart ID
     */
    addToCart: function addToCart(env) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "cart/add/").concat(id);
    },

    /**
     * Update a cart item quantity
     * @param {String} env - Environment (for internal use)
     * @param {String} id - Cart ID
     */
    updateCartItemQuantity: function updateCartItemQuantity(env) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "cart/updateitemquantity/").concat(id);
    },

    /**
     * Remove product from cart
     * @param {String} env - Environment (for internal use)
     * @param {String} id - Cart ID
     */
    removeFromCart: function removeFromCart(env) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return "".concat(getBase(env), "cart/remove/").concat(id);
    }
  }
};
var _default = config;
exports["default"] = _default;