import utils from './utils';

function getBase(env) {
    return `https://${!utils.is.empty(env) ? `${env}-` : ''}selz.com/sdk/`;
}

const config = {
    urls: {
        /**
         * Get URL for product data by URL
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} url - Short or full URL for a product
         */
        product(env, url = '') {
            return `${getBase(env)}products/find?url=${url}`;
        },

        /**
         * Get URL for all products by User ID
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - The User ID for the store
         * @param {string} query - Search query
         * @param {number} page - Page to fetch
         */
        products(env, id, query = '', page = 1) {
            return `${getBase(env)}products/all${id}?q=${query}&p=${page}`;
        },

        /**
         * Get URL for finding user for a URL
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} url - The URL to lookup
         */
        user(env, url = '') {
            return `${getBase(env)}user/find?url=${url}`;
        },

        /**
         * Create a new cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Store ID
         */
        createCart(env, id = '') {
            return `${getBase(env)}cart/create/${id}`;
        },

        /**
         * Get cart from ID
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        getCart(env, id = '') {
            return `${getBase(env)}cart/${id}`;
        },

        /**
         * Check carts still exist server side
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Cart IDs
         */
        checkCarts(env, ids = '') {
            return `${getBase(env)}cart/verify?ids=${ids}`;
        },

        /**
         * Add product to cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        addToCart(env, id = '') {
            return `${getBase(env)}cart/add/${id}`;
        },

        /**
         * Update a cart item quantity
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        updateCartItemQuantity(env, id = '') {
            return `${getBase(env)}cart/updateitemquantity/${id}`;
        },

        /**
         * Remove product from cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - Cart ID
         */
        removeFromCart(env, id = '') {
            return `${getBase(env)}cart/remove/${id}`;
        },
    },
};

export default config;
