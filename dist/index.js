"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const config_1 = require("./config");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const { NODE_ENV } = process.env;
//?adding Production Needs
if (NODE_ENV === "production") {
    config_1.app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: "Too many Requests created from this IP, please try again after an hour",
    }));
}
//? instantiate all app Peases in one Place
(0, config_1.startServer)(config_1.app);
//# sourceMappingURL=index.js.map