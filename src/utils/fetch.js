// ==========================================================================
// Fetch
// ==========================================================================

import buildFormData from './form-data';
import { extend, parseJSON } from './objects';

const defaults = {
    type: 'GET',
    body: {},
    responseType: 'json',
};

/**
 * Custom immitation fetch using XHR
 * @param {string} url - The URL of the endpoint
 * @param {object} options - Object of options for the request
 */
export default function(url, options = {}) {
    const { type, body, responseType } = extend({}, defaults, options);

    return new Promise((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();

            // Check for CORS support
            if (!('withCredentials' in xhr)) {
                const error = new Error('No CORS support');
                error.request = xhr;
                throw error;
            }

            // Handle failures
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
            const fail = () => {
                const error = new Error(xhr.status);
                error.request = xhr;
                reject(error);
            };

            // Successfully made the request
            xhr.addEventListener('load', () => {
                const { response } = xhr;

                // Something went wrong either with the request or server
                if (xhr.status >= 400) {
                    fail();
                    return;
                }

                // Parse JSON responses
                if (responseType === 'json') {
                    parseJSON(response)
                        .then(json => {
                            if (json.success) {
                                resolve(json.data);
                            } else {
                                const error = new Error('Request failed');
                                error.errors = json.errors;
                                reject(error);
                            }
                        })
                        .catch(reject);
                } else {
                    resolve(response);
                }
            });

            // Request failed
            xhr.addEventListener('error', fail);

            // Start the request
            xhr.open(type, url, true);

            // Set the required response type
            // 'json' responseType is much slower, so we parse later
            // https://github.com/arendjr/fetch-vs-xhr-perf
            if (responseType !== 'json') {
                xhr.responseType = responseType;
            }

            // Send data if passed
            xhr.send(buildFormData(body));
        } catch (error) {
            reject(error);
        }
    });
}
