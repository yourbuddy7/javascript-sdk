import ProductVariantAttributeOption from './ProductVariantAttributeOption';

export default class ProductVariantAttribute {
    constructor(variant) {
        // Take all properties by default
        Object.assign(this, variant);

        // Map options
        this.options = Object.keys(variant.options).map(
            id => new ProductVariantAttributeOption(id, variant.options[id]),
        );
    }
}
