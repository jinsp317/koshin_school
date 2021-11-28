import { getThemeValue } from '../theme/theme.service';
export function createThemedStyle(mapping, theme) {
    return Object.keys(mapping).reduce((acc, current) => {
        const mappingValue = mapping[current];
        return Object.assign({}, acc, { [current]: getThemeValue(mappingValue, theme, mappingValue) });
    }, {});
}
