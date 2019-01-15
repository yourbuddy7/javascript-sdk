// ==========================================================================
// Type checking
// ==========================================================================

import Product from '../models/Product';

const getConstructor = input => (input !== null && typeof input !== 'undefined' ? input.constructor : null);
const instanceOf = (input, constructor) => Boolean(input && constructor && input instanceof constructor);
const isArray = input => Array.isArray(input);
const isObject = input => getConstructor(input) === Object;
const isNumber = input => getConstructor(input) === Number && !Number.isNaN(input);
const isString = input => getConstructor(input) === String;
const isBoolean = input => getConstructor(input) === Boolean;
const isFunction = input => getConstructor(input) === Function;
const isNullOrUndefined = input => input === null || typeof input === 'undefined';
const isObjectId = input => isString(input) && /^[a-f\d]{24}$/i.test(input);
const isCurrencyCode = input => isString(input) && /^[A-z]{3}$/.test(input);
const isProduct = input => getConstructor(input) === Product && Object.keys(input).length > 0;

const isEmpty = input =>
    isNullOrUndefined(input) ||
    ((isString(input) || isArray(input)) && !input.length) ||
    (isObject(input) && !Object.keys(input).length);

const isUrl = (input, strict = false) => {
    // Accept a URL object
    if (instanceOf(input, window.URL)) {
        return true;
    }

    // Add the protocol if required
    let string = input;
    if (!strict && !/^https?:\/\/*/.test(input)) {
        string = `http://${input}`;
    }

    try {
        return !isEmpty(new URL(string).hostname);
    } catch (e) {
        return false;
    }
};

const is = {
    array: isArray,
    object: isObject,
    number: isNumber,
    string: isString,
    boolean: isBoolean,
    function: isFunction,
    nullOrUndefined: isNullOrUndefined,
    objectId: isObjectId,
    currencyCode: isCurrencyCode,
    product: isProduct,
    url: isUrl,
    empty: isEmpty,
};

export default is;
