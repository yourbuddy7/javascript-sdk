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

    async function addToCart(product) {
        const id = storage.get(product.currency_code);
        let cart = null;

        if (typeof id === 'string' && id.length) {
            await client
                .getCart(id)
                .then(c => {
                    cart = c;
                    log('Cart', cart);
                })
                .catch(errors => fail('Get cart', errors));
        }

        if (cart === null) {
            await client
                .createCart(product.currency_code)
                .then(c => {
                    cart = c;
                    storage.set(product.currency_code, cart.id);
                    log('Cart', cart);
                })
                .catch(errors => fail('Create cart', errors));
        }

        cart
            .add({
                id: product.id,
                variant_id: product.variants[0].id,
            })
            .then(c => {
                cart = c;
                log('Added', cart);
                cart.checkout();

                // const item = cart.items.find(i => i.product.id === product.id && i.variant_id === product.variants[0].id);

                // console.warn(cart.items);
                // console.warn('index', item.index);

                /* cart
                    .remove(item.index)
                    .then(updatedCart => {
                        log('Removed', updatedCart);

                        if (Object.keys(updatedCart).length) {
                            updatedCart.checkout();
                        } else {
                            storage.remove(cart.currency_code);
                        }
                    })
                    .catch(error => fail('Removed', error)); */
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
