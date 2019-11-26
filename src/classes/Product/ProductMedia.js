import ProductImage from './ProductImage';

export default class ProductMedia {
    constructor(media) {
        // Take all properties by default
        Object.assign(this, media);

        // Map cover image
        this.cover = new ProductImage(media.cover);
    }
}
