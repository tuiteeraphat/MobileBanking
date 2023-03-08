"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsDefined = void 0;
function assertIsDefined(val) {
    if (!val) {
        throw Error("Expected 'Val' to be defined, but recieved " + val);
    }
}
exports.assertIsDefined = assertIsDefined;
