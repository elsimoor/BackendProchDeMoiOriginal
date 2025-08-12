import { gql } from 'apollo-server-express';

/**
 * GraphQL type definitions for LandingCard
 *
 * Landing cards are promotional entries shown on the public landing page.
 * They can be created, updated and deleted by business owners from
 * their dashboard.  Each card belongs to a business and includes
 * customisable fields such as a title, description, image and price.
 */
export const landingCardTypeDefs = gql`

  type LandingCard {
    id: ID!
    businessId: ID!
    businessType: String!
    title: String!
    description: String
    image: String
    price: Float
    rating: Float
    location: String
    tags: [String]
    amenities: [String]
    specialOffer: Boolean
    # Indicates if this card is the featured card for its business.  Only
    # one card per business should be featured at any time.  Featured cards
    # are displayed on the public landing page for the business.
    isFeatured: Boolean
    createdAt: Date!
    updatedAt: Date!
  }

  input LandingCardInput {
    businessId: ID!
    businessType: String!
    title: String!
    description: String
    image: String
    price: Float
    rating: Float
    location: String
    tags: [String]
    amenities: [String]
    specialOffer: Boolean
    # Optional flag to directly set the card as featured when creating or
    # updating.  Generally this should be false on creation; featured
    # status is managed via the setFeaturedLandingCard mutation.
    isFeatured: Boolean
  }

  extend type Query {
    # Return all landing cards.  Optionally filter by businessType or businessId.
    landingCards(businessType: String, businessId: ID, isFeatured: Boolean): [LandingCard!]!

    # Return the single featured landing card for a given business.  A
    # featured card is the one with isFeatured = true.  Returns null
    # if no card has been marked as featured.
    featuredLandingCard(businessType: String!, businessId: ID!): LandingCard
  }

  extend type Mutation {
    # Create a new landing card.  The input must include businessId,
    # businessType and title; other fields are optional.
    createLandingCard(input: LandingCardInput!): LandingCard!
    # Update an existing landing card.  Only the fields provided in
    # input will be updated.
    updateLandingCard(id: ID!, input: LandingCardInput!): LandingCard!
    # Delete a landing card by id.  Returns true if deletion was
    # successful.
    deleteLandingCard(id: ID!): Boolean!

    # Set the featured landing card for a business.  This mutation will
    # unset the isFeatured flag on all other landing cards belonging
    # to the specified business before setting it on the selected card.
    setFeaturedLandingCard(id: ID!, businessId: ID!, businessType: String!): LandingCard!
  }
`;