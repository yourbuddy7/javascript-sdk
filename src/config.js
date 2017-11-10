import utils from './utils';

function getBase(env) {
    return `https://${utils.is.string(env) && env.length ? `${env}.` : ''}selz.com/sdk/`;
}

const config = {
    urls: {
        /**
         * Get URL for product data by URL
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {String} url - Short or full URL for a product
         */
        product(env, url) {
            return `${getBase(env)}product?url=${url}`;
        },

        /**
         * Get URL for all products by User ID
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {String} id - The User ID for the store
         */
        products(env, id) {
            return `${getBase(env)}products/${id}`;
        },

        /**
         * Get URL for User ID by domain
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {String} url - The URL for the store
         */
        userId(env, url) {
            return `${getBase(env)}userid?domain=${url}`;
        },

        /**
         * Create a new cart
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {Number} id - Store ID
         */
        createCart(env, id) {
            return `${getBase(env)}createcart/${id}`;
        },

        /**
         * Get cart from ID
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {Number} id - Cart ID
         */
        getCart(env, id) {
            return `${getBase(env)}cart/${id}`;
        },

        /**
         * Add product to cart
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {Number} id - Cart ID
         */
        addToCart(env, id) {
            return `${getBase(env)}addtocart/${id}`;
        },

        /**
         * Remove product from cart
         * @param {String} env - Environment (e.g. local, develop, release)
         * @param {Number} id - Cart ID
         */
        removeFromCart(env, id) {
            return `${getBase(env)}removefromcart/${id}`;
        },
    },
};

export default config;
