"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignOut = exports.SignIn = exports.SignUp = exports.getCustomer = exports.getAuthenticatedUser = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../util/db"));
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
const getAuthenticatedUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [user] = yield (yield db_1.default).query("SELECT email FROM customer WHERE customer_id = ?", [req.session.customer_id]);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getAuthenticatedUser = getAuthenticatedUser;
const getCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.body;
    try {
        const [customer] = yield (yield db_1.default).query("SELECT * FROM customer WHERE customer_id = ?", [customer_id]);
        res.status(200).json(customer[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.getCustomer = getCustomer;
const SignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    try {
        if (!email || !name || !password) {
            throw (0, http_errors_1.default)(400, "Parameters missing");
        }
        const [emailAlreadyExist] = yield (yield db_1.default).query("SELECT * FROM customer WHERE email = ?", [email]);
        if (Object.keys(emailAlreadyExist).length !== 0) {
            throw (0, http_errors_1.default)(409, "Email already taken. Please choose a different one or log in instead.");
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const account_number = (0, generate_unique_id_1.default)({
            length: 10,
            useLetters: false
        });
        yield (yield db_1.default).query("INSERT INTO customer (name, email, password, account_number) VALUES(?,?,?,?)", [name, email, passwordHash, account_number]);
        res.status(200).json({ statusCode: 200, success: "Successfully created a new user" });
    }
    catch (error) {
        next(error);
    }
});
exports.SignUp = SignUp;
const SignIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            throw (0, http_errors_1.default)(400, "Parameters missing");
        }
        const [customer] = yield (yield db_1.default).query("SELECT * FROM customer WHERE email = ?", [email]);
        if (Object.keys(customer).length === 0) {
            throw (0, http_errors_1.default)(409, "Invalid credentials");
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, customer[0].password);
        if (!passwordMatch) {
            throw (0, http_errors_1.default)(401, "Invalid credentials");
        }
        req.session.customer_id = customer[0].customer_id;
        res.status(200).json(customer[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.SignIn = SignIn;
const SignOut = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error);
        }
        else {
            res.status(200).json({ message: "Logout success" });
        }
    });
};
exports.SignOut = SignOut;
