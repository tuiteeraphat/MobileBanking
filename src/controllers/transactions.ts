import { RowDataPacket } from 'mysql2';
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import connection from "../util/db";
import generateUniqueId from 'generate-unique-id';
import { assertIsDefined } from "../util/assertIsDefined";

interface GetTransactionBody {
    customer_id: string,
}

export const getTransaction: RequestHandler<unknown, unknown, GetTransactionBody, unknown> = async (req, res, next) => {
    const { customer_id } = req.body;

    try {
        const [transaction] = await (await connection).query("SELECT * FROM transaction WHERE from_customer_id = ? OR to_customer_id = ? ORDER BY transaction_time DESC", [customer_id, customer_id]);
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
}

interface SendMoneyBody {
    customer_id: string,
    to_account_number: string,
    transaction_money: number,
}

export const SendMoney: RequestHandler<unknown, unknown, SendMoneyBody, unknown> = async (req, res, next) => {
    const { customer_id, to_account_number, transaction_money } = req.body;
    const authenticatedUserId = customer_id;

    try {
        assertIsDefined(authenticatedUserId);

        if (!to_account_number || !transaction_money) {
            throw createHttpError(400, "Parameters missing");
        }

        const [customer_source] = await (await connection).query("SELECT * FROM customer WHERE customer_id = ?",
            [authenticatedUserId]);

        const from_account_number = (customer_source as RowDataPacket[])[0].account_number;
        const from_customer_name = (customer_source as RowDataPacket[])[0].name;

        if (from_account_number === to_account_number) {
            throw createHttpError(400, "Unable to transfer money to this destination account");
        }

        const [customer_destination] = await (await connection).query("SELECT * FROM customer WHERE account_number = ?",
            [to_account_number]);

        const to_customer_id = (customer_destination as RowDataPacket[])[0].customer_id;
        const to_customer_name = (customer_destination as RowDataPacket[])[0].name;

        if (Object.keys(customer_destination).length === 0) {
            throw createHttpError(404, "The account destination could not be found");
        }

        if ((customer_source as RowDataPacket[])[0].account_money < transaction_money) {
            throw createHttpError(400, "Insufficient account balance to transfer");
        }

        await (await connection).query("UPDATE customer SET account_money = account_money - ? WHERE customer_id = ?",
            [transaction_money, authenticatedUserId]);
        await (await connection).query("UPDATE customer SET account_money = account_money + ? WHERE account_number = ?",
            [transaction_money, to_account_number]);

        const transaction_id_gen = generateUniqueId({
            length: 15,
            useLetters: false
        });
        const transaction_time_gen = new Date();

        await (await connection).query("INSERT INTO `transaction` (`transaction_id`, `transaction_time`, `transaction_money`, `from_customer_id`,  `from_customer_name`, `from_account_number`, `to_customer_id`, `to_customer_name`, `to_account_number`) VALUES (?,?,?,?,?,?,?,?,?)",
            [transaction_id_gen, transaction_time_gen, transaction_money, authenticatedUserId, from_customer_name, from_account_number, to_customer_id, to_customer_name, to_account_number]);

        res.status(200).json({ success: "transfer money successfully" });
    } catch (error) {
        next(error);
    }
}