# Selz JavaScript SDK

The Selz JavaScript SDK is a lightweight JavaScript library to allow you to build ecommerce into any web application. You can query for product information, manage shopping carts, and checkout.

It is assumed you have knowledge of JavaScript to use this library.

## Getting started

Using NPM:

```
npm install selz-js-sdk
```

or using our CDN:

```html
<script src="https://js.selzstatic.com/1.0.0/sdk.umd.polyfilled.js"></script>
```

## Creating a client

```javascript
const client = new SelzClient({ id: 13, env: 'local' });
```

## Get product data

```javascript
const product = null;
client
    .getProduct('http://selz.co/1rvbhT6')
    .then(p => {
        product = p;
        console.log('Product', product);
    })
    .catch(errors => console.error('Error getting product', errors));
```

*Note:* Use async/await if you need to wait for the product info

## Create a cart

```javascript
const cart = null;
client
    .createCart(product.currency_code)
    .then(c => {
        cart = c;
        // It's recommended to store the cart ID for the seller/currency
        // in local storage for next time the user visits the page
        console.log('Cart', cart);
    })
    .catch(errors => console.error('Error creating cart', errors));
```

*Note:* Use async/await if you need to wait for the cart to be created

## Add to a cart

```javascript
cart
    .add({
        id: product.id,
        variant_id: product.variants[0].id,
    })
    .then(c => {
        cart = c;
        console.log('Added', cart);
    })
    .catch(errors => console.error('Error adding to cart', errors));
```

## Remove from a cart

```javascript
cart
    .remove(item.index)
    .then(c => {
        cart = c;
        console.log('Removed', cart);
    })
    .catch(errors => console.error('Error removing from cart', errors));
```

## Checkout

```javascript
cart.checkout();
```