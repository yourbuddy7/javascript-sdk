import config from './config';

class SelzClient {
    constructor(props) {
        this.config = Object.assign(
            {
                domain: 'selz.com',
            },
            props,
        );
    }

    static version() {
        return '0.1.0';
    }

    getProduct(url) {
        return new Promise((resolve, reject) => {
            fetch(config.urls.product(this.config.domain, url))
                .then(response => {
                    response
                        .json()
                        .then(json => resolve(json))
                        .catch(reject);
                })
                .catch(reject);
        });
    }
}

// Testing
const c = new SelzClient({ domain: 'local.selz.com' });
console.warn(SelzClient.version());
const p = c.getProduct('http://selz.co/1rvb96h');
p.then(json => console.log(json)).catch(error => console.error(error));
