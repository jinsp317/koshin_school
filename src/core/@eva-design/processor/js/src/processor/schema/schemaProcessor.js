"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mappingProcessor_1 = require("../mapping/mappingProcessor");
const metaProcessor_1 = require("../meta/metaProcessor");
class SchemaProcessor {
    constructor() {
        this.mappingProcessor = new mappingProcessor_1.MappingProcessor();
        this.metaProcessor = new metaProcessor_1.MetaProcessor();
    }
    process(params) {
        const { components: themeMapping, strict: strictTheme } = params;
        const meta = this.mappingProcessor.process(themeMapping);
        return this.metaProcessor.process({
            mapping: themeMapping,
            meta: meta,
            theme: strictTheme,
        });
    }
}
exports.SchemaProcessor = SchemaProcessor;
//# sourceMappingURL=schemaProcessor.js.map