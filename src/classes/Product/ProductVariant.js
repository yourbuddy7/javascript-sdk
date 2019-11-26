export default class ProductVariant {
    constructor(variant, selected = '') {
        // Take all properties by default
        Object.assign(this, variant);

        this.selected = variant.id === selected;
    }
}
