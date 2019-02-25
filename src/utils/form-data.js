// ==========================================================================
// Form Data utils
// ==========================================================================

import is from './is';
import { cloneDeep } from './objects';
import { toPascalCase } from './strings';

/**
 * Convert an Object to FormData
 * @param {Object} source - source Object
 * @param {FormData} form - existing FormData object
 * @param {String} namespace - namespace for FormData
 */
const buildFormData = (source = {}, form, namespace) => {
    const formData = form || new FormData();
    let formKey;
    let data = null;

    // Parse as an object
    try {
        data = cloneDeep(source);
    } catch (error) {
        return formData;
    }

    // Source must be an object
    if (!is.object(data)) {
        return formData;
    }

    // Loop through the object to convert
    Object.keys(data).forEach(key => {
        if (namespace) {
            formKey = `${namespace}[${key}]`;
        } else {
            formKey = key;
        }

        // If the property is an object, but not a File, use recursivity
        if (typeof source[key] === 'object' && !(source[key] instanceof File)) {
            buildFormData(source[key], formData, key);
        } else {
            formData.append(toPascalCase(formKey), source[key]);
        }
    });

    return formData;
};

export default buildFormData;
