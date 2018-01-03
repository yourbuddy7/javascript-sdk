import config from './config';
import http from './http';
import utils from './utils';

import Storage from './storage';
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
                })
                .catch(() => {});
        }

        this.storage = new Storage();

        this.modal = new Modal(this.config);
    }

    isIdSet() {
        return Number.isInteger(this.config.id) && this.config.id !== -1;
    }
    isDomainSet() {
        return typeof this.config.domain === 'string' && this.config.domain.length;
    }

    /**
     * Get the Store ID
     * TODO: Queue this somehow?
     */
    getUser() {
        return new Promise((resolve, reject) => {
            // Already set
            if (this.isIdSet()) {
                resolve(this.config.id);
                return;
            }

            // Cached
            const cached = this.storage.getSeller(this.config.domain);
            if (!utils.is.empty(cached)) {
                this.config.id = cached;
                resolve(cached);
                return;
            }

            http
                .get(config.urls.userId(this.config.env, this.config.domain))
                .then(id => {
                    this.config.id = id;
                    this.storage.setSeller(this.config.domain, id);
                    resolve(id);
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get product data
     * @param {string} url - Short or full URL for a product
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
    getProducts(query = '', page = 1) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    http
                        .get(config.urls.products(this.config.env, this.config.id, query, page < 1 ? 1 : page))
                        .then(json => {
                            resolve(json.map(p => new Product(this, p)));
                        })
                        .catch(reject);
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Create a new shopping cart
     * @param {string} currency - ISO currency code
     * @param {string} [discount] - Discount code
     */
    createCart(currency, discount) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const currencyCode = currency.toUpperCase();

                    http
                        .post(config.urls.createCart(this.config.env, this.config.id), {
                            currency: currencyCode,
                            discount: typeof discount === 'string' && discount.length ? discount : null,
                        })
                        .then(json => {
                            const cart = new Cart(this, json);

                            // Store reference to cart id for later
                            this.storage.setCart(this.config.id, currencyCode, cart);

                            resolve(cart);
                        })
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get a shopping cart or create one if needed
     * @param {string} currency - The shopping cart ISO currency code
     */
    getCartId(currency) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const currencyCode = currency.toUpperCase();
                    const currentCart = this.storage.getCart(this.config.id, currencyCode);

                    // Create cart if it doesn't exist
                    if (utils.is.empty(currentCart)) {
                        this.createCart(currencyCode)
                            .then(cart => resolve(cart.id))
                            .catch(error => reject(error));
                    } else {
                        resolve(currentCart.id);
                    }
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get a shopping cart
     * @param {string} id - The shopping cart id
     */
    getCartById(id) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    http
                        .get(config.urls.getCart(this.config.env, id))
                        .then(json => {
                            resolve(new Cart(this, json));
                        })
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get a shopping cart
     * @param {string} currency - The shopping cart ISO currency code
     */
    getCartByCurrency(currency) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const currencyCode = currency.toUpperCase();

                    this.getCartId(currencyCode).then(id => {
                        if (utils.is.empty(id)) {
                            reject(new Error(`Could not find matching cart for currency '${currencyCode}'`));
                        }

                        this.getCartById(id)
                            .then(cart => resolve(cart))
                            .catch(error => reject(error));
                    });
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get all current carts
     */
    getCarts() {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const carts = this.storage.getCarts(this.config.id);

                    if (utils.is.empty(carts)) {
                        resolve(null);
                        return;
                    }

                    resolve(carts);
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Set the active cart based on currency
     * @param {string} currency - The shopping cart ISO currency code
     */
    setActiveCart(currency) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    this.getCarts().then(c => {
                        const carts = c;
                        const currencyCode = currency.toUpperCase();

                        // No carts
                        if (utils.is.empty(carts)) {
                            resolve();
                            return;
                        }

                        const currencies = Object.keys(carts);

                        // Unset active
                        currencies.forEach(c => {
                            delete carts[c].active;
                        });

                        // Bail if not included
                        if (!currencies.includes(currencyCode)) {
                            reject(new Error(`No carts for ${currencyCode}`));
                            return;
                        }

                        // Set true
                        carts[currencyCode].active = true;

                        // Store again
                        this.storage.setCarts(this.config.id, carts);

                        resolve();
                    });
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get the current active cart
     */
    getActiveCart(fetch = true) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const carts = this.storage.getCarts(this.config.id);

                    if (!Object.keys(carts).length) {
                        resolve(null);
                    }

                    const actives = Object.keys(carts).filter(c => carts[c].active);

                    if (!actives.length) {
                        resolve(null);
                    }

                    const active = carts[actives[0]];

                    if (!fetch) {
                        resolve(active.id);
                    }

                    this.getCartById(active.id)
                        .then(cart => resolve(cart))
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Add a product to a cart
     * @param {string} id - The cart ID
     * @param {object} product - The product details
     */
    addToCart(id, product) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    http
                        .post(config.urls.addToCart(this.config.env, id), product)
                        .then(json => {
                            const cart = new Cart(this, json);

                            // Set the active cart
                            this.setActiveCart(cart.currency_code);

                            resolve(cart);
                        })
                        .catch(reject);
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Remove a product from a cart
     * @param {string} id - The shopping cart id
     * @param {string} index - The shopping cart item guid
     */
    removeFromCart(id, index) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    http
                        .post(config.urls.removeFromCart(this.config.env, id), { index })
                        .then(json => {
                            const cart = new Cart(this, json);

                            // Set the active cart
                            this.setActiveCart(cart.currency_code);

                            resolve(cart);
                        })
                        .catch(reject);
                })
                .catch(error => reject(error));
        });
    }
}

export default SelzClient;
