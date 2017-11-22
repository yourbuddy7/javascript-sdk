import 'babel-polyfill';

import config from './config';
import http from './http';

import Product from './models/product';
import Cart from './models/cart';
import Modal from './ui/modal';

class SelzClient {
    constructor(props) {
        this.config = Object.assign(
            {
                env: '',
                domain: '',
                id: -1,
                colors: {},
            },
            props,
        );

        if (!this.isIdSet() && !this.isDomainSet()) {
            throw Error('User or domain are required');
        }

        // Get the stylesheet
        if (!document.getElementById('selz-client-styles')) {
            fetch(config.urls.stylesheet())
                .then(data => data.text())
                .then(css => {
                    const style = document.createElement('style');
                    style.setAttribute('id', 'selz-client-styles');
                    document.head.appendChild(style);
                    style.textContent = css;
                });
        }

        this.modal = new Modal(this.config);
    }

    isIdSet() {
        return Number.isInteger(this.config.id) && this.config.id !== -1;
    }
    isDomainSet() {
        return typeof this.config.domain === 'string' && this.config.domain.length;
    }

    /**
     * Get product data
     * @param {String} url - Short or full URL for a product
     */
    getProduct(url) {
        return new Promise((resolve, reject) => {
            http
                .get(config.urls.product(this.config.env, url))
                .then(json => {
                    resolve(new Product(this, json));
                })
                .catch(reject);
        });
    }

    /**
     * Get all products
     */
    async getAllProducts() {
        await this.getUser();

        return http.get(config.urls.products(this.config.env, this.config.id));
    }

    /**
     * Get the Store ID
     * TODO: Queue this somehow?
     */
    getUser() {
        if (this.isIdSet()) {
            return new Promise(resolve => resolve(this.config.id));
        }

        return new Promise((resolve, reject) => {
            http
                .get(config.urls.userId(this.config.env, this.config.domain))
                .then(json => {
                    this.config.id = json.id;
                    resolve(json.id);
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Create a new shopping cart
     * @param {String} currency - ISO currency code
     * @param {String} discount - Discount code (optional)
     */
    async createCart(currency, discount) {
        await this.getUser();

        return new Promise((resolve, reject) => {
            http
                .post(config.urls.createCart(this.config.env, this.config.id), {
                    currency,
                    discount: typeof discount === 'string' && discount.length ? discount : null,
                })
                .then(json => {
                    resolve(new Cart(this, json));
                })
                .catch(reject);
        });
    }

    /**
     * Get a shopping cart
     * @param {String} id - The shopping cart id
     */
    async getCart(id) {
        await this.getUser();

        return new Promise((resolve, reject) => {
            http
                .get(config.urls.getCart(this.config.env, id))
                .then(json => {
                    resolve(new Cart(this, json));
                })
                .catch(reject);
        });
    }

    /**
     * Add a product to a cart
     * @param {String} id - The shopping cart id
     * @param {Object} product - The product details
     */
    async addToCart(id, product) {
        await this.getUser();

        return new Promise((resolve, reject) => {
            http
                .post(config.urls.addToCart(this.config.env, id), product)
                .then(json => {
                    resolve(new Cart(this, json));
                })
                .catch(reject);
        });
    }

    /**
     * Remove a product from a cart
     * @param {String} id - The shopping cart id
     * @param {Guid} index - The shopping cart item guid
     */
    async removeFromCart(id, index) {
        await this.getUser();

        return new Promise((resolve, reject) => {
            http
                .post(config.urls.removeFromCart(this.config.env, id), { index })
                .then(json => {
                    resolve(new Cart(this, json));
                })
                .catch(reject);
        });
    }
}

export default SelzClient;
