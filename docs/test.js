document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');

    function log(label, json) {
        // console.log(json);
        const details = document.createElement('details');

        const summary = document.createElement('summary');
        summary.innerHTML = label;
        details.appendChild(summary);

        const contents = document.createElement('div');
        const pre = document.createElement('pre');
        pre.classList.add('prettyprint');
        pre.innerHTML = JSON.stringify(json, null, 4);
        contents.appendChild(pre);
        details.appendChild(contents);

        output.appendChild(details);

        window.prettyPrint();
    }

    function fail(label, errors) {
        return log(`${label} (Error)`, errors);
    }

    const storage = {
        get(currency) {
            let store = window.localStorage.getItem('carts');

            if (store === null) {
                if (typeof currency !== 'string') {
                    return {};
                }

                return null;
            }

            store = JSON.parse(store);

            if (typeof currency !== 'string') {
                return store;
            }

            const key = currency.toLowerCase();

            if (key in store) {
                return store[key];
            }

            return null;
        },
        set(currency, id) {
            const store = storage.get();
            const key = currency.toLowerCase();

            store[key] = id;

            window.localStorage.setItem('carts', JSON.stringify(store));
        },
    };

    const client = new SelzClient({ id: 13, env: 'local' });

    log('Config', client.config);

    // Listen for messages
    // window.addEventListener('message', event => console.warn(event), false);

    async function addToCart(product) {
        let cartId = storage.get(product.currency_code);

        if (cartId === null) {
            await client
                .createCart(product.currency_code)
                .then(cart => {
                    cartId = cart.id;
                    storage.set(product.currency_code, cart.id);
                })
                .catch(errors => fail('Cart', errors));
        }

        client
            .addToCart(cartId, {
                id: product.id,
                variant_id: product.variants[0].id,
            })
            .then(cart => {
                log('Added', cart);
                cart.checkout();
            })
            .catch(error => fail('Added', error));
    }

    client
        .getProduct('http://selz.co/1rvbhT6')
        .then(product => {
            log('Product', product);

            addToCart(product);

            // product.buy();

            // product.view();
        })
        .catch(errors => fail('Product', errors));

    window.client = client;
});
