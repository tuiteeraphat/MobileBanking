import { cleanEnv } from "envalid";
import { host, port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
  MYSQL_HOST: host(),
  MYSQL_PORT: port(),
  MYSQL_USERNAME: str(),
  MYSQL_PASSWORD: str(),
  MYSQL_DATABASE_NAME: str(),
  SERVER_PORT: port(),
  SERVER_SESSION_SECRET: str(),
});
