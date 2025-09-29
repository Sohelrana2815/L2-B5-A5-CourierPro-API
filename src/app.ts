import express, { NextFunction, type Request, type Response } from "express";
import { router } from "./app/routes";
import cors from "cors";
import { envVars } from "./app/config/env";
const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Courier Pro Server...",
  });
});

// Global error handler

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    message: `Something went wrong! ${err.message}`,
    err,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
});

export default app;
