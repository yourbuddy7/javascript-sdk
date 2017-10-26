/* global SelzClient */
const c = new SelzClient({ domain: 'local.selz.com' });
const output = document.querySelector('pre');

function log(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    output.appendChild(div);
}

log(SelzClient.version());

const p = c.getProduct('http://selz.co/1rvb96h');

p.then(json => log(JSON.stringify(json, null, 4))).catch(error => log(error));
