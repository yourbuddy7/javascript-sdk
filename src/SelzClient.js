import config from './config';
import utils from './utils';

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
                        .then(json => resolve(utils.deserializer(json)))
                        .catch(reject);
                })
                .catch(reject);
        });
    }
}

export default SelzClient;
