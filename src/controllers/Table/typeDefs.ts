// src/graphql/typeDefs/table.ts

import { gql } from 'apollo-server-express';

export const tableTypeDefs = gql`

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

