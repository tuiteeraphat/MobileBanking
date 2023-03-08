"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
const validators_1 = require("envalid/dist/validators");
exports.default = (0, envalid_1.cleanEnv)(process.env, {
    MYSQL_HOST: (0, validators_1.host)(),
    MYSQL_PORT: (0, validators_1.port)(),
    MYSQL_USERNAME: (0, validators_1.str)(),
    MYSQL_PASSWORD: (0, validators_1.str)(),
    MYSQL_DATABASE_NAME: (0, validators_1.str)(),
    SERVER_PORT: (0, validators_1.port)(),
    SERVER_SESSION_SECRET: (0, validators_1.str)(),
});
