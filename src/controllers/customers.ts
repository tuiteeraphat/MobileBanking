import { RequestHandler } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import connection from "../util/db";
import generateUniqueId from 'generate-unique-id';
import { RowDataPacket } from "mysql2";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    try {
        const [user] = await (await connection).query("SELECT email FROM customer WHERE customer_id = ?", [req.session.customer_id]);
        res.json(user);
    } catch (error) {
        next(error);
    }
}

interface GetCustomerBody {
    customer_id: string,
}

export const getCustomer: RequestHandler<unknown, unknown, GetCustomerBody, unknown> = async (req, res, next) => {
    const { customer_id } = req.body;
    try {
        const [customer] = await (await connection).query("SELECT * FROM customer WHERE customer_id = ?", [customer_id]);
        res.status(200).json((customer as RowDataPacket[])[0]);
    } catch (error) {
        next(error);
    }
}

interface SignUpBody {
    email: string;
    name: string;
    password: string;
}

export const SignUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {
    const { email, name, password } = req.body;
    try {
        if (!email || !name || !password) {
            throw createHttpError(400, "Parameters missing");
        }

        const [emailAlreadyExist] = await (await connection).query("SELECT * FROM customer WHERE email = ?", [email]);

        if (Object.keys(emailAlreadyExist).length !== 0) {
            throw createHttpError(409, "Email already taken. Please choose a different one or log in instead.");
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const account_number = generateUniqueId({
            length: 10,
            useLetters: false
        });

        await (await connection).query("INSERT INTO customer (name, email, password, account_number) VALUES(?,?,?,?)",
            [name, email, passwordHash, account_number]);

        res.status(200).json({ statusCode: 200, success: "Successfully created a new user" });
    } catch (error) {
        next(error);
    }
};

interface SignInBody {
    email: string,
    password: string,
}

export const SignIn: RequestHandler<unknown, unknown, SignInBody, unknown> = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw createHttpError(400, "Parameters missing");
        }

        const [customer] = await (await connection).query("SELECT * FROM customer WHERE email = ?",
            [email]);

        if (Object.keys(customer).length === 0) {
            throw createHttpError(409, "Invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(password, (customer as RowDataPacket[])[0].password);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid credentials");
        }

        req.session.customer_id = (customer as RowDataPacket[])[0].customer_id;
        res.status(200).json((customer as RowDataPacket[])[0]);
    } catch (error) {
        next(error);
    }
}

export const SignOut: RequestHandler = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({ message: "Logout success" });
        }
    })
}