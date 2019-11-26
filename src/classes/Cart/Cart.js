import CartItem from './CartItem';

let client = null;

export default class Cart {
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
        this.items = Array.from(cart.items).map(item => new CartItem(client, item, cart.id));
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
