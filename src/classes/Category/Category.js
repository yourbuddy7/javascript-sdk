import is from '../../utils/is';

export default class Category {
    constructor(category = null) {
        if (!is.object(category)) {
            return;
        }

        // Take all properties by default
        Object.assign(this, category);
    }
}
