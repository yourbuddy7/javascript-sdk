import utils from './../utils';

class Store {
    constructor(store = null) {
        this.id = -1;

        if (utils.is.number(store) && store > -1) {
            this.id = store;
        } else if (utils.is.object(store)) {
            // Take all properties by default
            Object.assign(this, store);
        }
    }
}

export default Store;
