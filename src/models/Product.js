import is from '../utils/is';

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
        // Take all properties by default
        Object.assign(this, file);
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
        this.options = Object.keys(variant.options).map(
            id => new ProductVariantAttributeOption(id, variant.options[id]),
        );
    }
}

class Product {
    constructor(instance, product, variantId = '') {
        if (!is.object(product) && !is.product(product)) {
            return;
        }

        client = instance;

        // Take all properties by default
        Object.assign(this, product);

        // Map store
        this.store = client.store;

        // Product URLs
        if (is.object(product.urls)) {
            this.urls = new ProductUrls(product.urls);
        }

        // Media (Video, YouTube, Vimeo, Audio)
        if (is.object(product.media)) {
            this.media = new ProductMedia(product.media);
        }

        // Images
        if (is.array(product.images)) {
            this.images = product.images.map(image => new ProductImage(image));
        }

        // Files for digital products
        if (is.array(product.files)) {
            this.files = product.files.map(file => new ProductFile(file));
        }

        // Variants
        if (product.has_variants) {
            const selected = !is.empty(variantId) ? variantId : product.variants[0].id;
            this.variants = product.variants.map(variant => new ProductVariant(variant, selected));
        }
        if (product.has_variant_attributes) {
            this.variant_attributes = product.variant_attributes.map(
                attribute => new ProductVariantAttribute(attribute),
            );
        }
    }

    // eslint-disable-next-line camelcase
    get selected_variant() {
        if (is.empty(this.variants)) {
            return null;
        }

        return this.variants.find(variant => variant.selected);
    }
}

export default Product;
