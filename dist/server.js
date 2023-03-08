"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const validateEnv_1 = __importDefault(require("./util/validateEnv"));
const port = validateEnv_1.default.SERVER_PORT;
app_1.default.listen(port, () => {
    console.log(`Sever running on port: ${port}`);
});
