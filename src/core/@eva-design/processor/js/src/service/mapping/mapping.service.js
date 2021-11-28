"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
function getComponentDefaultAppearance(mapping, component) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        const { appearances } = value.meta;
        return Object.keys(appearances).find((appearance) => {
            return appearances[appearance].default === true;
        });
    });
}
exports.getComponentDefaultAppearance = getComponentDefaultAppearance;
function getComponentDefaultVariants(mapping, component) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        const { variantGroups } = value.meta;
        return Object.keys(variantGroups).map((group) => {
            return Object.keys(variantGroups[group]).find((variant) => {
                return variantGroups[group][variant].default === true;
            });
        });
    });
}
exports.getComponentDefaultVariants = getComponentDefaultVariants;
function getComponentDefaultState(mapping, component) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        const { states } = value.meta;
        return Object.keys(states).find((state) => {
            return states[state].default === true;
        });
    });
}
exports.getComponentDefaultState = getComponentDefaultState;
function getComponentVariantGroups(mapping, component) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        const { variantGroups } = value.meta;
        return Object.keys(variantGroups);
    });
}
exports.getComponentVariantGroups = getComponentVariantGroups;
function getComponentVariants(mapping, component) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        const { variantGroups } = value.meta;
        return Object.keys(variantGroups).map((group) => {
            return Object.keys(variantGroups[group]);
        });
    });
}
exports.getComponentVariants = getComponentVariants;
function getComponentStates(mapping, component) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        const { states } = value.meta;
        return Object.keys(states);
    });
}
exports.getComponentStates = getComponentStates;
function getStateAppearanceMapping(mapping, component, appearance, state) {
    const appearanceMapping = getAppearanceMapping(mapping, component, appearance);
    return common_1.safe(appearanceMapping, (value) => {
        return getStateMapping(value, state);
    });
}
exports.getStateAppearanceMapping = getStateAppearanceMapping;
function getStatelessAppearanceMapping(mapping, component, appearance) {
    const appearanceMapping = getAppearanceMapping(mapping, component, appearance);
    return common_1.safe(appearanceMapping, (value) => {
        const { state } = value, params = __rest(value, ["state"]);
        return params;
    });
}
exports.getStatelessAppearanceMapping = getStatelessAppearanceMapping;
function getStateVariantMapping(mapping, component, appearance, variant, state) {
    const variantMapping = getVariantMapping(mapping, component, appearance, variant);
    return common_1.safe(variantMapping, (value) => {
        return getStateMapping(value, state);
    });
}
exports.getStateVariantMapping = getStateVariantMapping;
function getStatelessVariantMapping(mapping, component, appearance, variant) {
    const variantMapping = getVariantMapping(mapping, component, appearance, variant);
    return common_1.safe(variantMapping, (value) => {
        const { state } = value, params = __rest(value, ["state"]);
        return params;
    });
}
exports.getStatelessVariantMapping = getStatelessVariantMapping;
function getComponentMapping(mapping, component) {
    return mapping[component];
}
exports.getComponentMapping = getComponentMapping;
function getAppearance(mapping, component, appearance) {
    const componentMapping = getComponentMapping(mapping, component);
    return common_1.safe(componentMapping, (value) => {
        return value.appearances[appearance];
    });
}
function getAppearanceMapping(mapping, component, appearance) {
    const appearanceConfig = getAppearance(mapping, component, appearance);
    return common_1.safe(appearanceConfig, (value) => {
        return value.mapping;
    });
}
function getVariantMapping(mapping, component, appearance, variant) {
    const appearanceConfig = getAppearance(mapping, component, appearance);
    return common_1.safe(appearanceConfig, (value) => {
        return common_1.safe(value.variantGroups, (groupValue) => {
            const groupName = Object.keys(groupValue).find((group) => {
                return groupValue[group][variant] !== undefined;
            });
            return common_1.safe(groupName, (groupNameValue) => {
                return groupValue[groupNameValue][variant];
            });
        });
    });
}
function getStateMapping(mapping, state) {
    return common_1.safe(mapping.state, (value) => {
        return value[state];
    });
}
//# sourceMappingURL=mapping.service.js.map