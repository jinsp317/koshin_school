"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Service = __importStar(require("./style.service"));
const style_spec_config_1 = require("./style.spec.config");
describe('@style: service methods checks', () => {
    describe('* preprocess', () => {
        describe('* normalizes appearance properly', () => {
            it('* explicit default', () => {
                const value = Service.normalizeAppearance(style_spec_config_1.mapping, 'Button', 'filled');
                expect(value).toEqual([
                    'filled',
                ]);
            });
            it('* custom', () => {
                const value = Service.normalizeAppearance(style_spec_config_1.mapping, 'Button', 'outline');
                expect(value).toEqual([
                    'filled',
                    'outline',
                ]);
            });
            it('* empty', () => {
                const value = Service.normalizeAppearance(style_spec_config_1.mapping, 'Button', '');
                expect(value).toEqual([
                    'filled',
                ]);
            });
            it('* undefined', () => {
                const value = Service.normalizeAppearance(style_spec_config_1.mapping, 'Button', undefined);
                expect(value).toEqual([
                    'filled',
                ]);
            });
        });
        describe('* normalizes variants properly', () => {
            it('* explicit default', () => {
                const value = Service.normalizeVariants(style_spec_config_1.mapping, 'Button', ['primary', 'medium']);
                expect(value).toEqual([
                    'primary',
                    'medium',
                ]);
            });
            it('* with custom', () => {
                const value = Service.normalizeVariants(style_spec_config_1.mapping, 'Button', ['success']);
                expect(value).toEqual([
                    'primary',
                    'medium',
                    'success',
                ]);
            });
            it('* empty', () => {
                const value = Service.normalizeVariants(style_spec_config_1.mapping, 'Button', []);
                expect(value).toEqual([
                    'primary',
                    'medium',
                ]);
            });
            it('* with duplicates', () => {
                const value = Service.normalizeVariants(style_spec_config_1.mapping, 'Button', ['success', 'success']);
                expect(value).toEqual([
                    'primary',
                    'medium',
                    'success',
                ]);
            });
            it('* with undefined', () => {
                const value = Service.normalizeVariants(style_spec_config_1.mapping, 'Button', [undefined, null]);
                expect(value).toEqual([
                    'primary',
                    'medium',
                ]);
            });
        });
        describe('* normalizes states properly', () => {
            const states = [
                'active',
                'checked',
                'disabled',
            ];
            const calculateStateWeight = (state) => {
                switch (state) {
                    case 'active':
                        return 0;
                    case 'checked':
                        return 1;
                    case 'disabled':
                        return 2;
                }
            };
            it('* with applied states', () => {
                const value = Service.normalizeStates(style_spec_config_1.mapping, 'Button', states, calculateStateWeight);
                expect(value).toEqual([
                    'active',
                    'checked',
                    'disabled',
                    'active.checked',
                    'active.disabled',
                    'checked.disabled',
                    'active.checked.disabled',
                ]);
            });
            it('* empty', () => {
                const value = Service.normalizeStates(style_spec_config_1.mapping, 'Button', [], calculateStateWeight);
                expect(value).toEqual([]);
            });
            it('* with duplicates', () => {
                const value = Service.normalizeStates(style_spec_config_1.mapping, 'Button', [...states, 'active'], calculateStateWeight);
                expect(value).toEqual([
                    'active',
                    'checked',
                    'disabled',
                    'active.checked',
                    'active.disabled',
                    'checked.disabled',
                    'active.checked.disabled',
                ]);
            });
            it('* with undefined', () => {
                const value = Service.normalizeStates(style_spec_config_1.mapping, 'Button', [...states, undefined], calculateStateWeight);
                expect(value).toEqual([
                    'active',
                    'checked',
                    'disabled',
                    'active.checked',
                    'active.disabled',
                    'checked.disabled',
                    'active.checked.disabled',
                ]);
            });
            it('* custom separator', () => {
                const value = Service.normalizeStates(style_spec_config_1.mapping, 'Button', states, calculateStateWeight, '-');
                expect(value).toEqual([
                    'active',
                    'checked',
                    'disabled',
                    'active-checked',
                    'active-disabled',
                    'checked-disabled',
                    'active-checked-disabled',
                ]);
            });
        });
        describe('* style query', () => {
            const source = [
                'default',
                'default.checked',
                'default.success',
                'default.success.checked',
                'default.success.small.checked',
                'default.success.small.checked.active',
            ];
            it('* appearance only', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                ]);
                expect(value).toEqual('default');
            });
            it('* appearance and state', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'checked',
                ]);
                expect(value).toEqual('default.checked');
            });
            it('* appearance and variant', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'success',
                ]);
                expect(value).toEqual('default.success');
            });
            it('* appearance and variant and state', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'success',
                    'checked',
                ]);
                expect(value).toEqual('default.success.checked');
            });
            it('* appearance and variants and state', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'success',
                    'small',
                    'checked',
                ]);
                expect(value).toEqual('default.success.small.checked');
            });
            it('* appearance and variants and states', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'success',
                    'small',
                    'checked',
                    'active',
                ]);
                expect(value).toEqual('default.success.small.checked.active');
            });
            it('* unordered', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'checked',
                    'small',
                    'success',
                    'active',
                ]);
                expect(value).toEqual('default.success.small.checked.active');
            });
            it('* with undefined in config', () => {
                const value = Service.findStyleKey(source, [
                    'default',
                    'error',
                    'small',
                    'checked',
                    'active',
                ]);
                expect(value).toEqual(undefined);
            });
        });
    });
    describe('* styling', () => {
        describe('* default appearance', () => {
            const appearance = 'filled';
            it('* stateless', () => {
                const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance);
                expect(value).toMatchSnapshot();
            });
            describe('* with state', () => {
                it('* single', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, [], ['active']);
                    expect(value).toMatchSnapshot();
                });
                it('* multiple', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, [], ['disabled', 'active']);
                    expect(value).toMatchSnapshot();
                });
            });
            describe('* with variant', () => {
                describe('* single', () => {
                    it('* no state', () => {
                        const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success']);
                        expect(value).toMatchSnapshot();
                    });
                    describe('* with state', () => {
                        it('* single implicit (should apply from appearance)', () => {
                            const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success'], ['active']);
                            expect(value).toMatchSnapshot();
                        });
                        it('* single explicit (should apply own)', () => {
                            const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success'], ['active']);
                            expect(value).toMatchSnapshot();
                        });
                        it('* multiple', () => {
                            const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success'], ['disabled', 'active']);
                            expect(value).toMatchSnapshot();
                        });
                    });
                });
                describe('* multiple', () => {
                    it('* no state', () => {
                        const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success', 'large']);
                        expect(value).toMatchSnapshot();
                    });
                    describe('* with state', () => {
                        it('* single', () => {
                            const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success', 'large'], ['active']);
                            expect(value).toMatchSnapshot();
                        });
                        it('* multiple', () => {
                            const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success', 'large'], ['disabled', 'active']);
                            expect(value).toMatchSnapshot();
                        });
                    });
                });
            });
            describe('* strict tokens', () => {
                const textPrimaryInverseValue = 'white';
                const strict = {
                    'text-primary-inverse': textPrimaryInverseValue,
                };
                it('* maps strict tokens to corresponding values', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, [], [], strict);
                    const { textColor } = value;
                    expect(textColor).toEqual(textPrimaryInverseValue);
                });
            });
        });
        describe('* custom appearance', () => {
            const appearance = 'outline';
            it('* stateless', () => {
                const value = Service.createStyle(style_spec_config_1.mapping, 'Button', 'outline');
                expect(value).toMatchSnapshot();
            });
            describe('* with state', () => {
                it('* implicit (should apply from default appearance)', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, [], ['disabled']);
                    expect(value).toMatchSnapshot();
                });
                it('* explicit (should apply own)', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, [], ['active']);
                    expect(value).toMatchSnapshot();
                });
            });
            describe('* with variant', () => {
                it('* implicit (should apply from default appearance)', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['large']);
                    expect(value).toMatchSnapshot();
                });
                it('* explicit (should apply own)', () => {
                    const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance, ['success']);
                    expect(value).toMatchSnapshot();
                });
            });
        });
        describe('* undefined appearance', () => {
            const appearance = 'undefined';
            it('* stateless (should apply default appearance)', () => {
                const value = Service.createStyle(style_spec_config_1.mapping, 'Button', appearance);
                expect(value).toMatchSnapshot();
            });
        });
    });
});
//# sourceMappingURL=style.spec.js.map