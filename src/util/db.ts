import env from "./validateEnv";
import mysql from "mysql2/promise";
import bluebird from 'bluebird';

const connection = mysql.createConnection({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE_NAME,
  Promise: bluebird
});

export default connection;
