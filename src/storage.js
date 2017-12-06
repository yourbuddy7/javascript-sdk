// ==========================================================================
// Local storage wrapper
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
        if (!('localStorage' in window)) {
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
        window.localStorage.setItem(this.keys.root, JSON.stringify(data));
    }

    getCart(seller, currency) {
        const data = this.get(this.keys.carts) || {};

        // If no carts
        if (utils.is.empty(data)) {
            return null;
        }

        // Get all carts
        if (!utils.is.string(seller) && !utils.is.string(currency)) {
            return data;
        }

        // Get all for a seller
        if (utils.is.string(seller) && !utils.is.string(currency)) {
            return data[seller];
        }

        return data[seller][currency.toUpperCase()];
    }

    setCart(seller, currency, id) {
        const update = {};
        update[seller] = {};
        update[seller][currency.toUpperCase()] = id;

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
