"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuItemTypeDef = void 0;
// menuItem.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.menuItemTypeDef = (0, apollo_server_express_1.gql) `

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
//# sourceMappingURL=typeDefs.js.map