"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateEnv_1 = __importDefault(require("./validateEnv"));
const promise_1 = __importDefault(require("mysql2/promise"));
const bluebird_1 = __importDefault(require("bluebird"));
const connection = promise_1.default.createConnection({
    host: validateEnv_1.default.MYSQL_HOST,
    port: validateEnv_1.default.MYSQL_PORT,
    user: validateEnv_1.default.MYSQL_USERNAME,
    password: validateEnv_1.default.MYSQL_PASSWORD,
    database: validateEnv_1.default.MYSQL_DATABASE_NAME,
    Promise: bluebird_1.default
});
exports.default = connection;
