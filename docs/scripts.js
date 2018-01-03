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
        return log(`${label} (failed)`, errors);
    }

    const client = new SelzClient({
        id: 13,
        // domain: 'local.sampotts.me',
        env: 'local',
        colors: { buttons: { background: '#303e4c', text: '#97e66a' }, checkout: { background: '#303e4c', text: '#97e66a' } },
    });

    // window.client = client;

    log('Config', client.config);

    // Listen for messages
    // window.addEventListener('message', event => console.warn(event), false);

    function addToCart(product) {
        client
            .getCartByCurrency(product.currency_code)
            .then(cart => {
                log('Get cart', cart);

                const variant = product.variants && product.variants.length ? product.variants[0].id : null;

                cart
                    .add({
                        id: product.id,
                        quantity: 2,
                        variant_id: variant,
                    })
                    .then(updatedCart => {
                        log('Add to cart', updatedCart);
                        updatedCart.checkout();
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
        .getProduct(products.GBP)
        .then(product => {
            log('Product', product);

            window.product = product;

            addToCart(product);

            // product.buy();
            // product.view();
        })
        .catch(errors => fail('Product', errors));

    window.client = client;
});
