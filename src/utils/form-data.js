// ==========================================================================
// Form Data utils
// ==========================================================================

import is from './is';
import { toPascalCase } from './strings';

/**
 * Convert an Object to FormData
 * @param {object} source - source Object
 * @param {formdata} form - existing FormData object
 * @param {string} namespace - namespace for FormData
 */
const buildFormData = (source, form, namespace) => {
    const data = form || new FormData();
    let formKey;

    // Source must be an object
    if (!is.object(source)) {
        return data;
    }

    // Loop through the object to convert
    Object.keys(source).forEach(key => {
        if (namespace) {
            formKey = `${namespace}[${key}]`;
        } else {
            formKey = key;
        }

        // If the property is an object, but not a File, use recursivity
        if (typeof source[key] === 'object' && !(source[key] instanceof File)) {
            buildFormData(source[key], data, key);
        } else {
            data.append(toPascalCase(formKey), source[key]);
        }
    });

    return data;
};

export default buildFormData;
