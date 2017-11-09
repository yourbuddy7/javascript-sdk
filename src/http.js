import pascalCase from 'pascalcase-keys';

import CustomFetch from './fetch';
import utils from './utils';

const http = {
    /**
     * GET remote URL and parse as JSON
     * @param {String} url - The endpoint URL
     */
    get(url) {
        return new CustomFetch(url);
    },

    /**
     * POST to remote URL and parse as JSON
     * @param {String} url - The endpoint URL
     * @param {Object} data - The POST data payload
     */
    post(url, data) {
        const options = {
            method: 'POST',
        };

        // Convert POST data to FormData for C#
        if (utils.is.object(data)) {
            options.body = utils.buildFormData(pascalCase(data));
        }

        return new CustomFetch(url, options);
    },
};

export default http;
