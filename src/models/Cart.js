import is from '../utils/is';
import Product from './Product';

let client = null;

class CartItem {
    constructor(item, cartId) {
        this.cartId = cartId;

        // Semi private for quantity updates so we can bind to getters/setters
        let _quantity = item.quantity;

        // Take all properties by default
        Object.assign(this, item, {
            _setQuantity: (quantity = 1) => {
                _quantity = quantity;
                client.updateCartItemQuantity(this.cartId, this.index, quantity);
            },
            _getQuantity: () => _quantity,
            get quantity() {
                return this._getQuantity();
            },
            set quantity(quantity) {
                this._setQuantity(quantity);
            },
        });

        // Map product
        this.product = new Product(client, item.product, item.variant_id);
    }
}

class Cart {
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
     * Checkout a cart
     * @param {object} colors - Colors object for the modal
     */
    checkout(colors) {
        if (!is.string(this.url)) {
            return;
        }

        client.modal.open(this.url, Object.assign(client.colors, colors));
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
