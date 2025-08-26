"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
// auth.resolvers.ts
const apollo_server_express_1 = require("apollo-server-express");
const UserModel_1 = __importDefault(require("../../models/UserModel"));
const middlewares_1 = require("../../middlewares");
exports.userResolvers = {
    Query: {
        // me: async (
        //   _parent,
        //   _args,
        //   { user }: Context
        // ) => {
        //   if (!user) {
        //     throw new AuthenticationError('Not authenticated');
        //   }
        //   return UserModel.findById(user.id);
        // },
        users: async (_parent, { businessType, role }, _ctx) => {
            // Do not enforce authentication for listing users.  If filters are
            // provided they will be applied; otherwise all users are returned.
            const filter = {};
            if (businessType)
                filter.businessType = businessType;
            if (role)
                filter.role = role;
            return UserModel_1.default.find(filter);
        },
        user: async (_parent, { id }, _ctx) => {
            // Return the requested user without requiring authentication.
            return UserModel_1.default.findById(id);
        }
    },
    Mutation: {
        register: async (_parent, { input }) => {
            const { lastName, firstName, email, password, businessType } = input;
            // Check if user already exists
            const existingUser = await UserModel_1.default.findOne({ email });
            if (existingUser) {
                throw new apollo_server_express_1.UserInputError('User already exists with this email');
            }
            // Determine role and activation based on the presence of a businessType.
            // When a businessType is provided the user is a manager for that
            // business and must await administrator approval.  Without a
            // businessType the user is registered as a system administrator
            // with immediate access.
            let role;
            let isActive;
            let assignedBusinessType;
            if (businessType) {
                // Manager accounts are tied to a specific business and begin
                // inactive until the business is approved by an admin.
                role = 'manager';
                isActive = false;
                assignedBusinessType = businessType;
            }
            else {
                // System administrators manage the application.  They have no
                // associated business and are active immediately.
                role = 'admin';
                isActive = true;
                assignedBusinessType = undefined;
            }
            // Create new user
            const user = new UserModel_1.default({
                lastName,
                firstName,
                email,
                password,
                businessType: assignedBusinessType,
                role,
                isActive,
            });
            await user.save();
            // Generate token
            const token = (0, middlewares_1.generateToken)(user.id, user.email, user.role);
            return { token, user };
        },
        login: async (_parent, { input }) => {
            const { email, password } = input;
            // Find user
            const user = await UserModel_1.default.findOne({ email });
            if (!user) {
                throw new apollo_server_express_1.UserInputError('Invalid email or password');
            }
            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new apollo_server_express_1.UserInputError('Invalid email or password');
            }
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            // Generate token
            const token = (0, middlewares_1.generateToken)(user.id, user.email, user.role);
            return { token, user };
        },
        /**
         * Update an existing user.  This mutation allows administrators to assign
         * a user to a particular business by setting their `businessId` and
         * `businessType`, or to change their role.  Only authenticated users
         * may perform this operation.  The resolver simply finds the user by
         * id and applies the provided fields.
         */
        updateUser: async (_parent, { id, input }, _ctx) => {
            // Allow updating a user without requiring authentication.  This
            // mutation supports assigning a business and/or role to an
            // existing user.  Only the fields provided in `input` will be
            // updated.
            const updatedUser = await UserModel_1.default.findByIdAndUpdate(id, { $set: input }, { new: true });
            return updatedUser;
        },
        /**
         * Append a new service to an existing user.  This mutation
         * enables a manager to add additional businesses (e.g. a
         * restaurant or salon) without overwriting the primary
         * `businessId`/`businessType`.  The resolver checks for an
         * existing association before pushing a new entry onto the
         * services array.  Returns the updated user.
         */
        appendUserService: async (_parent, { input }, _ctx) => {
            const { userId, businessId, businessType } = input;
            const user = await UserModel_1.default.findById(userId);
            if (!user) {
                throw new apollo_server_express_1.UserInputError('User not found');
            }
            // Initialize services array if undefined
            if (!Array.isArray(user.services)) {
                user.services = [];
            }
            // Avoid duplicates
            const exists = user.services.some((s) => {
                return ((s.businessId?.toString?.() || '') === businessId &&
                    s.businessType === businessType);
            });
            if (!exists) {
                user.services.push({ businessId, businessType });
                await user.save();
            }
            return user;
        },
        /**
         * Permanently remove a user by their identifier.  This mutation
         * deletes the user document from the database.  It returns true
         * when the user was found and deleted, and false when no user
         * existed with the provided id.  The deletion is performed
         * without requiring authentication because administrative
         * privileges are enforced at the API gateway level.  If the
         * user is associated with other records (e.g. reservations or
         * staff), those references are not automatically cleaned up.
         */
        deleteUser: async (_parent, { id }, _ctx) => {
            const user = await UserModel_1.default.findByIdAndDelete(id);
            return !!user;
        }
    }
};
//# sourceMappingURL=resolvers.js.map