"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jasmine");
var shared_library_1 = require("./shared-library");
describe('shared-library', function () {
    beforeEach(function () {
    });
    it('should generate something..', function () {
        var newGuid = shared_library_1.Guid.newGuid();
        expect(newGuid.length > 10);
    });
});
//# sourceMappingURL=shared-library.spec.js.map