"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Safely retrieves R value of T object with reducer
 *
 * @param value (T | undefined) - unsafe object which should be processed
 * @param reducer ((T) => R) - `value` processing lambda. Called if `value` is not `undefined`
 *
 * @return (R | undefined) - object returned by `reducer` if `value` is not `undefined`, `undefined` otherwise
 **/
function safe(value, reducer) {
    if (value) {
        return reducer(value);
    }
    return undefined;
}
exports.safe = safe;
/**
 * Maps 2-dim array to 1-dim
 *
 * @param params (T[][]) - 2-dim array
 *
 * @return 1-dim array
 */
function flatten(params) {
    return [].concat(...params);
}
exports.flatten = flatten;
/**
 * Removes all duplicates from array
 *
 * @param params (T[]) - array with possible duplicate values
 *
 * @return (T[]) - processed array
 */
function noDuplicates(params) {
    return [...new Set(params)];
}
exports.noDuplicates = noDuplicates;
/**
 * Removes null and undefined values from array
 *
 * @param params (T[]) - array with possible null values
 *
 * @return (T[]) - processed array
 */
function noNulls(params) {
    return params.filter(Boolean);
}
exports.noNulls = noNulls;
/**
 * Returns Object with string keys from array type [string, IndexSignatureBase]
 *
 * @param array like [string, IndexSignatureBase]
 *
 * @return object with string keys and IndexSignatureBase values
 */
function toObject(array) {
    return array.reduce((p, c) => {
        if (p && p.hasOwnProperty(c[0])) {
            p[c[0]] = Object.assign({}, p[c[0]], c[1]);
        }
        else {
            p[c[0]] = c[1];
        }
        return p;
    }, {});
}
exports.toObject = toObject;
//# sourceMappingURL=common.service.js.map