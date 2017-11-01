document.addEventListener('DOMContentLoaded', () => {
    /* global SelzClient */
    const client = new SelzClient({ id: 13, env: 'local' });
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
    }

    function fail(label, json) {
        return log(`${label} (Error)`, json);
    }

    log('Config', client.config);

    const p = client.getProduct('http://selz.co/1rvbhT6');
    p.then(product => log('Product', product)).catch(error => fail('Product', error));

    const c1 = client.createCart('USD');
    c1.then(cart1 => log('Cart #1', cart1)).catch(error => fail('Cart #1', error));

    const c2 = client.createCart('GBP');
    c2
        .then(cart2 => {
            log('Cart #2', cart2);

            const c3 = client.getCart(cart2.id);
            c3.then(cart3 => log('Cart #2 (GET)', cart3)).catch(error => fail('Cart #2 (GET)', error));
        })
        .catch(error => fail('Cart #2', error));
});
