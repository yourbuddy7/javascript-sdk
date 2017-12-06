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
                cart
                    .add({
                        id: product.id,
                        quantity: 2,
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
