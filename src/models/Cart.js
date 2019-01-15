import Product from './Product';

let client = null;

export class CartItem {
    constructor(item, cartId) {
        this.cartId = cartId;

        // Take all properties by default
        Object.assign(this, item);

        // Map product
        this.product = new Product(client, item.product, item.variant_id);
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
     * @param {object} product - The product details
     */
    add(product) {
        return client.addToCart(this.id, product);
    }

    /**
     * Remove a product from this cart
     * @param {string} index
     */
    remove(index) {
        return client.removeFromCart(this.id, index);
    }
}

export default Cart;
