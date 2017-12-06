---
Beware: The SDK is currently in beta and not production-ready
---

# Selz JavaScript SDK

The Selz JavaScript SDK is a lightweight library to allow you to build ecommerce into any web application. You can query for product information, manage
shopping carts, and checkout.

It is assumed you have knowledge of JavaScript to use this library.

## Getting started

Using NPM:

```
npm install selz-js-sdk
```

or using our CDN:

```html
<script src="https://sdk.selzstatic.com/0.1.3/client.umd.polyfilled.js"></script>
```

## Creating a client

```javascript
const client = new SelzClient({ id: 13, env: 'local' });
```

### Options

```javascript
{
    env: '', // The environment - e.g. local, develop, release (this is for development only)
    domain: '', // The store domain (if the user is not known) - e.g. local.sampotts.me
    id: -1, // The user ID for the store - e.g. 13
    colors: {}, // Colors object for the modal
}
```

## Products

### `getProduct` - Get product data

```javascript
client
    .getProduct('http://selz.co/1rvbhT6')
    .then(product => {
        console.log('Product', product);
    })
    .catch(errors => console.error('Error getting product', errors));
```

### `product.view()` Display a product modal

```javascript
product.view(colors);
```

### `product.buy()` Buy a product

This will create a temporary cart and add the product to it, ready for checkout

```javascript
product.buy(colors);
```

## Carts

### Getting a cart

_Note:_ If you try to get a cart by currency code and it doesn't exist, we'll create one for you anyway.

```javascript
client
    .getCartByCurrency('USD')
    .then(cart => {
        console.log('Cart', cart);
    })
    .catch(errors => console.error('Error getting cart', errors));
```

You can also fetch by ObjectId (`cart.id`)...

```javascript
client
    .getCartById(id)
    .then(cart => {
        console.log('Cart', cart);
    })
    .catch(errors => console.error('Error getting cart', errors));
```

### Creating a cart

You can also manually create a cart yourself but you shouldn't need to in the majority of cases.

```javascript
client
    .createCart('USD')
    .then(cart => {
        console.log('Cart', cart);
    })
    .catch(errors => console.error('Error creating cart', errors));
```

### Add to a cart

```javascript
cart
    .add({
        id: product.id,
        quantity: 3,
        variant_id: product.variants[0].id,
    })
    .then(updatedCart => {
        console.log('Added', updatedCart);
    })
    .catch(errors => console.error('Error adding to cart', errors));
```

### Remove from a cart

```javascript
cart
    .remove(cartItem.index)
    .then(updatedCart => {
        console.log('Removed', updatedCart);
    })
    .catch(errors => console.error('Error removing from cart', errors));
```

### Checkout

This will launch the modal

```javascript
cart.checkout(colors);
```
