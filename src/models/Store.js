import utils from './../utils';

class Store {
    constructor(store = null) {
        this.id = 0;
        this.url = '';

        if (utils.is.number(store) && store > 0) {
            this.id = store;
        } else if (utils.is.string(store) && store.length) {
            const parsed = parseInt(store, 10);

            if (utils.is.number(parsed) && parsed > 0) {
                this.id = parsed;
            } else if (utils.is.url(store)) {
                this.url = store;
            }
        } else if (utils.is.object(store)) {
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
        return !utils.is.empty(this.url);
    }
}

export default Store;
