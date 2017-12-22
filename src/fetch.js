/**
 * Custom fetch wrapper
 * @param {string} url - The URL of the endpoint
 * @param {object} options - Object of options for the request
 */
const CustomFetch = (url, options) => {
    const defaults = {
        mode: 'cors',
        redirect: 'follow',
    };

    return new Promise((resolve, reject) => {
        fetch(url, Object.assign(defaults, options))
            .then(response => {
                response
                    .json()
                    .then(json => {
                        if (json.success) {
                            resolve(json.data);
                        } else {
                            reject(json.errors);
                        }
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};

export default CustomFetch;
