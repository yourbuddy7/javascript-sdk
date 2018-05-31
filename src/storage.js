// ==========================================================================
// Local storage wrapper
// TODO: methods should return promises?
// ==========================================================================

import utils from './utils';

const storage = new Map();

class Storage {
    constructor(config) {
        this.config = Object.assign(
            {
                keys: {
                    root: 'selz-js-sdk',
                    carts: 'carts',
                    stores: 'stores',
                },
                ttl: 7200, // 2 hours in seconds
            },
            config,
        );
    }

    // Check for actual support (see if we can use it)
    static get supported() {
        if (!window.localStorage) {
            return false;
        }

        const key = '___test';

        // Try to use it
        try {
            window.localStorage.setItem(key, key);
            window.localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    get(key) {
        let data = storage.get(this.config.keys.root);

        // Grab from real storage if we can or use faux-storage
        if (Storage.supported) {
            const stored = window.localStorage.getItem(this.config.keys.root);

            if (!utils.is.empty(stored)) {
                data = JSON.parse(stored);
            }
        }

        if (utils.is.empty(data)) {
            return null;
        }

        if (!utils.is.empty(key)) {
            return Object.keys(data).includes(key) ? data[key] : null;
        }

        return data;
    }

    set(key, value) {
        // Get current storage
        const current = this.get() || {};

        // Inject the new data
        if (Object.keys(current).includes(key)) {
            const base = current[key];
            utils.extend(base, value);
        } else {
            current[key] = value;
        }

        // Set in faux-storage
        storage.set(this.config.keys.root, current);

        // Bail if no real support
        if (!Storage.supported) {
            return;
        }

        // Update storage
        try {
            window.localStorage.setItem(this.config.keys.root, JSON.stringify(current));
        } catch (e) {
            // Do nothing
        }
    }

    getCarts(seller) {
        const data = this.get(this.config.keys.carts) || {};

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

    getCart(seller, currency) {
        const carts = this.getCarts(seller);

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

    setCart(seller, currency, cart) {
        const update = {
            [seller]: {
                [currency.toUpperCase()]: {
                    id: cart.id,
                    active: cart.active,
                },
            },
        };

        this.set(this.config.keys.carts, update);
    }

    setCarts(seller, carts = {}) {
        const update = {
            [seller]: carts,
        };

        this.set(this.config.keys.carts, update);
    }

    getStore(url) {
        const data = this.get(this.config.keys.stores) || {};

        if (!utils.is.string(url) || utils.is.empty(data) || !Object.keys(data).includes(url)) {
            return null;
        }

        // Check timestamp
        const ttl = Number(data[url].ttl);

        if (ttl > 0 && ttl < Date.now()) {
            return null;
        }

        return data[url].data;
    }

    setStore(url, data) {
        const update = {
            [url]: {
                data,
                ttl: Date.now() + this.config.ttl,
            },
        };

        this.set(this.config.keys.stores, update);
    }
}

export default Storage;
