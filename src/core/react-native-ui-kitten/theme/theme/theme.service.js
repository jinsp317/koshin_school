const SYMBOL_REFERENCE = '$';
/**
 * @param name: string - theme property name, like `backgroundColor`
 * @param theme: ThemeType - theme
 * @param fallback: any - fallback value
 *
 * @return any. Theme property value if it presents in theme, fallback otherwise
 */
export function getThemeValue(name, theme, fallback) {
    if (isReferenceKey(name)) {
        const themeKey = toThemeKey(name);
        return findThemeValue(themeKey, theme) || fallback;
    }
    return findThemeValue(name, theme) || fallback;
}
function findThemeValue(name, theme) {
    const value = theme[name];
    if (isReferenceKey(value)) {
        const themeKey = toThemeKey(value);
        return findThemeValue(themeKey, theme);
    }
    return value;
}
/**
 * @returns true if theme value references to another
 */
function isReferenceKey(value) {
    return `${value}`.startsWith(SYMBOL_REFERENCE);
}
/**
 * Transforms reference key to theme key
 */
function toThemeKey(value) {
    return `${value}`.substring(1);
}
