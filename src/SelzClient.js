import config from './config';

class SelzClient {
    constructor() {
        this.test = 'test';
        this.built = false;
    }

    build() {
        this.built = true;
    }

    getProduct(url) {
        if (!this.built) {
            return;
        }

        console.warn('Loading...');

        fetch(config.urls.product(url))
            .then(response => {
                response
                    .json()
                    .then(json => console.warn(json))
                    .catch(error => {
                        console.error('Failed to de-serialize response', error);
                    });
            })
            .catch(e => {
                console.error(e);
            });
    }
}

const c = new SelzClient();

c.build();

c.getProduct('http://selz.co/1rvb96h');
