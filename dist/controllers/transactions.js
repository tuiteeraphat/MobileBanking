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
exports.SendMoney = exports.getTransaction = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const db_1 = __importDefault(require("../util/db"));
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
const assertIsDefined_1 = require("../util/assertIsDefined");
const getTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id } = req.body;
    try {
        const [transaction] = yield (yield db_1.default).query("SELECT * FROM transaction WHERE from_customer_id = ? OR to_customer_id = ? ORDER BY transaction_time DESC", [customer_id, customer_id]);
        res.status(200).json(transaction);
    }
    catch (error) {
        next(error);
    }
});
exports.getTransaction = getTransaction;
const SendMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id, to_account_number, transaction_money } = req.body;
    const authenticatedUserId = customer_id;
    try {
        (0, assertIsDefined_1.assertIsDefined)(authenticatedUserId);
        if (!to_account_number || !transaction_money) {
            throw (0, http_errors_1.default)(400, "Parameters missing");
        }
        const [customer_source] = yield (yield db_1.default).query("SELECT * FROM customer WHERE customer_id = ?", [authenticatedUserId]);
        const from_account_number = customer_source[0].account_number;
        const from_customer_name = customer_source[0].name;
        if (from_account_number === to_account_number) {
            throw (0, http_errors_1.default)(400, "Unable to transfer money to this destination account");
        }
        const [customer_destination] = yield (yield db_1.default).query("SELECT * FROM customer WHERE account_number = ?", [to_account_number]);
        const to_customer_id = customer_destination[0].customer_id;
        const to_customer_name = customer_destination[0].name;
        if (Object.keys(customer_destination).length === 0) {
            throw (0, http_errors_1.default)(404, "The account destination could not be found");
        }
        if (customer_source[0].account_money < transaction_money) {
            throw (0, http_errors_1.default)(400, "Insufficient account balance to transfer");
        }
        yield (yield db_1.default).query("UPDATE customer SET account_money = account_money - ? WHERE customer_id = ?", [transaction_money, authenticatedUserId]);
        yield (yield db_1.default).query("UPDATE customer SET account_money = account_money + ? WHERE account_number = ?", [transaction_money, to_account_number]);
        const transaction_id_gen = (0, generate_unique_id_1.default)({
            length: 15,
            useLetters: false
        });
        const transaction_time_gen = new Date();
        yield (yield db_1.default).query("INSERT INTO `transaction` (`transaction_id`, `transaction_time`, `transaction_money`, `from_customer_id`,  `from_customer_name`, `from_account_number`, `to_customer_id`, `to_customer_name`, `to_account_number`) VALUES (?,?,?,?,?,?,?,?,?)", [transaction_id_gen, transaction_time_gen, transaction_money, authenticatedUserId, from_customer_name, from_account_number, to_customer_id, to_customer_name, to_account_number]);
        res.status(200).json({ success: "transfer money successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.SendMoney = SendMoney;
