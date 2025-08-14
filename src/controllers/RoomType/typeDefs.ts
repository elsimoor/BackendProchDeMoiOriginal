import { gql } from 'apollo-server-express';

/**
 * GraphQL schema definition for RoomType.  A RoomType belongs to a
 * hotel and defines a human-readable name used to categorise rooms.
 *
 * Queries:
 *   roomTypes(hotelId: ID!): fetch all active room types for a
 *     particular hotel.  Deleted types (isActive = false) are
 *     excluded.
 *   roomType(id: ID!): fetch a single room type by its identifier.
 *
 * Mutations:
 *   createRoomType(input: RoomTypeInput!): create a new room type for
 *     a hotel.  The combination of hotelId and name must be unique.
 *   updateRoomType(id: ID!, input: RoomTypeInput!): update the name
 *     of an existing room type.  HotelId cannot be changed.
 *   deleteRoomType(id: ID!): mark a room type as inactive.  Returns
 *     true if the type was found and marked inactive, false
 *     otherwise.
 */
export const roomTypeTypeDef = gql`
  type RoomType {
    id: ID!
    hotelId: ID!
    name: String!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  input RoomTypeInput {
    hotelId: ID!
    name: String!
  }

  extend type Query {
    roomTypes(hotelId: ID!): [RoomType!]!
    roomType(id: ID!): RoomType
  }

  extend type Mutation {
    createRoomType(input: RoomTypeInput!): RoomType!
    updateRoomType(id: ID!, input: RoomTypeInput!): RoomType
    deleteRoomType(id: ID!): Boolean!
  }
`;