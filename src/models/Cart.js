import utils from './../utils';
import Product from './Product';

let client = null;

class CartItem {
    constructor(item, cartId) {
        this.index = item.index;
        this.cartId = cartId;

        this.product = new Product(client, item.product, item.variant_id);

        this.price = item.price;
        this.price_formatted = item.price_formatted;

        this.has_buyers_price = item.has_buyers_price;
        this.buyers_price = item.buyers_price;
        this.buyers_price_formatted = item.buyers_price_formatted;

        this.has_discount = item.has_discount;
        this.discount_code = item.discount_code;
        this.dicount_name = item.discount_name;
        this.total_discount = item.total_discount;
        this.total_discount_formatted = item.total_discount_formatted;

        this.sub_total = item.sub_total;
        this.sub_total_formatted = item.sub_total_formatted;

        // Semi private for quantity updates so we can bind to getters/setters
        let _quantity = item.quantity;
        this._setQuantity = (quantity = 1) => {
            _quantity = quantity;
            client.updateCartItemQuantity(this.cartId, this.index, quantity);
        };
        this._getQuantity = () => _quantity;
    }

    get quantity() {
        return this._getQuantity();
    }

    set quantity(quantity) {
        this._setQuantity(quantity);
    }
}

class Cart {
    constructor(instance, cart, active = false) {
        if (cart === null) {
            return;
        }

        client = instance;

        this.id = cart.id;
        this.active = active;
        this.seller_id = cart.seller_id;
        this.url = cart.url;

        this.channel = cart.channel;
        this.tracking_id = cart.tracking_id;

        this.items = Array.from(cart.items).map(item => new CartItem(item, cart.id));

        this.currency_symbol = cart.currency_symbol;
        this.currency_code = cart.currency_code;
        this.total = cart.total;
        this.total_formatted = cart.total_formatted;

        this.created_time = cart.created_time;
        this.updated_time = cart.updated_time;
    }

    /**
     * Checkout a cart
     * @param {object} colors - Colors object for the modal
     */
    checkout(colors) {
        if (!utils.is.string(this.url)) {
            return;
        }

        client.modal.open(this.url, utils.is.object(colors) ? colors : client.config.colors);
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
