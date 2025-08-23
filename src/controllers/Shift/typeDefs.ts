import { gql } from 'apollo-server-express';

/**
 * GraphQL schema for shifts.  A Shift represents a work period for a
 * staff member belonging to a particular business.  Queries are
 * provided to fetch shifts for a business (optionally by staff and
 * date range) and to fetch a single shift by ID.  Mutations support
 * creating, updating and deleting shifts.  The ShiftInput type
 * mirrors the fields of a Shift except for the automatically managed
 * timestamps and id.
 */
export const shiftTypeDef = gql`
  type Shift {
    id: ID!
    businessId: ID!
    businessType: String!
    staffId: Staff!
    date: Date!
    startTime: String!
    endTime: String!
    notes: String
    createdAt: Date!
    updatedAt: Date!
  }

  input ShiftInput {
    businessId: ID!
    businessType: String!
    staffId: ID!
    date: Date!
    startTime: String!
    endTime: String!
    notes: String
  }

  extend type Query {
    shifts(businessId: ID!, businessType: String!, staffId: ID, startDate: Date, endDate: Date): [Shift!]!
    shift(id: ID!): Shift
  }

  extend type Mutation {
    createShift(input: ShiftInput!): Shift!
    updateShift(id: ID!, input: ShiftInput!): Shift!
    deleteShift(id: ID!): Boolean!
  }
`;