// reservation.schema.ts
import { gql } from 'apollo-server-express';

export const reservationTypeDef = gql`

  type Reservation {
    id: ID!
    # The client (tenant) that owns this reservation.  This replaces the
    # previous businessId field which returned a Hotel; now any
    # reservation is linked to a Client regardless of the module type.
    client: Client
    # Indicates the type of reservation: "hotel" (for rooms), "restaurant" or
    # "salon" (for services).  This naming remains for backwards
    # compatibility with existing models.
    businessType: String!
    customerId: User
    customerInfo: CustomerInfo!

    # Hotel specific
    roomId: Room
    checkIn: Date
    checkOut: Date
    guests: Int

    # Restaurant specific
    tableId: Table
    partySize: Int

    # Salon specific
    serviceId: Service
    staffId: Staff

    # Common fields
    date: Date!
    time: String
    duration: Int
    status: String!
    totalAmount: Float
    paymentStatus: String!
    notes: String
    specialRequests: String
    reminderSent: Boolean!
    source: String!
    # The payment method chosen by the client when the reservation
    # was created.  This corresponds to the  field of one of
    # the restaurant’s paymentMethods.  When null, the default
    # payment method applies (typically card).
    paymentMethod: String
    # URL of an uploaded reservation document (e.g. Word file) that
    # contains additional requirements or explanations for the
    # reservation.  When null no supplementary document is attached.
    reservationFileUrl: String
    createdAt: Date!
    updatedAt: Date!
  }

  type CustomerInfo {
    name: String!
    email: String!
    phone: String!
  }

  input CreateReservationV2Input {
    date: String!
    heure: String!
    personnes: Int!
    emplacement: String
    source: String!
    restaurantId: ID!
    customerInfo: CustomerInfoInput!
    # Optional payment method selected by the client.  Must match one
    # of the restaurant’s configured paymentMethods.  When absent
    # the default payment method is used.
    paymentMethod: String
    # Optional URL for a reservation file with additional details.
    reservationFileUrl: String
  }

  input CreatePrivatisationV2Input {
    date: String!
    heure: String!
    dureeHeures: Int!
    type: String!
    menu: String!
    espace: String!
    personnes: Int!
    source: String!
    restaurantId: ID!
    customerInfo: CustomerInfoInput!
    paymentMethod: String
    reservationFileUrl: String
  }

  # Mutations to confirm or cancel a reservation.  confirmReservation
  # should be called after a successful Stripe payment to finalise
  # the booking and generate an invoice.  cancelReservation
  # removes the reservation and any invoice when the payment is
  # aborted.
  extend type Mutation {
    confirmReservation(id: ID!): Reservation!
    cancelReservation(id: ID!): Boolean!

    # Generate a PDF document summarising a reservation.  The
    # returned value is a base64‑encoded representation of the PDF
    # which can be downloaded on the client side.  If the
    # reservation does not exist an error is thrown.
    generateReservationPdf(id: ID!): String!
  }
`;
