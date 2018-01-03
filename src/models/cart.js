import utils from './../utils';

import Product from './product';

let client = null;

class CartItem {
    constructor(item) {
        this.index = item.index;

        this.product = new Product(client, item.product);

        this.variant_id = item.variant_id;
        this.variant_title = item.variant_title;
        this.variant_sku = item.variant_sku;

        this.has_discount = item.has_discount;
        this.discount_code = item.discount_code;
        this.dicount_name = item.discount_name;

        this.total_discount = item.total_discount;
        this.total_discount_formatted = item.total_discount_formatted;

        this.quantity = item.quantity;

        this.has_buyers_price = item.has_buyers_price;
        this.buyers_price = item.buyers_price;
        this.buyers_price_formatted = item.buyers_price_formatted;

        this.price = item.price;
        this.price_formatted = item.price_formatted;

        this.sub_total = item.sub_total;
        this.sub_total_formatted = item.sub_total_formatted;
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

        this.items = Array.from(cart.items).map(item => new CartItem(item));
        this.item_count = cart.items.length;

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
