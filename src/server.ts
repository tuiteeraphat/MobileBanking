import app from "./app";
import env from "./util/validateEnv";

const port = env.SERVER_PORT;

app.listen(port, () => {
  console.log(`Sever running on port: ${port}`);
});
