import utils from './../utils';

let client = null;

class ProductUrls {
    constructor(urls) {
        this.full = urls.full;
        this.store = urls.store;
        this.short = urls.short;
        this.checkout = urls.checkout;
    }
}

class ProductImage {
    constructor(image) {
        this.pico = image.pico;
        this.icon = image.icon;
        this.thumb = image.thumb;
        this.small = image.small;
        this.compact = image.compact;
        this.medium = image.medium;
        this.large = image.large;
        this.grande = image.grande;
        this.mucho_grande = image.mucho_grande;
        this.huge = image.huge;
        this.original = image.original;
        this.featured = image.is_featured;
        this.default = image.is_default;
    }
}

class ProductMedia {
    constructor(media) {
        this.type = media.type;
        this.state = media.state;
        this.url = media.url;
        this.cover = new ProductImage(media.cover);
    }
}

class ProductFile {
    constructor(file) {
        this.name = file.file_name;
        this.size = file.file_size;
    }
}

class ProductVariant {
    constructor(variant) {
        this.id = variant.id;
        this.title = variant.title;
        this.sku = variant.sku;
        this.price = variant.price;
        this.price_formatted = variant.price_formatted;
        this.quantity = variant.quantity;
        this.quantity_available = variant.quantity_available;
        this.options = variant.options;
    }
}

class ProductVariantAttributeOption {
    constructor(id, label) {
        this.id = id;
        this.label = label;
    }
}

class ProductVariantAttribute {
    constructor(variant) {
        this.id = variant.id;
        this.name = variant.name;
        this.options = Object.keys(variant.options).map(id => new ProductVariantAttributeOption(id, variant.options[id]));
    }
}

class Product {
    constructor(instance, product) {
        if (!utils.is.object(product)) {
            return;
        }

        this.id = product.id;
        this.title = product.title;
        this.description = product.description;
        this.sku = product.sku;

        this.currency_code = product.currency_code;
        this.currency_symbol = product.currency_symbol;
        this.price = product.price;
        this.regular_price = product.regular_price;
        this.price_formatted = product.price_formatted;
        this.regular_price_formatted = product.regular_price_formatted;

        this.quantity = product.quantity;
        this.quantity_available = product.quantity_available;

        // Product URLs
        if (utils.is.object(product.urls)) {
            this.urls = new ProductUrls(product.urls);
        }

        // Media (Video, YouTube, Vimeo, Audio)
        if (utils.is.object(product.media)) {
            this.media = new ProductMedia(product.media);
        }

        // Images
        if (utils.is.array(product.images)) {
            this.images = product.images.map(image => new ProductImage(image));
        }

        // Files for digital products
        if (utils.is.array(product.download_files)) {
            this.files = product.download_files.map(file => new ProductFile(file));
        }

        // Variants
        if (utils.is.array(product.variants)) {
            this.variants = product.variants.map(variant => new ProductVariant(variant));
        }
        if (utils.is.array(product.variant_attributes)) {
            this.variant_attributes = product.variant_attributes.map(attribute => new ProductVariantAttribute(attribute));
        }

        this.cards_enabled = product.cards_enabled;
        this.extra_cards_enabled = product.extra_cards_enabled;
        this.paypal_enabled = product.pay_pal_enabled;

        this.display_sku = product.display_sku;
        this.display_quantity = product.display_quantity;
        this.display_powered_by = product.display_powered_by;

        this.created_by = product.created_by;
        this.created_time = product.created_time;
        this.updated_by = product.updated_by;
        this.updated_time = product.updated_time;

        client = instance;
    }

    // eslint-disable-next-line camelcase
    get featured_image() {
        return this.images.find(image => image.featured);
    }

    // eslint-disable-next-line camelcase
    get is_sold_out() {
        return this.quantity_available === 0;
    }

    buy(discount, colors) {
        let url = this.urls.checkout;

        if (utils.is.string(discount)) {
            url = utils.addUrlQuery.call(url, 'code', discount);
        }

        client.modal.open(url, utils.is.object(colors) ? colors : client.config.colors);
    }

    view(discount, colors) {
        let url = this.urls.full;

        if (utils.is.string(discount)) {
            url = utils.addUrlQuery.call(url, 'code', discount);
        }

        client.modal.open(url, utils.is.object(colors) ? colors : client.config.colors);
    }
}

export default Product;
