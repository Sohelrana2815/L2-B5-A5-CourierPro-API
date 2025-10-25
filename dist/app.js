"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./app/routes");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = require("./app/middlewares/notFound");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
require("./app/config/passport");
const env_1 = require("./app/config/env");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin: [
        env_1.envVars.FRONTEND_URL,
        "https://l2-b5-a6-courier-pro-api-frontend.vercel.app",
        "http://localhost:3000",
    ],
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: "Your secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Courier Pro Server...",
    });
});
// Global error handler
app.use(globalErrorHandler_1.globalErrorHandler);
// Not found err
app.use(notFound_1.notFound);
exports.default = app;
