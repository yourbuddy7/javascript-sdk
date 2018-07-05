// ==========================================================================
// Array utils
// ==========================================================================

import is from './is';

/**
 * Remove duplicates in an array
 * @param {array} array
 */
export function dedupe(array) {
    if (!is.array(array)) {
        return array;
    }

    return array.filter((item, index) => array.indexOf(item) === index);
}

// Rounding methods for .closest()
const closestRounding = {
    none: 0,
    ceil: 1,
    floor: 2,
};
export { closestRounding };

/**
 * Get the closest value in an array
 * @param {array} array
 * @param {number} value
 * @param {number} rounding
 */
export function closest(array, value, rounding = closestRounding.none) {
    if (!is.array(array) || !array.length) {
        return null;
    }

    return array.reduce((prev, curr) => {
        if (Math.abs(curr - value) <= Math.abs(prev - value)) {
            switch (rounding) {
                case closestRounding.ceil:
                    return curr >= value ? curr : prev;

                case closestRounding.floor:
                    return curr <= value ? curr : prev;

                default:
                    return curr;
            }
        }

        return prev;
    });
}
