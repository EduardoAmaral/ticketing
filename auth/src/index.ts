import express from "express";
import { json } from "body-parser";

import { signUpRouter } from "./routes/signup";

const app = express();
app.use(json());

app.use(signUpRouter);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
