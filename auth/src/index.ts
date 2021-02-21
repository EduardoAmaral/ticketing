import express from "express";
import { json } from "body-parser";

import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";

const app = express();
app.use(json());

app.use(signUpRouter);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
