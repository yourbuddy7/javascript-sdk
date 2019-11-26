import is from '../../utils/is';
import Product from '../Product/Product';

const isProduct = input => !is.empty(input) && input instanceof Product;

export default class CartAddItem {
    constructor(item) {
        this.productId = null;
        this.variantId = null;
        this.quantity = 1;
        this.discountCode = null;
        this.buyersUnitPrice = null;

        if (isProduct(item) || is.object(item)) {
            this.productId = item.id;
            this.variantId = is.objectId(item.variant) ? item.variant : null;
        }
    }
}
