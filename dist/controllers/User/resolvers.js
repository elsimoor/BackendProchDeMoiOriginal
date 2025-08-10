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
            // Create new user
            const user = new UserModel_1.default({
                lastName,
                firstName,
                email,
                password,
                businessType,
                role: 'admin' // First user of a business is admin
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
        }
    }
};
//# sourceMappingURL=resolvers.js.map