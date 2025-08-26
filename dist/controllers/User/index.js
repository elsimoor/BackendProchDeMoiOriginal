"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeDefs = exports.userResolvers = exports.customDateScalarResolver = void 0;
const resolvers_1 = require("./resolvers");
Object.defineProperty(exports, "userResolvers", { enumerable: true, get: function () { return resolvers_1.userResolvers; } });
const typeDefs_1 = require("./typeDefs");
Object.defineProperty(exports, "userTypeDefs", { enumerable: true, get: function () { return typeDefs_1.userTypeDefs; } });
const graphql_iso_date_1 = require("graphql-iso-date");
const customDateScalarResolver = {
    Date: graphql_iso_date_1.GraphQlDateTime
};
exports.customDateScalarResolver = customDateScalarResolver;
//# sourceMappingURL=index.js.map