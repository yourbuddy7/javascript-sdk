import config from './config';
import http from './http';
import Cart from './models/Cart';
import Product from './models/Product';
import Storage from './storage';
import Modal from './ui/Modal';
import utils from './utils';

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
            if (utils.is.empty(currency)) {
                reject(new Error('currency is required'));
                return;
            }

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
            if (utils.is.empty(currency)) {
                reject(new Error('currency is required'));
                return;
            }

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
     * @param {string} input - The shopping cart ISO currency code or cart ID
     */
    getCart(input) {
        return new Promise((resolve, reject) => {
            const isCurrency = utils.is.currencyCode(input);
            const isObjectId = utils.is.objectId(input);

            if (!isCurrency && !isObjectId) {
                reject(new Error('A valid currency or cart id are required'));
                return;
            }

            this.getUser()
                .then(() => {
                    if (isCurrency) {
                        const currencyCode = input.toUpperCase();

                        this.getCartId(currencyCode).then(id => {
                            if (utils.is.empty(id)) {
                                reject(new Error(`Could not find matching cart for currency '${currencyCode}'`));
                                return;
                            }

                            this.getCart(id)
                                .then(cart => resolve(cart))
                                .catch(error => reject(error));
                        });
                    } else {
                        http
                            .get(config.urls.getCart(this.config.env, input))
                            .then(json => {
                                const activeId = this.getActiveCart();
                                resolve(new Cart(this, json, json.id === activeId));
                            })
                            .catch(error => reject(error));
                    }
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get all current carts
     */
    getCarts(validate = true) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const carts = this.storage.getCarts(this.config.id);

                    if (utils.is.empty(carts)) {
                        resolve(null);
                        return;
                    }

                    // Check the carts still exist in the server
                    if (validate) {
                        const ids = Object.keys(carts).map(currency => carts[currency].id);

                        http
                            .get(config.urls.checkCarts(this.config.env, ids.join(',')))
                            .then(json => {
                                // Filter out carts that don't exist
                                const remove = Object.keys(carts).filter(cart => json[cart.id]);

                                // Remove non existant carts
                                remove.forEach(currency => {
                                    delete carts[currency];
                                });

                                // Set active to first if none exist
                                const currencies = Object.keys(carts);
                                if (currencies.length && !currencies.some(currency => carts[currency].active)) {
                                    // Set active
                                    currencies.forEach(currency => {
                                        const cart = carts[currency];
                                        cart.active = cart.id === carts[currencies[0]].id;
                                    });
                                }

                                // Update storage
                                this.storage.setCarts(this.config.id, carts);

                                resolve(carts);
                            })
                            .catch(error => reject(error));
                    } else {
                        resolve(carts);
                    }
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Set the active cart based on currency
     * @param {string} input - The shopping cart ISO currency code or cart ID
     */
    setActiveCart(input) {
        return new Promise((resolve, reject) => {
            const isCurrency = utils.is.currencyCode(input);
            const isObjectId = utils.is.objectId(input);

            if (!isCurrency && !isObjectId) {
                reject(new Error('A valid currency or cart id are required'));
                return;
            }

            this.getUser()
                .then(() => {
                    this.getCarts(false).then(data => {
                        const carts = data;

                        // No carts
                        if (utils.is.empty(carts)) {
                            resolve(null);
                            return;
                        }

                        if (isCurrency) {
                            const currencyCode = input.toUpperCase();
                            const currencies = Object.keys(carts);

                            // Bail if not included
                            if (!currencies.includes(currencyCode)) {
                                reject(new Error(`No carts for ${currencyCode}`));
                                return;
                            }

                            // Set active
                            currencies.forEach(code => {
                                carts[code].active = code === currencyCode;
                            });
                        } else {
                            // Set active
                            Object.keys(carts).forEach(code => {
                                const cart = carts[code];
                                cart.active = cart.id === input;
                            });
                        }

                        // Store again
                        this.storage.setCarts(this.config.id, carts);

                        resolve(carts);
                    });
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Get the current active cart
     */
    getActiveCart(fetch = false) {
        return new Promise((resolve, reject) => {
            this.getUser()
                .then(() => {
                    const carts = this.storage.getCarts(this.config.id);

                    if (!Object.keys(carts).length) {
                        resolve(null);
                        return;
                    }

                    const actives = Object.keys(carts).filter(c => carts[c].active);

                    if (!actives.length) {
                        resolve(null);
                        return;
                    }

                    const active = carts[actives[0]];

                    if (!fetch) {
                        resolve(active.id);
                        return;
                    }

                    this.getCart(active.id)
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
            if (!utils.is.objectId(id)) {
                reject(new Error('A valid id is required'));
                return;
            }

            if (utils.is.empty(product)) {
                reject(new Error('A valid product is required'));
                return;
            }

            this.getUser()
                .then(() => {
                    http
                        .post(config.urls.addToCart(this.config.env, id), product)
                        .then(json => {
                            const cart = new Cart(this, json, true);

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
     * Update an items quantity in the shopping cart
     * @param {string} id - The shopping cart ID
     * @param {string} index - The shopping cart item quid
     * @param {number} quantity - Desired quantity
     */
    updateCartItemQuantity(id, index, quantity = 1) {
        return new Promise((resolve, reject) => {
            if (!utils.is.objectId(id)) {
                reject(new Error('A valid id is required'));
                return;
            }

            if (utils.is.empty(index)) {
                reject(new Error('A valid index is required'));
                return;
            }

            this.getUser()
                .then(() => {
                    http
                        .post(config.urls.updateCartItemQuantity(this.config.env, id), { index, quantity })
                        .then(json => {
                            const cart = new Cart(this, json, true);

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
            if (!utils.is.objectId(id)) {
                reject(new Error('A valid id is required'));
                return;
            }

            if (utils.is.empty(index)) {
                reject(new Error('A valid index is required'));
                return;
            }

            this.getUser()
                .then(() => {
                    http
                        .post(config.urls.removeFromCart(this.config.env, id), { index })
                        .then(json => {
                            const cart = new Cart(this, json, true);

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
