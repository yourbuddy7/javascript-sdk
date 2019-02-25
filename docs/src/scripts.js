import Client, { CartAddItem } from '../../src/client';

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');

    function log(label, data) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.innerHTML = label;
        details.appendChild(summary);

        const contents = document.createElement('div');
        const pre = document.createElement('pre');
        pre.classList.add('prettyprint');
        pre.innerHTML = JSON.stringify(data, null, 4);
        contents.appendChild(pre);
        details.appendChild(contents);

        output.appendChild(details);

        window.prettyPrint();
    }

    function fail(label, error) {
        if (error instanceof Error) {
            log(`${label} (error)`, {
                error: error.toString(),
                detail: error.errors,
            });

            return;
        }

        log(`${label} (failed)`, error);
    }

    const client = new Client({
        store: 'local.sampotts.me',
        env: 'local-selz.com',
    });

    // Expose
    window.client = client;

    log('Client', client);

    function getCart(currency) {
        return new Promise((resolve, reject) => {
            if (window.cart) {
                resolve(window.cart);
                return;
            }

            client
                .getCart(currency)
                .then(cart => {
                    log('Get cart', cart);

                    window.cart = cart;

                    resolve(cart);
                })
                .catch(error => reject(error));
        });
    }

    function addToCart(product) {
        getCart(product.currencyCode)
            .then(cart => {
                const cartItem = new CartAddItem(product);
                cartItem.quantity = 2;

                cart.add(cartItem)
                    .then(updatedCart => {
                        log('Add to cart', updatedCart);

                        window.cart = updatedCart;
                    })
                    .catch(error => fail('Add to cart', error));
            })
            .catch(error => fail('Get cart', error));
    }

    const products = {
        GBP: 'http://selz.co/1MaSYRU',
        USD: 'http://selz.co/1rvbhT6',
    };

    client
        .getProduct(products.USD)
        .then(product => {
            log('Product', product);

            // Expose
            window.product = product;

            addToCart(product);
        })
        .catch(errors => fail('Product', errors));

    // Listen for messages from parent
    /* window.addEventListener('message', event => {
        // console.warn(event.data);
        const json = JSON.parse(event.data);

        if (json.key !== 'add-to-cart') {
            return;
        }

        addToCart(json.data);
    }); */
});
