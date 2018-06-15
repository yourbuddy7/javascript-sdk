import pascalCase from 'pascalcase-keys';
import fetch from './fetch';
import utils from './utils';

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

            // Remove from queue on completed
            queue[url].finally(() => {
                delete queue[url];
            });
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
        if (utils.is.object(data)) {
            options.body = utils.buildFormData(pascalCase(data));
        }

        return fetch(url, options);
    },
};

export default http;
