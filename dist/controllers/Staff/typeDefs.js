"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffTypeDef = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.staffTypeDef = (0, apollo_server_express_1.gql) `
  type Staff {
    id: ID!
    businessId: ID!
    businessType: String!
    userId: ID
    name: String!
    role: String!
    email: String
    phone: String
    hireDate: Date
    schedule: String!
    hourlyRate: Float
    status: String!
    specialties: [String!]!
    availability: [Availability!]!
    avatar: String
    notes: String
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type Availability {
    day: String!
    startTime: String!
    endTime: String!
    available: Boolean!
  }
`;
//# sourceMappingURL=typeDefs.js.map