// ==========================================================================
// Fetch
// ==========================================================================

/**
 * Custom fetch wrapper
 * @param {string} url - The URL of the endpoint
 * @param {object} options - Object of options for the request
 */
export default function(url, options) {
    const defaults = {
        mode: 'cors',
        redirect: 'follow',
    };

    return new Promise((resolve, reject) => {
        const request = new Request(url, Object.assign(defaults, options));
        request.headers.append('Accept', 'application/json');

        fetch(request)
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
                    const error = new Error(response.status);
                    error.response = response;
                    throw error;
                }
            })
            .catch(reject);
    });
}
