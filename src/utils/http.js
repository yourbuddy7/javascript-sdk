// ==========================================================================
// Common fetch actions
// ==========================================================================

import fetch from './fetch';
import buildFormData from './form-data';
import is from './is';

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
    post(url, data) {
        const options = {
            method: 'POST',
        };

        // Convert POST data to FormData for C#
        if (is.object(data)) {
            options.body = buildFormData(data);
        }

        return fetch(url, options);
    },
};

export default http;
