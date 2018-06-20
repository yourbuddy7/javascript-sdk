import is from '../utils/is';

class Store {
    constructor(store = null) {
        this.id = 0;
        this.url = '';

        if (is.number(store) && store > 0) {
            this.id = store;
        } else if (is.string(store) && store.length) {
            const parsed = parseInt(store, 10);

            if (is.number(parsed) && parsed > 0) {
                this.id = parsed;
            } else if (is.url(store)) {
                this.url = store;
            }
        } else if (is.object(store)) {
            this.map(store);
        }
    }

    static map(current, update) {
        return Object.assign(current, update);
    }

    get hasId() {
        return this.id > 0;
    }

    get hasUrl() {
        return !is.empty(this.url);
    }
}

export default Store;
