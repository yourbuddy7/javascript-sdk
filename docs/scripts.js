document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');

    function log(label, json) {
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
        get key() {
            return 'carts';
        },
        get(currency) {
            let store = window.localStorage.getItem(this.key);

            if (store === null) {
                if (typeof currency !== 'string' || !currency.length) {
                    return {};
                }

                return {};
            }

            store = JSON.parse(store);

            if (typeof currency !== 'string') {
                return store;
            }

            const key = currency.toLowerCase();

            if (key in store) {
                return store[key];
            }

            return {};
        },
        set(currency, id) {
            const store = storage.get();
            const key = currency.toLowerCase();
            store[key] = id;
            window.localStorage.setItem(this.key, JSON.stringify(store));
        },
        remove(currency) {
            const store = storage.get();
            delete store[currency.toLowerCase()];
            window.localStorage.setItem(this.key, JSON.stringify(store));
        },
    };

    const client = new SelzClient({
        id: 13,
        env: 'local',
        colors: { buttons: { background: '#303e4c', text: '#97e66a' }, checkout: { background: '#303e4c', text: '#97e66a' } },
    });

    log('Config', client.config);

    // Listen for messages
    // window.addEventListener('message', event => console.warn(event), false);

    function getCart(product) {
        const id = storage.get(product.currency_code);

        return new Promise((resolve, reject) => {
            if (typeof id === 'string' && id.length) {
                client
                    .getCart(id)
                    .then(cart => {
                        log('Existing cart', cart);
                        resolve(cart);
                    })
                    .catch(error => reject(error));
            } else {
                client
                    .createCart(product.currency_code)
                    .then(cart => {
                        storage.set(product.currency_code, cart.id);
                        resolve(cart);
                    })
                    .catch(error => reject(error));
            }
        });
    }

    function addToCart(product) {
        getCart(product)
            .then(cart => {
                cart
                    .add({
                        id: product.id,
                        variant_id: product.variants[0].id,
                    })
                    .then(updatedCart => {
                        log('Added', updatedCart);
                        updatedCart.checkout();
                    })
                    .catch(error => fail('Added', error));
            })
            .catch(error => fail('Get cart', error));
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
