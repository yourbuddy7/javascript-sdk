// ==========================================================================
// Local storage wrapper
// TODO: methods should return promises?
// ==========================================================================

import utils from './utils';

const storage = new Map();

class Storage {
    constructor(keys) {
        this.keys = Object.assign(
            {
                root: 'selz',
                carts: 'carts',
                domains: 'domains',
            },
            keys,
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
        let data = storage.get(this.keys.root);

        // Grab from real storage if we can or use faux-storage
        if (Storage.supported) {
            const stored = window.localStorage.getItem(this.keys.root);

            if (!utils.is.empty(stored)) {
                data = JSON.parse(stored);
            }
        }

        if (utils.is.empty(data)) {
            return null;
        }

        return utils.is.string(key) && key.length ? data[key] : data;
    }

    set(key, value) {
        // Get current storage
        const data = this.get() || {};

        // Inject the new data
        if (Object.keys(data).includes(key)) {
            const base = data[key];
            utils.extend(base, value);
        } else {
            data[key] = value;
        }

        // Set in faux-storage
        storage.set(this.keys.root, data);

        // Bail if no real support
        if (!Storage.supported) {
            return;
        }

        // Update storage
        try {
            window.localStorage.setItem(this.keys.root, JSON.stringify(data));
        } catch (e) {
            // Do nothing
        }
    }

    getCarts(seller) {
        const data = this.get(this.keys.carts) || {};

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
        const update = {};
        update[seller] = {};
        update[seller][currency.toUpperCase()] = {
            id: cart.id,
            active: cart.active,
        };

        this.set(this.keys.carts, update);
    }

    setCarts(seller, carts = {}) {
        const update = {};
        update[seller] = carts;

        this.set(this.keys.carts, update);
    }

    getSeller(domain) {
        const data = this.get(this.keys.domains) || {};

        if (!utils.is.string(domain) || utils.is.empty(data) || !Object.keys(data).includes(domain)) {
            return null;
        }

        return data[domain];
    }

    setSeller(domain, id) {
        const update = {};
        update[domain] = id;

        this.set(this.keys.domains, update);
    }
}

export default Storage;
