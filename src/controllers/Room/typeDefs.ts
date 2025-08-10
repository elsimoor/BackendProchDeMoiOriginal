// room.schema.ts
import { gql } from 'apollo-server-express';

export const roomTypeDef = gql`

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
