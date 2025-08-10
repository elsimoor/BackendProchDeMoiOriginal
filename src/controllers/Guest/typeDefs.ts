// guest.schema.ts
import { gql } from 'apollo-server-express';

export const guestTypeDef = gql`

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
