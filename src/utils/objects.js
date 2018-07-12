// ==========================================================================
// Extend objects
// ==========================================================================

import is from './is';

/**
 * Deep extend destination object with N more objects
 * @param {Object} target
 * @param {...Object} sources
 */
export function extend(target = {}, ...sources) {
    if (!sources.length) {
        return target;
    }

    const source = sources.shift();

    if (!is.object(source)) {
        return target;
    }

    Object.keys(source).forEach(key => {
        if (is.object(source[key])) {
            if (!Object.keys(target).includes(key)) {
                Object.assign(target, { [key]: {} });
            }

            extend(target[key], source[key]);
        } else {
            Object.assign(target, { [key]: source[key] });
        }
    });

    return extend(target, ...sources);
}

/**
 * Safer JSON parsing
 * @param {Object} data
 */
export function parseJSON(data = {}) {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(data));
        } catch (error) {
            reject(error);
        }
    });
}
