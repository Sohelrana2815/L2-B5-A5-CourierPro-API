import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("Connected to MongodDB successfully✅");

    server = app.listen(envVars.PORT, () => {
      console.log("Server is listening to port 5000");
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();

// SIGTERM

process.on("SIGTERM", () => {
  console.log("SIGTERM is received");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// SIGINT

process.on("SIGINT", () => {
  console.log("SIGINT signal recieved... Server shutting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Unhandled rejection error

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shutting down ", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Uncaught exception error
process.on("uncaughtException", (err) => {
  console.log("Unhandled Exception detected... Server shutting down ", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

/**
 * Examples
 * 1. Unhandled Rejection
 * 2. Uncaught Exception
 */

// Unhandled Rejection

// Promise.reject(new Error("Promise Error"));

// uncaught Exception

// throw new Error("Uncaught Exception");


