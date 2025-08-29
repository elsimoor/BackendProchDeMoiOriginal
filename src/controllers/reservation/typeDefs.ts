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
    # ISO currency code for the reservation amount.  This field
    # represents the currency selected in the business’s settings
    # (e.g. MAD for Moroccan Dirhams or USD for US Dollars).  The
    # value is derived on the fly from the business associated with
    # the reservation rather than stored directly on the document.
    # Clients can use this to display amounts without converting
    # between currencies.
    currency: String
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

  # Result returned after cancelling a hotel reservation.  When
  # cancelling a reservation, the backend evaluates any configured
  # cancellation policies to determine the refund amount.  The
  #  flag indicates whether the cancellation succeeded and
  #  contains the computed refund (in the same
  # currency as the reservation).  A refundAmount of 0 means no
  # refund is due.
  type CancellationResult {
    success: Boolean!
    refundAmount: Float!
  }

  # Pagination object for reservations.  When querying reservations
  # with pagination parameters the server returns a ReservationPagination
  # which includes the list of reservations (docs) along with
  # metadata about the current page, total number of documents and
  # navigation flags.  The field names mirror those returned by
  # mongoose-paginate-v2.
  type ReservationPagination {
    docs: [Reservation!]!
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

    # Cancel a hotel reservation after payment has been captured.
    # The cancellation laws configured for the business are applied
    # to compute the refund percentage based on the number of days
    # before check‑in.  The  argument determines
    # whether the refund is processed automatically via webhook
    # (when cancelledBy="user") or left for manual handling (when
    # cancelledBy="manager").  Returns a CancellationResult with
    # success and refundAmount.
    cancelHotelReservation(id: ID!, cancelledBy: String!): CancellationResult!

    # Generate a PDF document summarising a reservation.  The
    # returned value is a base64‑encoded representation of the PDF
    # which can be downloaded on the client side.  If the
    # reservation does not exist an error is thrown.
    generateReservationPdf(id: ID!): String!
  }
`;
