import { createThemedStyle } from './style.service';
const SEPARATOR_MAPPING_ENTRY = '.';
export class StyleConsumerService {
    constructor(name, context) {
        this.name = name;
        this.meta = this.safe(context.style[name], (generatedConfig) => {
            return generatedConfig.meta;
        });
    }
    createDefaultProps() {
        const appearance = this.getDefaultAppearance();
        const variants = this.getDefaultVariants();
        const states = this.getDefaultStates();
        return Object.assign({ appearance }, variants, states);
    }
    withStyledProps(source, context, interaction) {
        const styleInfo = this.getStyleInfo(source, interaction);
        const generatedMapping = this.getGeneratedStyleMapping(context.style, styleInfo);
        const mapping = this.withValidParameters(generatedMapping);
        return Object.assign({}, source, { theme: context.theme, themedStyle: createThemedStyle(mapping, context.theme) });
    }
    getGeneratedStyleMapping(style, info) {
        return this.safe(style[this.name], (componentStyles) => {
            const styleKeys = Object.keys(componentStyles.styles);
            const query = this.findGeneratedQuery(info, styleKeys);
            return componentStyles.styles[query];
        });
    }
    withValidParameters(mapping) {
        const invalidParameters = [];
        Object.keys(mapping).forEach((key) => {
            if (!Object.keys(this.meta.parameters).includes(key)) {
                invalidParameters.push(key);
                delete mapping[key];
            }
        });
        if (invalidParameters.length !== 0) {
            console.warn(`Before using these variables, describe them in the component configuration: ${invalidParameters}`);
        }
        return mapping;
    }
    getStyleInfo(props, interaction) {
        const variantProps = this.getDerivedVariants(this.meta, props);
        const stateProps = this.getDerivedStates(this.meta, props);
        const variants = Object.keys(variantProps).map((variant) => {
            return variantProps[variant];
        });
        const states = Object.keys(stateProps);
        return {
            appearance: props.appearance,
            variants: variants,
            states: [...states, ...interaction],
        };
    }
    getDefaultAppearance() {
        const matches = Object.keys(this.meta.appearances).filter((appearance) => {
            return this.meta.appearances[appearance].default === true;
        });
        return matches[matches.length - 1];
    }
    getDefaultVariants() {
        return this.transformObject(this.meta.variantGroups, (variants, group) => {
            return Object.keys(variants[group]).find((variant) => {
                return variants[group][variant].default === true;
            });
        });
    }
    getDefaultStates() {
        return this.transformObject(this.meta.states, (states, state) => {
            const isDefault = states[state].default === true;
            return isDefault ? isDefault : undefined;
        });
    }
    getDerivedVariants(meta, props) {
        return this.transformObject(props, (p, prop) => {
            const isVariant = Object.keys(meta.variantGroups).includes(prop);
            return isVariant ? p[prop] : undefined;
        });
    }
    getDerivedStates(meta, props) {
        return this.transformObject(props, (p, prop) => {
            const isState = Object.keys(meta.states).includes(prop);
            const isAssigned = p[prop] === true;
            return isState && isAssigned;
        });
    }
    /**
     * Iterates throw `value` object keys and fills it values with values provided by `transform` callback
     * If `transform` returns `undefined`, then appends nothing
     *
     * @param value (V extends object) - object to transform
     * @param transform - object key transformation callback
     */
    transformObject(value, transform) {
        return Object.keys(value).reduce((acc, key) => {
            const nextValue = transform(value, key);
            return nextValue ? Object.assign({}, acc, { [key]: nextValue }) : acc;
        }, {});
    }
    /**
     * Finds identical keys across `source` keys array
     *
     * Example:
     *
     * source = ['default.error.small.checked', ...]
     * info = { appearance: 'default', variants: ['small', 'error'], states: ['checked'] }
     *
     * will return ['default', 'error', 'small', 'checked']
     *
     * @param info (StyleInfo) - component style info
     * @param source (string[]) - array of style keys
     *
     * @return (string | undefined) - key identical to some of `source` keys if presents
     */
    findGeneratedQuery(info, source) {
        const query = [
            info.appearance,
            ...info.variants,
            ...info.states,
        ];
        const matches = source.filter((key) => {
            const keyQuery = key.split(SEPARATOR_MAPPING_ENTRY);
            return this.compareArrays(query, keyQuery);
        });
        return matches[0];
    }
    /**
     * @param lhs (string[]) - comparable array
     * @param rhs (string[]) - comparing array
     *
     * @return true if all of lhs keys are included in rhs
     */
    compareArrays(lhs, rhs) {
        if (lhs.length !== rhs.length) {
            return false;
        }
        return lhs.reduce((acc, current) => acc && rhs.includes(current), true);
    }
    /**
     * Safely retrieves R value of T object with reducer
     *
     * @param value (T | undefined) - unsafe object which should be processed
     * @param reducer ((T) => R) - `value` processing lambda. Called if `value` is not `undefined`
     * @param fallback (R) - fallback value to return. Optional
     *
     * @return (R | undefined) - object returned by `reducer` if `value` is not `undefined`, `fallback` otherwise
     **/
    safe(value, reducer, fallback) {
        if (value) {
            return reducer(value);
        }
        return fallback;
    }
}
