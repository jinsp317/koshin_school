"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const mapping_1 = require("../mapping");
exports.SEPARATOR_MAPPING_ENTRY = '.';
/**
 * Creates style object for variant/list of variants(optional) and its state/list of states(optional)
 *
 * Example
 *
 * appearance = 'outline';
 * variants = ['success', 'large'];
 * state = ['active', 'checked'];
 *
 * a = `default` + `outline`                    - acc appearance (apce) mapping
 *
 * v1 = `success` of `default`                  - `success` variant mapping of `default` apce
 * v2 = `success` of `outline`                  - `success` variant mapping of `outline` apce
 * v3 = `large` of `default`                    - `large` variant mapping of `default` apce
 * v4 = `large` of `outline`                    - `large` variant mapping of `outline` apce
 *
 * s1 = `active` of `default`                   - `active` state mapping of `default` apce
 * s2 = `active` of `outline`                   - `active` state mapping of `outline` apce
 * s3 = `active` of `default success`           - `active` state mapping of `success` variant of `default` apce
 * s4 = `active` of `outline success`           - `active` state mapping of `success` variant of `outline` apce
 * s5 = `active` of `default large`             - `active` state mapping of `large` variant of `default` apce
 * s6 = `active` of `outline large`             - `active` state mapping of `large` variant of `outline` apce
 *
 * s7 = `checked` of `default`                  - `checked` state mapping of `default` apce
 * s8 = `checked` of `outline`                  - `checked` state mapping of `outline` apce
 * s9 = `checked` of `default success`          - `checked` state mapping of `success` variant of `default` apce
 * s10 = `checked` of `outline success`         - `checked` state mapping of `success` variant of `outline` apce
 * s11 = `checked` of `default large`           - `checked` state mapping of `large` variant of `default` apce
 * s12 = `checked` of `outline large`           - `checked` state mapping of `large` variant of `outline` apce
 *
 * s13 = `active.checked` of `default`          - `active.checked` state mapping of `default` apce
 * s14 = `active.checked` of `outline`          - `active.checked` state mapping of `outline` apce
 * s15 = `active.checked` of `default success`  - `active.checked` state mapping of `success` variant of `default` apce
 * s16 = `active.checked` of `outline success`  - `active.checked` state mapping of `success` variant of `outline` apce
 * s17 = `active.checked` of `default large`    - `active.checked` state mapping of `large` variant of `default` apce
 * s18 = `active.checked` of `outline large`    - `active.checked` state mapping of `large` variant of `outline` apce
 *
 * res = a + (v1 + v2 + ... + vn) + (s1 + s2 + ... + sn)
 *
 * @param mapping: ThemeMappingType - theme mapping configuration
 * @param component: string - component name
 * @param appearance: string - appearance applied to component
 * @param variants: string[] - variants applied to component. Default is []
 * @param states: string[] - states in which component is. Default is []
 * @param theme: StrictTheme - theme configuration object. Default is {}
 *
 * @return ThemedStyleType - compiled component styles declared in mappings, mapped to theme values
 */
function createStyle(mapping, component, appearance, variants = [], states = [], theme = {}) {
    const normalizedAppearance = normalizeAppearance(mapping, component, appearance);
    const normalizedVariants = normalizeVariants(mapping, component, variants);
    const normalizedStates = normalizeStates(mapping, component, states, (state) => {
        return states.indexOf(state);
    });
    const appearanceMapping = reduce(normalizedAppearance, apce => {
        return mapping_1.getStatelessAppearanceMapping(mapping, component, apce);
    });
    const variantMapping = reduce(normalizedVariants, variant => {
        return reduce(normalizedAppearance, apce => {
            return mapping_1.getStatelessVariantMapping(mapping, component, apce, variant);
        });
    });
    const stateMapping = reduce(normalizedStates, state => {
        const appearanceStateMapping = reduce(normalizedAppearance, apce => {
            return mapping_1.getStateAppearanceMapping(mapping, component, apce, state);
        });
        const variantStateMapping = reduce(normalizedVariants, variant => {
            return reduce(normalizedAppearance, apce => {
                return mapping_1.getStateVariantMapping(mapping, component, apce, variant, state);
            });
        });
        return Object.assign({}, appearanceStateMapping, variantStateMapping);
    });
    const strictlessMapping = Object.assign({}, appearanceMapping, variantMapping, stateMapping);
    return withStrictTokens(strictlessMapping, theme);
}
exports.createStyle = createStyle;
function createAllStyles(mapping, component, appearance, variants, states, theme) {
    const stateless = createStyleEntry(mapping, component, appearance, appearance, '', '', theme);
    const withStates = states.reduce((acc, current) => {
        const key = appearance.concat(exports.SEPARATOR_MAPPING_ENTRY, current);
        const next = createStyleEntry(mapping, component, key, appearance, '', current, theme);
        return [...acc, next];
    }, []);
    const withVariants = variants.map(variant => {
        const key = appearance.concat(exports.SEPARATOR_MAPPING_ENTRY, variant);
        return createStyleEntry(mapping, component, key, appearance, variant, '', theme);
    });
    const withVariantStates = variants.reduce((acc, current) => {
        const next = states.map(state => {
            const key = appearance.concat(exports.SEPARATOR_MAPPING_ENTRY, current, exports.SEPARATOR_MAPPING_ENTRY, state);
            return createStyleEntry(mapping, component, key, appearance, current, state, theme);
        });
        return [...acc, ...next];
    }, []);
    return [
        stateless,
        ...withStates,
        ...withVariants,
        ...withVariantStates,
    ];
}
exports.createAllStyles = createAllStyles;
function getStyle(mapping, component, appearance, variants, states) {
    return common_1.safe(mapping, (themeMapping) => {
        return common_1.safe(themeMapping[component], (componentMapping) => {
            const query = findStyleKey(Object.keys(componentMapping), [
                appearance,
                ...variants,
                ...states,
            ]);
            return componentMapping[query];
        });
    });
}
exports.getStyle = getStyle;
/**
 * Creates normalized to design system array of component appearances
 *
 * Example:
 *
 * '' => ['default']
 * 'bold' => ['default', 'bold']
 * 'default' => ['default']
 * ...
 *
 * @param mapping: ThemeMappingType - theme mapping configuration
 * @param component: string - component name
 * @param appearance: string - appearance applied to component
 *
 * @return string[] - array of merged appearances
 */
function normalizeAppearance(mapping, component, appearance) {
    const defaultAppearance = mapping_1.getComponentDefaultAppearance(mapping, component);
    return normalize([defaultAppearance, appearance]);
}
exports.normalizeAppearance = normalizeAppearance;
/**
 * Creates normalized to design system array of component variants
 *
 * Example:
 *
 * [''] => ['default0', 'default1']
 * ['success'] => ['default0', 'default1', 'success']
 * ['default0', 'tiny'] => ['default0', 'default1', 'tiny']
 * ...
 *
 * @param mapping: ThemeMappingType - theme mapping configuration
 * @param component: string - component name
 * @param variants: string[] - variants applied to component
 *
 * @return string[] - array of merged variants
 */
function normalizeVariants(mapping, component, variants) {
    const defaultVariants = mapping_1.getComponentDefaultVariants(mapping, component);
    return normalize([...defaultVariants, ...variants]);
}
exports.normalizeVariants = normalizeVariants;
/**
 * Creates normalized to design system array of component states
 *
 * Example:
 *
 * [''] => ['default']
 * ['active', 'checked'] => [
 *                           'default',
 *                           'active',
 *                           'default.active',
 *                           'checked',
 *                           'default.active.checked'
 *                          ]
 * ...
 *
 * @param mapping: ThemeMappingType - theme mapping configuration
 * @param component: string - component name
 * @param states: string[] - states in which component is
 * @param stateWeight: (state: string) => number - state weight calculation lambda
 * @param separator - state separator. `.` in example
 *
 * @return string[] - array of merged states
 */
function normalizeStates(mapping, component, states, stateWeight, separator = exports.SEPARATOR_MAPPING_ENTRY) {
    const defaultState = mapping_1.getComponentDefaultState(mapping, component);
    const preprocess = normalize([defaultState, ...states]);
    if (preprocess.length === 0) {
        return preprocess;
    }
    const variations = createStateVariations([...preprocess], separator, []);
    return variations.sort((lhs, rhs) => {
        const lhsWeight = getStateVariationWeight(lhs, separator, stateWeight);
        const rhsWeight = getStateVariationWeight(rhs, separator, stateWeight);
        return lhsWeight - rhsWeight;
    });
}
exports.normalizeStates = normalizeStates;
function createStateVariations(states, separator, result = []) {
    if (states.length === 0) {
        return result;
    }
    const next = states.reduce((acc, current) => {
        const nextItem = acc.map(value => value.concat(separator, current));
        return [...acc, ...nextItem];
    }, [states.shift()]);
    return createStateVariations(states, separator, [...result, ...next]);
}
function withStrictTokens(mapping, theme) {
    return Object.keys(mapping).reduce((acc, next) => {
        const currentToken = mapping[next];
        const nextToken = theme[currentToken] || currentToken;
        return Object.assign({}, acc, { [next]: nextToken });
    }, {});
}
function getStateVariationWeight(state, separator, stateWeight) {
    const parts = state.split(separator);
    return parts.reduce((acc, current) => {
        return acc + stateWeight(current) + parts.length;
    }, 0);
}
/**
 * Finds identical keys across `source` keys array
 *
 * Example:
 *
 * source = ['default.error.small.checked', ...]
 * query = ['default', 'small', 'error', 'checked']
 *
 * will return 'default.error.small.checked'
 *
 * @param source (string[]) - array of style keys
 * @param query (string[]) - array of key parts to search
 *
 * @return (string | undefined) - key identical to some of `source` keys if presents
 */
function findStyleKey(source, query) {
    const partialKeys = source.map((key) => {
        return key.split(exports.SEPARATOR_MAPPING_ENTRY);
    });
    const result = partialKeys.filter((partial) => {
        return compareArrays(query, partial);
    });
    return common_1.safe(result[0], (value) => {
        return value.join(exports.SEPARATOR_MAPPING_ENTRY);
    });
}
exports.findStyleKey = findStyleKey;
function createStyleEntry(mapping, component, key, appearance, variant = '', state = '', theme = {}) {
    const value = createStyle(mapping, component, appearance, variant.split(exports.SEPARATOR_MAPPING_ENTRY), state.split(exports.SEPARATOR_MAPPING_ENTRY), theme);
    return [key, value];
}
function normalize(params) {
    return common_1.noNulls(common_1.noDuplicates(params));
}
function compareArrays(lhs, rhs) {
    const isEqualLength = lhs && rhs && lhs.length === rhs.length;
    if (!isEqualLength) {
        return false;
    }
    return lhs.reduce((acc, next) => acc && rhs.includes(next), true);
}
function reduce(items, next) {
    return items.reduce((acc, current) => (Object.assign({}, acc, next(current))), {});
}
//# sourceMappingURL=style.service.js.map