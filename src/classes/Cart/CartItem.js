import Product from '../Product/Product';

export default class CartItem {
    constructor(client, item, cartId) {
        this.cartId = cartId;

        // Take all properties by default
        Object.assign(this, item);

        // Map product
        this.product = new Product(client, item.product, item.variantId);
    }
}
