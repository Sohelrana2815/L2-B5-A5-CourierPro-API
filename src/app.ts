import express, { type Request, type Response } from "express";
import { router } from "./app/routes";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
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

app.use(globalErrorHandler);

// Not found err

app.use(notFound);

export default app;
