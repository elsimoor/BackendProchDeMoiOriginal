"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.notFound = router.get("*", (_, res) => {
    res.status(404);
    res.json({
        //@ts-ignore
        message: `🚑 I think you are lost 🤦‍♀️🤦‍♀️ `,
    });
});
//# sourceMappingURL=404.js.map