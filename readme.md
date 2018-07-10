---
Beware: The SDK is currently in beta and not production-ready
---

# Selz JavaScript SDK

The Selz JavaScript SDK is a lightweight (10k gzipped) library to allow you to build ecommerce into any web application. You can query for product information and manage shopping carts.

It is assumed you have reasonable knowledge of JavaScript to use this library.

## Getting started

Using NPM:

```
npm install selz-js-sdk
```

or using our CDN:

```html
<script src="https://sdk.selzstatic.com/0.1.47/client.js"></script>
```

Or if you want a polyfilled version:

```html
<script src="https://sdk.selzstatic.com/0.1.47/client.polyfilled.js"></script>
```

## Creating a client

If you're using the module then you'll need to import the client

```javascript
import { SelzClient } from 'selz-js-sdk';
```

```javascript
const client = new SelzClient({
    store: 12345,
});
```

### Options

| Property | Type                 | Default | Required  | Description                                                                                                        |
| -------- | -------------------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `store`  | `Number` or `String` | `-1`    | Yes&sup1; | The store ID (e.g. `123456`) _or_ a URL in the store (e.g. `store.selz.com` or `mystore.com` or `selz.co/1a2b3c`). |

1.  A store ID is preferred and is faster.

## Products

### Get products list

First argument (optional) is a search term, second argument is the page (starting at 1). Products are returned 50 per page.

```javascript
client
    .getProducts('Tee', 1)
    .then(products => {
        console.log('Products', products);
    })
    .catch(errors => console.error('Error getting products', errors));
```

### Get single product data

```javascript
client
    .getProduct('http://selz.co/1rvbhT6')
    .then(product => {
        console.log('Product', product);
    })
    .catch(errors => console.error('Error getting product', errors));
```

### Display a product modal

TBD

### Buy a product

TBD

## Carts

### Get all carts

```javascript
client
    .getCarts()
    .then(carts => {
        console.log('Carts', carts);
    })
    .catch(errors => console.error('Error getting carts', errors));
```

### Get active cart

The cart that has the last interaction (added to or removed from).

```javascript
client
    .getActiveCart(true)
    .then(cart => {
        console.log('Cart', cart);
    })
    .catch(errors => console.error('Error getting active cart', errors));
```

If you don't want to fetch the whole cart, you can pass an bool argument of `false` to just return the basic cart details which will be faster.

### Getting a cart by currency

_Note:_ If you try to get a cart by currency code and it doesn't exist, we'll create one for you anyway.

```javascript
client
    .getCartByCurrency('USD')
    .then(cart => {
        console.log('Cart', cart);
    })
    .catch(errors => console.error('Error getting cart', errors));
```

### Getting a cart by ID

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
cart.add({
    id: product.id,
    quantity: 3,
    variant_id: product.variants[0].id,
})
    .then(updatedCart => {
        console.log('Added', updatedCart);
    })
    .catch(errors => console.error('Error adding to cart', errors));
```

### Update cart item quantity

There are two ways to update the quantity of an item in the shopping cart. Firstly, using the method:

```javascript
client
    .updateCartItemQuantity(cart.id, cartItem.index, 2)
    .then(updatedCart => {
        console.log('Updated', updatedCart);
    })
    .catch(errors => console.error('Error updating quantity', errors));
```

...or the easier option using a simple setter on the `CartItem` itself:

```javascript
cart.items.find(i => i.product.id === '544de566b7987209f0406100').quantity = 2;
```

### Remove from a cart

```javascript
cart.remove(cartItem.index)
    .then(updatedCart => {
        console.log('Removed', updatedCart);
    })
    .catch(errors => console.error('Error removing from cart', errors));
```

### Set active cart

If you're building your own UI and wish to set the last active cart (for when you want to call `.getActiveCart` later). The argument passed can be either a card ID or a currency code.

```javascript
client
    .setActiveCart('USD')
    .then(cart => {
        console.log('Set active cart', cart);
    })
    .catch(errors => console.error('Error setting active cart', errors));
```

### Checkout

TBD
