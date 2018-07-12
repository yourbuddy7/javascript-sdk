// ==========================================================================
// Common fetch actions
// ==========================================================================

import fetch from './fetch';

const queue = {};

const http = {
    /**
     * GET remote URL and parse as JSON
     * @param {string} url - The endpoint URL
     */
    get(url) {
        // Queue requests to prevent hammering
        if (!Object.keys(queue).includes(url)) {
            queue[url] = fetch(url);

            const remove = () => {
                delete queue[url];
            };

            // Remove from queue on completed
            queue[url].then(remove).catch(remove);
        }

        return queue[url];
    },

    /**
     * POST to remote URL and parse as JSON
     * @param {string} url - The endpoint URL
     * @param {object} data - The POST data payload
     */
    post(url, data = {}) {
        const options = {
            type: 'POST',
            body: data,
        };

        return fetch(url, options);
    },
};

export default http;
