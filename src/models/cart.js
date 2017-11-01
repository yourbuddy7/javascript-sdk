class Cart {
    constructor(cart) {
        this.id = cart.id;
        this.seller_id = cart.seller_id;
        this.url = cart.id;

        this.currency_code = cart.currency_code;
        this.total_price = cart.total_price;
        this.total_price_display = cart.total_price_display;

        this.items = cart.items;

        this.channel = cart.channel;
        this.tracking_id = cart.tracking_id;

        this.created_time = cart.created_time;
        this.updated_time = cart.updated_time;
    }

    addItem() {
        return this.id;
    }

    removeItem() {
        return this.id;
    }
}

export default Cart;
