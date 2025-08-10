import { gql } from 'apollo-server-express';

export const privatisationTypeDef = gql`
  type PrivatisationOption {
    id: ID!
    nom: String!
    description: String
    type: String!
    capaciteMaximale: Int!
    dureeMaximaleHeures: Int!
    menusDeGroupe: [String!]!
    # Détails des menus de groupe (permet de spécifier un nom, une description et un prix)
    menusDetails: [MenuDetail!]
    # Tarif global ou forfaitaire pour la privatisation
    tarif: Float
    # Conditions générales applicables à cette option de privatisation
    conditions: String
    restaurantId: ID!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreatePrivatisationOptionInput {
    nom: String!
    description: String
    type: String!
    capaciteMaximale: Int!
    dureeMaximaleHeures: Int!
    menusDeGroupe: [String!]
    menusDetails: [MenuDetailInput!]
    tarif: Float
    conditions: String
    restaurantId: ID!
  }

  input UpdatePrivatisationOptionInput {
    nom: String
    description: String
    type: String
    capaciteMaximale: Int
    dureeMaximaleHeures: Int
    menusDeGroupe: [String!]
    menusDetails: [MenuDetailInput!]
    tarif: Float
    conditions: String
  }

  extend type Query {
    privatisationOptionsByRestaurant(restaurantId: ID!): [PrivatisationOption!]!
    privatisationOption(id: ID!): PrivatisationOption
  }

  extend type Mutation {
    createPrivatisationOption(input: CreatePrivatisationOptionInput!): PrivatisationOption!
    updatePrivatisationOption(id: ID!, input: UpdatePrivatisationOptionInput!): PrivatisationOption!
    deletePrivatisationOption(id: ID!): Boolean!
  }

  # Un menu détaillé pour une privatisation (nom, description, prix par personne ou par menu)
  type MenuDetail {
    nom: String!
    description: String
    prix: Float!
  }

  # Input correspondant au menu détaillé
  input MenuDetailInput {
    nom: String!
    description: String
    prix: Float!
  }
`;
