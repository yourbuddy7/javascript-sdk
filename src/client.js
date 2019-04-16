import config from './config';
import { Cart, CartAddItem, CartItem } from './models/Cart';
import Category from './models/Category';
import Product from './models/Product';
import Store from './models/Store';
import http from './utils/http';
import is from './utils/is';
import Storage from './utils/storage';

class Client {
    constructor(props) {
        const { env, store, source } = props;

        this.env = !is.empty(env) ? env : '';
        this.store = store;
        this.source = source;

        if (!is.url(store) && !is.number(store)) {
            throw Error('A store ID or URL is required to create a client');
        }

        this.storage = new Storage();
    }

    /**
     * Get the store ID only
     */
    getStoreId() {
        return new Promise((resolve, reject) => {
            if (is.number(this.store)) {
                resolve(this.store);
                return;
            }

            if (this.store instanceof Store) {
                resolve(this.store.id);
                return;
            }

            // URL is required
            if (!is.url(this.store)) {
                reject(new Error('Url is required for user lookup'));
            }

            // Get by URL
            this.getStore()
                .then(store => {
                    resolve(store.id);
                })
                .catch(reject);
        });
    }

    /**
     * Get the Store for current instance
     */
    getStore() {
        return new Promise((resolve, reject) => {
            // Try from cache by ID or URL
            if (is.number(this.store) || is.url(this.store)) {
                const cached = this.storage.getStore(this.store);

                // Return cached if we have it
                if (cached !== null && cached instanceof Store) {
                    resolve(cached);
                    return;
                }
            }

            // If already fetched
            if (this.store instanceof Store) {
                resolve(this.store);
                return;
            }

            // Fetch from remote by ID or URL
            const url = config.urls.store(this.env, this.store);

            http.get(url)
                .then(store => {
                    this.setStore(store);
                    resolve(this.store);
                })
                .catch(reject);
        });
    }

    /**
     * Set the store details
     * @param {object} store
     */
    setStore(store) {
        if (!is.object(store)) {
            return;
        }

        // Store reference to lookup URL
        const url = is.url(this.store) ? this.store : null;

        // Map to Store
        this.store = new Store(store);

        // Add to storage for cache
        this.storage.setStore(this.store, url);
    }

    /**
     * Get product data
     * @param {String} url - Short or full URL for a product
     */
    getProduct(url) {
        return new Promise((resolve, reject) => {
            http.get(config.urls.product(this.env, url))
                .then(json => {
                    if (!(this.store instanceof Store)) {
                        this.setStore(json.store);
                    }

                    resolve(new Product(this, json));
                })
                .catch(reject);
        });
    }

    /**
     * Get all products
     */
    getProducts(keyword = '', category = '', page = 1) {
        return new Promise((resolve, reject) => {
            this.getStoreId()
                .then(id => {
                    http.get(
                        config.urls.products(
                            this.env,
                            id,
                            !is.empty(keyword) ? keyword : '',
                            is.string(category) ? category : '',
                            !is.number(page) || page < 1 ? 1 : page,
                        ),
                    )
                        .then(json => {
                            resolve(
                                Object.assign({}, json, {
                                    products: json.products.map(p => new Product(this, p)),
                                }),
                            );
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Get all categories
     */
    getCategories() {
        return new Promise((resolve, reject) => {
            this.getStoreId()
                .then(id => {
                    http.get(config.urls.categories(this.env, id))
                        .then(json => {
                            resolve(
                                Object.assign({}, json, {
                                    categories: json.categories.map(c => new Category(c)),
                                }),
                            );
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Buy a product
     * @param {Object} item - The cart item
     * @returns {Cart}
     */
    buy(item) {
        return new Promise((resolve, reject) => {
            if (is.empty(item)) {
                reject(new Error('A cart item is required'));
                return;
            }

            // Map the cart item if required
            let cartItem = item;
            if (is.object(item) || item instanceof Product) {
                cartItem = new CartAddItem(item);
            }

            if (!(cartItem instanceof CartAddItem)) {
                reject(new Error('A valid cart item is required'));
            }

            http.post(config.urls.buy(this.env), cartItem)
                .then(json => {
                    const cart = new Cart(this, json, true);

                    // Cache store
                    this.setStore(cart.store);

                    resolve(cart);
                })
                .catch(reject);
        });
    }

    /**
     * Create a new shopping cart
     * @param {String} currency - ISO currency code
     * @param {String} discount - Discount code
     */
    createCart(currency, discount) {
        return new Promise((resolve, reject) => {
            if (is.empty(currency)) {
                reject(new Error('currency is required'));
                return;
            }

            this.getStoreId()
                .then(id => {
                    const currencyCode = currency.toUpperCase();

                    http.post(config.urls.createCart(this.env, id), {
                        currency: currencyCode,
                        discount: !is.empty(discount) ? discount : null,
                        source: this.source,
                    })
                        .then(json => {
                            const cart = new Cart(this, json);

                            // Store reference to cart id for later
                            this.storage.setCart(id, currencyCode, cart);

                            resolve(cart);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Get a shopping cart or create one if needed
     * @param {String} currency - The shopping cart ISO currency code
     */
    getCartId(currency) {
        return new Promise((resolve, reject) => {
            if (!is.currencyCode(currency)) {
                reject(new Error('A valid currency code is required'));
                return;
            }

            this.getStoreId()
                .then(id => {
                    const currencyCode = currency.toUpperCase();
                    const currentCart = this.storage.getCart(id, currencyCode);

                    // Create cart if it doesn't exist
                    if (is.empty(currentCart)) {
                        this.createCart(currencyCode)
                            .then(cart => resolve(cart.id))
                            .catch(reject);
                    } else {
                        resolve(currentCart.id);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Get a shopping cart
     * @param {String} input - The shopping cart ISO currency code or cart ID
     */
    getCart(input) {
        return new Promise((resolve, reject) => {
            const isCurrency = is.currencyCode(input);
            const isObjectId = is.objectId(input);

            if (!isCurrency && !isObjectId) {
                reject(new Error('A valid currency code or cart id are required'));
                return;
            }

            if (isCurrency) {
                const currencyCode = input.toUpperCase();

                this.getCartId(currencyCode)
                    .then(id => {
                        if (is.empty(id)) {
                            reject(new Error(`Could not find matching cart for currency code '${currencyCode}'`));
                            return;
                        }

                        this.getCart(id)
                            .then(cart => {
                                // Update store
                                this.setStore(cart.store);

                                resolve(cart);
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                http.get(config.urls.getCart(this.env, input))
                    .then(json => {
                        const activeId = this.getActiveCart();
                        const cart = new Cart(this, json, json.id === activeId);

                        // Update store
                        this.setStore(cart.store);

                        resolve(cart);
                    })
                    .catch(reject);
            }
        });
    }

    /**
     * Get all current carts
     */
    getCarts(validate = true) {
        return new Promise((resolve, reject) => {
            this.getStoreId()
                .then(id => {
                    const carts = this.storage.getCarts(id);

                    if (is.empty(carts)) {
                        resolve(null);
                        return;
                    }

                    // Check the carts still exist in the server
                    if (validate) {
                        const ids = Object.keys(carts).map(currency => carts[currency].id);

                        http.get(config.urls.checkCarts(this.env, ids.join(',')))
                            .then(json => {
                                // Remove non existant carts
                                Object.entries(json).forEach(([cartId, exists]) => {
                                    if (!exists) {
                                        const currency = Object.keys(carts).find(c => carts[c].id === cartId);
                                        delete carts[currency];
                                    }
                                });

                                // Store again
                                this.storage.setCarts(id, carts);

                                // Set active
                                if (!Object.values(carts).find(cart => cart.active)) {
                                    this.setActiveCart()
                                        .then(resolve)
                                        .catch(reject);
                                } else {
                                    resolve(carts);
                                }
                            })
                            .catch(reject);
                    } else {
                        resolve(carts);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Set the active cart based on currency
     * @param {String} input - The shopping cart ISO currency code or cart ID
     */
    setActiveCart(input = null) {
        return new Promise((resolve, reject) => {
            this.getStoreId()
                .then(id => {
                    this.getCarts(false).then(data => {
                        const carts = data;

                        // No carts
                        if (is.empty(carts)) {
                            resolve(null);
                            return;
                        }

                        // Currency code was passed...
                        if (is.currencyCode(input)) {
                            const currencyCode = input.toUpperCase();
                            const currencies = Object.keys(carts);

                            // Bail if not included
                            if (!currencies.includes(currencyCode)) {
                                reject(new Error(`No carts for ${currencyCode}`));
                                return;
                            }

                            // Set active
                            currencies.forEach(currency => {
                                carts[currency].active = currency === currencyCode;
                            });
                        } else {
                            // Set to id if specified, otherwise first
                            const cartId = is.objectId(input) ? input : carts[Object.keys(carts)[0]].id;

                            // Set active
                            Object.keys(carts).forEach(currency => {
                                const cart = carts[currency];
                                cart.active = cart.id === cartId;
                            });
                        }

                        // Store again
                        this.storage.setCarts(id, carts);

                        resolve(carts);
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Get the current active cart
     */
    getActiveCart(fetch = false) {
        return new Promise((resolve, reject) => {
            this.getStoreId()
                .then(id => {
                    const carts = this.storage.getCarts(id);

                    if (!Object.keys(carts).length) {
                        resolve(null);
                        return;
                    }

                    const active = Object.values(carts).find(cart => cart.active);

                    if (!active) {
                        resolve(null);
                        return;
                    }

                    if (!fetch) {
                        resolve(active.id);
                        return;
                    }

                    this.getCart(active.id)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Add a product to a cart
     * @param {String} id - The cart ID
     * @param {Object} item - The cart item
     */
    addToCart(id, item) {
        return new Promise((resolve, reject) => {
            if (!is.objectId(id)) {
                reject(new Error('A valid id is required'));
                return;
            }

            if (is.empty(item)) {
                reject(new Error('A cart item is required'));
                return;
            }

            // Map the cart item if required
            let cartItem = item;
            if (is.object(item) || item instanceof Product) {
                cartItem = new CartAddItem(item);
            }

            if (!(cartItem instanceof CartAddItem)) {
                reject(new Error('A valid cart item is required'));
            }

            http.post(config.urls.addToCart(this.env, id), cartItem)
                .then(json => {
                    const cart = new Cart(this, json, true);

                    // Update store
                    this.setStore(cart.store);

                    // Set the active cart
                    this.setActiveCart(cart.id)
                        .then(() => {
                            resolve(cart);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Update an items quantity in the shopping cart
     * @param {String} id - The shopping cart ID
     * @param {String} index - The shopping cart item quid
     * @param {Number} quantity - Desired quantity
     */
    updateCartItemQuantity(id, index, quantity = 1) {
        return new Promise((resolve, reject) => {
            if (!is.objectId(id)) {
                reject(new Error('A valid id is required'));
                return;
            }

            if (is.empty(index)) {
                reject(new Error('A valid index is required'));
                return;
            }

            http.post(config.urls.updateCartItemQuantity(this.env, id), { index, quantity })
                .then(json => {
                    const cart = new Cart(this, json, true);

                    // Update store
                    this.setStore(cart.store);

                    // Set the active cart
                    this.setActiveCart(cart.id)
                        .then(() => {
                            resolve(cart);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Remove a product from a cart
     * @param {String} id - The shopping cart id
     * @param {String} index - The shopping cart item guid
     */
    removeFromCart(id, index) {
        return new Promise((resolve, reject) => {
            if (!is.objectId(id)) {
                reject(new Error('A valid id is required'));
                return;
            }

            if (is.empty(index)) {
                reject(new Error('A valid index is required'));
                return;
            }

            http.post(config.urls.removeFromCart(this.env, id), { index })
                .then(json => {
                    // If there's actually a cart left, map it
                    if (!is.empty(json)) {
                        const cart = new Cart(this, json, true);

                        // Set the active cart
                        this.setActiveCart(cart.id)
                            .then(() => {
                                resolve(cart);
                            })
                            .catch(reject);
                    } else {
                        // Otherwise, update carts (as one removed)
                        this.getCarts()
                            .then(() => resolve(null))
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    }
}

export { Product, Category, Cart, CartItem, CartAddItem, Store };

export default Client;
