import { gql } from 'apollo-server-express';

/**
 * GraphQL schema for payments.
 *
 * Defines the Payment type representing a transaction processed via
 * Stripe.  Also defines an input for requesting a new checkout
 * session, along with the PaymentSessionResponse returned to the
 * client.  Queries allow fetching individual payments or listing
 * payments for a given business (client).
 */
export const paymentTypeDef = gql`
  type Payment {
    id: ID!
    reservationId: ID
    invoiceId: ID
    businessId: ID!
    amount: Float!
    currency: String!
    status: String!
    stripeSessionId: String
    stripePaymentIntentId: String
    stripeCustomerId: String
    paymentMethod: String
    receiptUrl: String
    createdAt: Date!
    updatedAt: Date!

    # Associated reservation document, if available.  Resolved from
    # reservationId via the payment resolver.
    reservation: Reservation
    # Associated invoice document, if available.  Resolved from
    # invoiceId via the payment resolver.
    invoice: Invoice
  }

  type PaymentSessionResponse {
    sessionId: String!
    url: String!
  }

  input CreatePaymentSessionInput {
    reservationId: ID!
    # URL to redirect the client upon successful payment completion.
    successUrl: String!
    # URL to redirect the client if they cancel or abandon checkout.
    cancelUrl: String!
  }

  extend type Query {
    # Retrieve a list of payment records for the specified business.
    payments(businessId: ID!): [Payment!]!
    # Fetch a single payment by its identifier.
    payment(id: ID!): Payment
  }

  extend type Mutation {
    # Initiates a new Stripe checkout session for the given reservation.
    # Returns a sessionId and url which the client should use to
    # redirect the user to Stripe's hosted payment page.
    createPaymentSession(input: CreatePaymentSessionInput!): PaymentSessionResponse!
  }
`;