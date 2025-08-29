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

  # Pagination object for invoices.  Returned when querying invoices
  # with pagination parameters.  Includes the list of invoices and
  # metadata about the current page and total document counts.
  type InvoicePagination {
    docs: [Invoice!]!
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

  extend type Query {
    # Retrieve paginated invoices for the specified business.  Sorted by
    # creation date descending.  Optional page and limit arguments
    # control pagination.
    invoices(businessId: ID!, page: Int, limit: Int): InvoicePagination!
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