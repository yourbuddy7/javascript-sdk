class ProductUrls {
    constructor(urls) {
        this.full = urls.full;
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
        this.price_regular = variant.price_regular;
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
    constructor(product) {
        this.id = product.id;
        this.title = product.title;
        this.description = product.description;
        this.sku = product.sku;

        this.currency_code = product.currency_code;
        this.currency_symbol = product.currency_symbol;
        this.price = product.price;
        this.regular_price = product.regular_price;
        this.display_price = product.display_price;
        this.display_regular_price = product.display_regular_price;

        this.quantity = product.quantity;
        this.quantity_available = product.quantity_available;

        this.urls = new ProductUrls(product.urls);

        this.media = new ProductMedia(product.media);
        this.images = product.images.map(image => new ProductImage(image));

        this.files = product.download_files.map(file => new ProductFile(file));

        this.variants = product.variants.map(variant => new ProductVariant(variant));
        this.variant_attributes = product.variant_attributes.map(attribute => new ProductVariantAttribute(attribute));

        this.created_time = product.created_time;
        this.updated_time = product.updated_time;
    }

    get featured_image() {
        return this.images.find(image => image.featured);
    }

    get is_sold_out() {
        return this.quantity_available === 0;
    }
}

export default Product;
