import is from '../utils/is';
import Product from './Product';

let client = null;
const isProduct = input => !is.empty(input) && input instanceof Product;

export class CartItem {
    constructor(item, cartId) {
        this.cartId = cartId;

        // Take all properties by default
        Object.assign(this, item);

        // Map product
        this.product = new Product(client, item.product, item.variantId);
    }
}

export class CartAddItem {
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

export class Cart {
    constructor(instance, cart, active = false) {
        if (cart === null) {
            return;
        }

        client = instance;

        // Take all properties by default
        Object.assign(this, cart);

        // Map store
        this.store = client.store;

        // Set active state
        this.active = active;

        // Map items
        this.items = Array.from(cart.items).map(item => new CartItem(item, cart.id));
    }

    /**
     * Add a product to this cart
     * @param {Object} item - The cart item
     */
    add(item) {
        return client.addToCart(this.id, item);
    }

    /**
     * Remove a product from this cart
     * @param {String} index
     */
    remove(index) {
        return client.removeFromCart(this.id, index);
    }
}

export default Cart;
