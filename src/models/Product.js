import utils from './../utils';

let client = null;

class ProductUrls {
    constructor(urls) {
        // Take all properties by default
        Object.assign(this, urls);
    }
}

class ProductImage {
    constructor(image) {
        // Take all properties by default
        Object.assign(this, image);
    }
}

class ProductMedia {
    constructor(media) {
        // Take all properties by default
        Object.assign(this, media);

        // Map cover image
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
    constructor(variant, selected = '') {
        // Take all properties by default
        Object.assign(this, variant);

        this.selected = variant.id === selected;
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
        // Take all properties by default
        Object.assign(this, variant);

        // Map options
        this.options = Object.keys(variant.options).map(id => new ProductVariantAttributeOption(id, variant.options[id]));
    }
}

class Product {
    constructor(instance, product, variantId = '') {
        if (!utils.is.object(product)) {
            return;
        }

        // Take all properties by default
        Object.assign(this, product);

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
        if (utils.is.array(product.variants) && product.variants.length) {
            const selected = !utils.is.empty(variantId) ? variantId : product.variants[0].id;
            this.variants = product.variants.map(variant => new ProductVariant(variant, selected));
        }
        if (utils.is.array(product.variant_attributes) && product.variant_attributes.length) {
            this.variant_attributes = product.variant_attributes.map(attribute => new ProductVariantAttribute(attribute));
        }

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

    // eslint-disable-next-line camelcase
    get selected_variant() {
        if (utils.is.empty(this.variants)) {
            return null;
        }

        return this.variants.find(variant => variant.selected);
    }

    /**
     * View product in modal
     * @param {string} discount - Discount code for the product
     * @param {object} colors - Colors object for the modal
     */
    view(discount, colors) {
        let url = this.urls.full;

        if (utils.is.string(discount)) {
            url = utils.addUrlQuery.call(url, 'code', discount);
        }

        client.modal.open(url, Object.assign(client.config.colors, colors));
    }

    /**
     * Buy product
     * @param {string} [discount] - Discount code for the product
     * @param {object} colors - Colors object for the modal
     */
    buy(discount, colors) {
        let url = this.urls.checkout;

        if (utils.is.string(discount)) {
            url = utils.addUrlQuery.call(url, 'code', discount);
        }

        client.modal.open(url, Object.assign(client.config.colors, colors));
    }
}

export default Product;
