"use strict";
// src/graphql/typeDefs/table.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.tableTypeDefs = (0, apollo_server_express_1.gql) `

  type Position {
    x: Float
    y: Float
  }

  type Table {
    id: ID!
    restaurantId: ID!
    number: Int!
    capacity: Int!
    location: String!
    status: String!
    features: [String!]!
    position: Position
    isActive: Boolean!
    images: [String]
    createdAt: Date!
    updatedAt: Date!
  }
`;
//# sourceMappingURL=typeDefs.js.map