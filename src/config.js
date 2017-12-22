import utils from './utils';

function getBase(env) {
    return `https://${utils.is.string(env) && env.length ? `${env}.` : ''}selz.com/sdk/`;
}

const config = {
    urls: {
        /**
         * Get URL for product data by URL
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} url - Short or full URL for a product
         */
        product(env, url = '') {
            return `${getBase(env)}product?url=${url}`;
        },

        /**
         * Get URL for all products by User ID
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} id - The User ID for the store
         * @param {string} query - Search query
         * @param {number} page - Page to fetch
         */
        products(env, id, query = '', page = 1) {
            return `${getBase(env)}products/${id}?q=${query}&p=${page}`;
        },

        /**
         * Get URL for User ID by domain
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {string} url - The URL for the store
         */
        userId(env, url = '') {
            return `${getBase(env)}userid?domain=${url}`;
        },

        /**
         * Create a new cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Store ID
         */
        createCart(env, id = '') {
            return `${getBase(env)}createcart/${id}`;
        },

        /**
         * Get cart from ID
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Cart ID
         */
        getCart(env, id = '') {
            return `${getBase(env)}cart/${id}`;
        },

        /**
         * Add product to cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Cart ID
         */
        addToCart(env, id = '') {
            return `${getBase(env)}addtocart/${id}`;
        },

        /**
         * Remove product from cart
         * @param {string} env - Environment (e.g. local, develop, release)
         * @param {number} id - Cart ID
         */
        removeFromCart(env, id = '') {
            return `${getBase(env)}removefromcart/${id}`;
        },

        /**
         * Get URL for stylesheet
         */
        stylesheet() {
            return '../dist/styles.css';
        },
    },
};

export default config;
