// ==========================================================================
// Local storage wrapper
// TODO: methods should return promises?
// ==========================================================================

import Store from '../models/Store';
import { dedupe } from './arrays';
import extend from './extend';
import is from './is';
import parseUrl from './parseUrl';

const storage = new Map();

const getKey = url => {
    if (url === null) {
        return null;
    }

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
                schema: new Date('2018-07-02').getTime(), // Schema version (allowing us to change data schema and invalidate storage)
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

    getStore(input) {
        let store = null;

        if (!is.number(input) && !is.url(input)) {
            return null;
        }

        const stores = this.get(this.config.keys.stores) || [];

        if (is.number(input)) {
            store = stores.find(s => is.object(s.data) && s.data.id === input);
        } else if (is.url(input)) {
            const key = getKey(input);

            // Bail if invalid URL
            if (key === null) {
                return null;
            }

            store = stores.find(s => is.array(s.urls) && s.urls.includes(key));
        }

        if (!is.object(store)) {
            return null;
        }

        // Check TTL is valid
        const ttl = Number(store.ttl);

        if (ttl > 0 && ttl < Date.now()) {
            this.purge();
            return null;
        }

        return new Store(store.data);
    }

    setStore(data, url = null) {
        // Strip the protocol from the lookup url
        const key = getKey(url);

        // Get current list of stores
        const stores = this.get(this.config.keys.stores) || [];
        let existing = null;

        if (!is.empty(stores)) {
            // Find existing store by id
            existing = stores.find(store => store.data.id === data.id);
        }

        // Extend TTL each
        const ttl = Date.now() + this.config.ttl;

        // If we found something
        if (is.object(existing)) {
            // Update data and extend TTL
            Object.assign(existing, {
                data,
                ttl,
            });

            if (key !== null) {
                // Add the URL key for later lookup
                if (!is.array(existing.urls)) {
                    existing.urls = [key];
                } else {
                    existing.urls.push(key);
                }

                // Remove duplicate entries
                const urls = dedupe(existing.urls);

                // Add to existing record
                Object.assign(existing, {
                    urls,
                });
            }

            console.warn(existing);
        } else {
            const store = {
                data,
                ttl,
            };

            if (key !== null) {
                Object.assign(store, {
                    urls: [key],
                });
            }

            stores.push(store);
        }

        this.set(this.config.keys.stores, stores);
    }
}

export default Storage;
