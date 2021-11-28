"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tests_1 = require("../../tests");
const mappingProcessor_1 = require("../mapping/mappingProcessor");
const { components: mapping, strict: theme } = tests_1.schema;
exports.mapping = mapping;
exports.theme = theme;
const mappingProcessor = new mappingProcessor_1.MappingProcessor();
const meta = mappingProcessor.process(mapping);
exports.meta = meta;
//# sourceMappingURL=metaProcessor.spec.config.js.map