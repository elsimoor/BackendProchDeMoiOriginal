"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = async (req) => {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
        const token = bearerHeader.split(" ")[1];
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return payload;
    }
    else {
        throw new Error("Toekn not Valid");
    }
};
exports.verifyToken = verifyToken;
const generateToken = async (id, email, role) => {
    try {
        return jsonwebtoken_1.default.sign({ id, email, role }, process.env.JWT_SECRET, {
            expiresIn: "365d",
        });
    }
    catch (err) {
        console.log(err);
        throw err;
    }
};
exports.generateToken = generateToken;
//# sourceMappingURL=jwt.js.map