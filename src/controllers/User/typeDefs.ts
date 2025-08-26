// auth.schema.ts
import { gql } from 'apollo-server-express';

export const userTypeDefs = gql`

  type User {
    id: ID!
    lastName: String
    firstName: String
    email: String!
    role: String!
    businessType: String
    businessId: ID
    avatar: String
    phone: String
    isActive: Boolean!
    lastLogin: Date
    preferences: UserPreferences
    # List of additional services managed by the user.  Each entry
    # identifies a business by its type and id.  This field is
    # populated via the appendUserService mutation and allows
    # dashboards to display quick switches between multiple
    # businesses.  When empty the user manages only the primary
    # business referenced by the businessId and businessType fields.
    services: [UserService!]
    createdAt: Date!
    updatedAt: Date!
  }

  """
  Represents a service/business that a user manages in addition to
  their primary business.  The businessId corresponds to the
  identifier of the hotel/restaurant/salon entity and
  businessType indicates which collection it belongs to.  These
  entries do not track approval status; instead the business’s own
  isActive property should be consulted when determining
  accessibility.
  """
  type UserService {
    businessId: ID!
    businessType: String!
  }

  """
  Input type for appending a new service to a user.  Provide the
  userId of the account to update along with the businessId and
  businessType of the service that has been created.  The
  appendUserService mutation will check for duplicates and only
  push a new entry when the service is not already associated with
  the user.
  """
  input AppendUserServiceInput {
    userId: ID!
    businessId: ID!
    businessType: String!
  }

  type UserPreferences {
    notifications: NotificationPreferences
    language: String
    timezone: String
  }

  type NotificationPreferences {
    email: Boolean
    sms: Boolean
    push: Boolean
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    lastName: String!
    firstName: String!
    email: String!
    password: String!
    # Optional business type.  When provided, the user will be
    # registered as a manager for the specified business and their
    # account will remain inactive until an administrator approves
    # the business.  When omitted, the user is registered as a
    # system administrator with no associated business and is
    # activated immediately.
    businessType: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Input type for updating a user.  Allows assigning a businessId and businessType
  # to link a user to a specific business (hotel/restaurant/salon) or update their role.
  input UserUpdateInput {
    businessId: ID
    businessType: String
    role: String
  }
`;
