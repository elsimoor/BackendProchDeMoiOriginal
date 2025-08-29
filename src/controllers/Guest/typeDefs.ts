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

  # Pagination object for guests.  Contains the list of guest documents
  # and additional information about pagination such as the current
  # page and total number of pages.  Mirrors the structure returned by
  # mongoose-paginate-v2.
  type GuestPagination {
    docs: [Guest!]!
    totalDocs: Int!
    limit: Int!
    totalPages: Int!
    page: Int!
    pagingCounter: Int!
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
    prevPage: Int
    nextPage: Int
  }
`;
