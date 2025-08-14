"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeDefs = void 0;
// auth.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.userTypeDefs = (0, apollo_server_express_1.gql) `

  type User {
    id: ID!
    lastName: String
    firstName: String
    email: String!
    role: String!
    businessType: String
    businessId: ID
    avatar: String
    phone: String
    isActive: Boolean!
    lastLogin: Date
    preferences: UserPreferences
    createdAt: Date!
    updatedAt: Date!
  }

  type UserPreferences {
    notifications: NotificationPreferences
    language: String
    timezone: String
  }

  type NotificationPreferences {
    email: Boolean
    sms: Boolean
    push: Boolean
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    lastName: String!
    firstName: String!
    email: String!
    password: String!
    businessType: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Input type for updating a user.  Allows assigning a businessId and businessType
  # to link a user to a specific business (hotel/restaurant/salon) or update their role.
  input UserUpdateInput {
    businessId: ID
    businessType: String
    role: String
  }
`;
//# sourceMappingURL=typeDefs.js.map