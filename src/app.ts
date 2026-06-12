import path from "node:path";
import express from "express";
import { ZodError } from "zod";
import prevailingWageRouter from "./routes/prevailingWage.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.resolve(process.cwd(), "public")));

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    data: { status: "ok" },
  });
});

app.use("/api/v1/prevailing-wages", prevailingWageRouter);

app.use((request, response) => {
  response.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${request.method} ${request.path} was not found.`,
    },
  });
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
      return;
    }

    console.error(error);
    response.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Something went wrong.",
      },
    });
  },
);

export default app;
