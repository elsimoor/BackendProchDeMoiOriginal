"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomTypeDef = void 0;
// room.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.roomTypeDef = (0, apollo_server_express_1.gql) `

  type Room {
    id: ID!
    hotelId: Hotel
    number: String!
    type: String!
    floor: Int
    capacity: Int!
    price: Float!
    size: Int
    status: String!
    amenities: [String!]!
    features: [String!]!
    condition: String!
    lastCleaned: Date
    nextMaintenance: Date
    images: [String!]!
    isActive: Boolean!
    # Newly added descriptive fields
    bedType: [String]
    numberOfBeds: Int
    numberOfBathrooms: Int
    description: String
    createdAt: Date!
    updatedAt: Date!
  }

  extend type Query {
    """
    Return a list of rooms that are available for the given hotel and date
    range.  A room is considered available if it is active, has status
    "available" and there is no existing hotel reservation with
    overlapping check‑in/check‑out dates for that room.  Both
    parameters are required and should be ISO formatted dates.
    """
    availableRooms(hotelId: ID!, checkIn: Date!, checkOut: Date!, adults: Int!, children: Int!): [Room!]!
    availableRoomsCount(hotelId: ID!, checkIn: Date!, checkOut: Date!, adults: Int!, children: Int!): Int!
  }
`;
//# sourceMappingURL=typeDefs.js.map