import snakeCase from 'snakecase-keys';

/**
 * Custom fetch wrapper
 * @param {String} url - The URL of the endpoint
 * @param {Object} options - Object of options for the request
 */
function CustomFetch(url, options) {
    const defaults = {
        mode: 'cors',
        redirect: 'follow',
    };

    return new Promise((resolve, reject) => {
        fetch(url, Object.assign(defaults, options))
            .then(response => {
                response
                    .json()
                    .then(data => {
                        const json = snakeCase(data);

                        if (json.error === true) {
                            reject(json.message);
                        } else {
                            resolve(json);
                        }
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
}

export default CustomFetch;
