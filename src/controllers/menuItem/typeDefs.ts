// menuItem.schema.ts
import { gql } from 'apollo-server-express';

export const menuItemTypeDef = gql`

  type MenuItem {
    id: ID!
    restaurantId: ID!
    name: String!
    description: String
    category: String!
    price: Float!
    prepTime: Int
    available: Boolean!
    popular: Boolean!
    allergens: [String!]!
    dietaryInfo: [String!]!
    spiceLevel: String
    ingredients: [String!]!
    nutritionalInfo: NutritionalInfo
    images: [String!]!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type NutritionalInfo {
    calories: Int
    protein: Float
    fat: Float
    carbs: Float
  }
`;
