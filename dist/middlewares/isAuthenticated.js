"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const graphql_resolvers_1 = require("graphql-resolvers");
const _1 = require(".");
const isAuthenticated = async (_, __, { req }) => {
    try {
        await (0, _1.verifyToken)(req);
        return graphql_resolvers_1.skip;
    }
    catch (error) {
        throw new Error("Access Forbiden");
    }
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map