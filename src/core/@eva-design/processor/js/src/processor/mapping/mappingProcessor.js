"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../../service");
class MappingProcessor {
    process(params) {
        return Object.keys(params).reduce((acc, component) => {
            return [
                ...acc,
                ...this.getComponentMappingMeta(params, component),
            ];
        }, []);
    }
    getComponentMappingMeta(mapping, component) {
        const componentMapping = mapping[component];
        return Object.keys(componentMapping.appearances).map((appearance) => {
            return {
                name: component,
                appearance: appearance,
                variants: this.getComponentVariants(mapping, component),
                states: this.getComponentStates(mapping, component),
            };
        });
    }
    getComponentVariants(mapping, component) {
        const variants = service_1.getComponentVariants(mapping, component);
        return this.concatComponentVariants([...variants]);
    }
    getComponentStates(mapping, component) {
        const states = service_1.getComponentStates(mapping, component);
        return this.concatComponentStates([...states]);
    }
    concatComponentVariants(variants, result = []) {
        if (variants.length === 0) {
            return result;
        }
        const concat = variants.reduce((acc, current) => {
            return [...acc, ...this.concatVariantGroups(acc, current)];
        }, variants.shift());
        return this.concatComponentVariants(variants, [...result, ...concat]);
    }
    concatVariantGroups(lhs, rhs) {
        return lhs.reduce((acc, lhsValue) => {
            const concat = rhs.map(rhsValue => {
                return lhsValue.concat(service_1.SEPARATOR_MAPPING_ENTRY, rhsValue);
            });
            return [...acc, ...concat];
        }, []);
    }
    concatComponentStates(states, result = []) {
        if (states.length === 0) {
            return result;
        }
        const concat = states.reduce((acc, current) => {
            const next = acc.map(value => value.concat(service_1.SEPARATOR_MAPPING_ENTRY, current));
            return [...acc, ...next];
        }, [states.shift()]);
        return this.concatComponentStates(states, [...result, ...concat]);
    }
}
exports.MappingProcessor = MappingProcessor;
//# sourceMappingURL=mappingProcessor.js.map