import is from '../../utils/is';
import ProductFile from './ProductFile';
import ProductImage from './ProductImage';
import ProductMedia from './ProductMedia';
import ProductUrls from './ProductUrls';
import ProductVariant from './ProductVariant';
import ProductVariantAttribute from './ProductVariantAttribute';

let client = null;

export default class Product {
    constructor(instance, product, variantId = '') {
        if (!is.object(product)) {
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
        if (product.hasVariants) {
            const selected = !is.empty(variantId) ? variantId : product.variants[0].id;
            this.variants = product.variants.map(variant => new ProductVariant(variant, selected));
        }
        if (product.hasVariantAttributes) {
            this.variantAttributes = product.variantAttributes.map(attribute => new ProductVariantAttribute(attribute));
        }
    }

    get selectedVariant() {
        if (is.empty(this.variants)) {
            return null;
        }

        return this.variants.find(variant => variant.selected);
    }
}
