import is from '../../utils/is';

export default class Store {
    constructor(store = null) {
        if (!is.object(store)) {
            return;
        }

        // Take all properties by default
        Object.assign(this, store);
    }
}
