"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestTypeDef = void 0;
// guest.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.guestTypeDef = (0, apollo_server_express_1.gql) `

  type Guest {
    id: ID!
    businessId: ID!
    businessType: String!
    userId: ID
    name: String!
    email: String!
    phone: String
    address: Address
    membershipLevel: String!
    loyaltyPoints: Int!
    totalVisits: Int!
    totalSpent: Float!
    lastVisit: Date
    preferences: GuestPreferences
    notes: String
    status: String!
    communicationPreferences: CommunicationPreferences
    createdAt: Date!
    updatedAt: Date!
  }

  type GuestPreferences {
    roomType: String
    bedType: String
    floor: String
    seatingPreference: String
    cuisinePreferences: [String!]
    dietaryRestrictions: [String!]
    preferredStylist: String
    favoriteServices: [String!]
    allergies: [String!]
  }

  type CommunicationPreferences {
    email: Boolean!
    sms: Boolean!
    phone: Boolean!
  }
`;
//# sourceMappingURL=typeDefs.js.map