import { gql } from 'apollo-server-express';

/*
 * GraphQL schema for invoices.
 *
 * Defines the Invoice type along with nested InvoiceItem type and
 * corresponding input types.  Exposes queries for fetching a list of
 * invoices or a single invoice by identifier.  Mutations allow
 * creating, updating and deleting invoices.  A special
 * generateInvoicePdf mutation returns a base64-encoded PDF document
 * representing the invoice.
 */
export const invoiceTypeDef = gql`
  type InvoiceItem {
    description: String!
    price: Float!
    quantity: Int!
    total: Float!
  }

  type Invoice {
    id: ID!
    reservation: Reservation
    reservationId: ID!
    businessId: ID!
    date: Date!
    items: [InvoiceItem!]!
    total: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  input InvoiceItemInput {
    description: String!
    price: Float!
    quantity: Int!
  }

  input InvoiceInput {
    reservationId: ID!
    businessId: ID!
    items: [InvoiceItemInput!]!
    total: Float!
  }

  extend type Query {
    invoices(businessId: ID!): [Invoice!]!
    invoice(id: ID!): Invoice
  }

  extend type Mutation {
    createInvoice(input: InvoiceInput!): Invoice!
    updateInvoice(id: ID!, input: InvoiceInput!): Invoice!
    deleteInvoice(id: ID!): Boolean!
    # Generates a PDF for the specified invoice and returns it as a
    # base64-encoded string.  Clients can decode this string to
    # download or display the PDF.
    generateInvoicePdf(id: ID!): String!
  }
`;