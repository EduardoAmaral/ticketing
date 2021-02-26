import mongoose from "mongoose";

import app from "./app";

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET should be defined");
  }

  await mongoose.connect("mongodb://auth-mongo-srv:27017/authdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
