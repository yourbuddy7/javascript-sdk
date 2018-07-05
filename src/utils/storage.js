// ==========================================================================
// Local storage wrapper
// TODO: methods should return promises?
// ==========================================================================

import { dedupe } from './arrays';
import extend from './extend';
import is from './is';
import parseUrl from './parseUrl';

const storage = new Map();

// Check version against that in storage
// So we invalidate on cache
// const schemaVersion = 1;

const getKey = url => {
    // Strip the protocol from the lookup url
    const parsed = parseUrl(url);

    if (parsed === null) {
        return null;
    }

    return `${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
};

class Storage {
    constructor(config) {
        this.config = Object.assign(
            {
                keys: {
                    root: 'selz-js-sdk',
                    carts: 'carts',
                    stores: 'stores',
                },
                ttl: 3600, // 1 hour
                schema: new Date('2018-07-01').getTime(), // Schema version (allowing us to change data schema and invalidate storage)
            },
            config,
        );

        this.purge();
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

            if (!is.empty(stored)) {
                data = JSON.parse(stored);
            }
        }

        if (is.empty(data)) {
            return null;
        }

        if (!is.empty(key)) {
            return Object.keys(data).includes(key) ? data[key] : null;
        }

        return data;
    }

    set(key, value, merge = false) {
        // Get current storage
        const data = this.get() || {};

        // Extend with the new data
        if (merge && Object.keys(data).includes(key)) {
            data[key] = extend(data[key], value);
        } else {
            data[key] = value;
        }

        // Set in faux-storage
        storage.set(this.config.keys.root, data);

        // Bail if no real support
        if (!Storage.supported) {
            return;
        }

        // Set schema version
        data.schema = this.config.schema;

        // Update storage
        try {
            window.localStorage.setItem(this.config.keys.root, JSON.stringify(data));
        } catch (e) {
            // Do nothing
        }
    }

    // Clean up stale storage
    purge() {
        // Check schema
        const data = this.get();

        // Nothing to purge
        if (is.empty(data)) {
            return;
        }

        // If schema does not match, kill it
        if (Number(data.schema) !== this.config.schema) {
            window.localStorage.removeItem(this.config.keys.root);
            return;
        }

        // Get current list of stores
        const stores = this.get(this.config.keys.stores) || [];

        // Nothing to cleanup
        if (is.empty(stores)) {
            return;
        }

        // Check TTL is valid
        this.set(
            this.config.keys.stores,
            stores.filter(store => {
                const ttl = Number(store.ttl);
                return ttl > 0 && ttl > Date.now();
            }),
        );
    }

    getCarts(store) {
        const data = this.get(this.config.keys.carts) || {};

        // If no carts
        if (is.empty(data)) {
            return null;
        }

        // Get all carts
        if (!is.number(store)) {
            return data;
        }

        // Store not found
        if (!Object.keys(data).includes(store.toString())) {
            return null;
        }

        // Get all for a store
        return data[store.toString()];
    }

    getCart(store, currency) {
        const carts = this.getCarts(store);

        // No carts
        if (is.empty(carts)) {
            return null;
        }

        // Get all for a store
        if (!is.string(currency)) {
            return carts;
        }

        // Currency not found
        if (!Object.keys(carts).includes(currency.toUpperCase())) {
            return null;
        }

        return carts[currency.toUpperCase()];
    }

    setCart(store, currency, cart) {
        this.set(
            this.config.keys.carts,
            {
                [store]: {
                    [currency.toUpperCase()]: {
                        id: cart.id,
                        active: cart.active,
                    },
                },
            },
            true,
        );
    }

    setCarts(store, carts = {}) {
        this.set(this.config.keys.carts, {
            [store]: carts,
        });
    }

    getStore(url) {
        const key = getKey(url);

        // Bail if invalid URL
        if (key === null) {
            return null;
        }

        const stores = this.get(this.config.keys.stores) || [];
        const data = stores.find(store => store.urls.includes(key));

        if (!is.object(data)) {
            return null;
        }

        // Check TTL is valid
        const ttl = Number(data.ttl);

        if (ttl > 0 && ttl < Date.now()) {
            this.purge();
            return null;
        }

        return data;
    }

    setStore(url, data) {
        // Strip the protocol from the lookup url
        const key = getKey(url);

        // Bail if invalid URL
        if (key === null) {
            return;
        }

        // Get current list of stores
        const stores = this.get(this.config.keys.stores) || [];
        let index = -1;

        if (!is.empty(stores)) {
            // Find existing store by id
            index = stores.findIndex(store => store.data.id === data.id);
        }

        // Extend TTL each time
        const ttl = Date.now() + this.config.ttl;

        // If we found something
        if (index > -1) {
            const existing = stores[index];

            stores[index] = Object.assign(existing, {
                urls: dedupe(existing.urls.push(key)),
                data,
                ttl,
            });
        } else {
            stores.push({
                urls: [key],
                data,
                ttl,
            });
        }

        this.set(this.config.keys.stores, stores);
    }
}

export default Storage;
