import { gql } from 'apollo-server-express';

export const dashboardTypeDef = gql`

  type DashboardMetrics {
    reservationsTotales: Int!
    chiffreAffaires: Float!
    tauxRemplissage: Float!
  }

  type CalendarDayHeat {
    date: String!
    count: Int!
  }

  type ReservationInfo {
    id: ID!
    date: String
    heure: String
    restaurant: Restaurant
    personnes: Int
    statut: String
  }

  type AvailabilitySlot {
    time: String!
    available: Boolean!
  }

  extend type Query {
    dashboardMetrics(restaurantId: ID!, from: String, to: String): DashboardMetrics
    dashboardCalendar(restaurantId: ID!, month: String!): [CalendarDayHeat!]
    reservationsByDate(restaurantId: ID!, date: String!): [ReservationInfo]
    availability(restaurantId: ID!, date: String!, partySize: Int!): [AvailabilitySlot!]!
  }

  input UpdateReservationInput {
      heure: String
      personnes: Int
  }

  extend type Mutation {
      updateReservationDetails(id: ID!, input: UpdateReservationInput!): ReservationInfo
      # cancelReservation(id: ID!): ReservationInfo
      cancelReservationAdmin(id: ID!): ReservationInfo
  }
`;
