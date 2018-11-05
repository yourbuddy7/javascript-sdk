import is from '../utils/is';

class Category {
    constructor(category = null) {
        if (!is.object(category)) {
            return;
        }

        // Take all properties by default
        Object.assign(this, category);
    }
}

export default Category;
