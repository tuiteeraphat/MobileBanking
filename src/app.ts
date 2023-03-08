import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import customerRouters from "./routes/customers";
import transactionRouters from './routes/transactions';
import env from './util/validateEnv';
import session from "express-session";
import cors from 'cors';

const app = express();

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(session({
  secret: env.SERVER_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000,
  },
  rolling: true,
}));

app.use("/api/customers", customerRouters);
app.use("/api/transactions", transactionRouters);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({
    error: errorMessage,
  });
});

export default app;
