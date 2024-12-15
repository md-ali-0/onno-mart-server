import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import config from "./config";

const app: Application = express();
app.use(
    cors({
        origin: [config.client_url as string, "http://localhost:3000"],
        credentials: true,
    })
);
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send({
        Message: "Ecommerce Backend Running..",
    });
});

app.use("/api", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});

export default app;
