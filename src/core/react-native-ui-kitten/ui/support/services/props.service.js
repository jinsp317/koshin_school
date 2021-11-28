var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/**
 * Retrieves all props included in `from` array
 *
 * @param source (Props) - source object
 * @param from (string[]) - array of keys needed to retrieve from `source`
 *
 * @return (Partial<Props>) - object with keys contained in `from` array
 */
export function all(source, from) {
    if (!source) {
        return {};
    }
    return from.reduce((acc, prop) => {
        return Object.assign({}, acc, { [prop]: source[prop] });
    }, {});
}
/**
 * Retrieves all props included in `from` array, rest props includes in under the `rest` key
 */
export function allWithRest(source, from) {
    if (!source) {
        return { rest: {} };
    }
    return Object.keys(source).reduce((acc, prop) => {
        const { rest } = acc, allOf = __rest(acc, ["rest"]);
        if (from.includes(prop)) {
            return Object.assign({}, allOf, { [prop]: source[prop], rest });
        }
        return Object.assign({}, allOf, { rest: Object.assign({}, rest, { [prop]: source[prop] }) });
    }, {});
}
