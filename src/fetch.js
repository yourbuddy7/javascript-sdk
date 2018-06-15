/**
 * Custom fetch wrapper
 * @param {string} url - The URL of the endpoint
 * @param {object} options - Object of options for the request
 */
const CustomFetch = (url, options) => {
    const defaults = {
        mode: 'cors',
        redirect: 'follow',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    };

    return new Promise((resolve, reject) => {
        fetch(url, Object.assign(defaults, options))
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        response
                            .json()
                            .then(json => {
                                if (json.success) {
                                    resolve(json.data);
                                } else {
                                    const error = new Error('Request failed');
                                    error.errors = json.errors;
                                    throw error;
                                }
                            })
                            .catch(reject);
                    } catch (error) {
                        throw error;
                    }
                } else {
                    const error = new Error(response.statusText || response.status);
                    error.response = response;
                    throw error;
                }
            })
            .catch(reject);
    });
};

export default CustomFetch;
