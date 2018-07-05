import is from '../utils/is';

class Store {
    constructor(store = null) {
        if (!is.object(store)) {
            return;
        }

        // Take all properties by default
        Object.assign(this, store);
    }
}

export default Store;
