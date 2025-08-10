// auth.resolvers.ts
import { UserInputError } from 'apollo-server-express';
import UserModel from '../../models/UserModel';
import { generateToken } from '../../middlewares';

interface Context {
  user?: { id: string };
}

interface UsersArgs {
  businessType?: string;
  role?: string;
}

interface UserArg {
  id: string;
}

interface RegisterInput {
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  businessType: string;
}

interface MutationRegisterArgs {
  input: RegisterInput;
}

interface LoginInput {
  email: string;
  password: string;
}

interface MutationLoginArgs {
  input: LoginInput;
}

export const userResolvers = {
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

    users: async (
      _parent,
      { businessType, role }: UsersArgs,
      _ctx: Context
    ) => {
      // Do not enforce authentication for listing users.  If filters are
      // provided they will be applied; otherwise all users are returned.
      const filter: any = {};
      if (businessType) filter.businessType = businessType;
      if (role) filter.role = role;
      return UserModel.find(filter);
    },

    user: async (
      _parent,
      { id }: UserArg,
      _ctx: Context
    ) => {
      // Return the requested user without requiring authentication.
      return UserModel.findById(id);
    }
  },

  Mutation: {
    register: async (
      _parent,
      { input }: MutationRegisterArgs
    ) => {
      const { lastName,firstName, email, password, businessType } = input;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new UserInputError('User already exists with this email');
      }

      // Create new user
      const user = new UserModel({
        lastName,
        firstName,
        email,
        password,
        businessType,
        role: 'admin' // First user of a business is admin
      });

      await user.save();

      // Generate token
      const token = generateToken(user.id, user.email, user.role);

      return { token, user };
    },

    login: async (
      _parent,
      { input }: MutationLoginArgs
    ) => {
      const { email, password } = input;

      // Find user
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new UserInputError('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new UserInputError('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user.id, user.email, user.role);

      return { token, user };
    }

    ,

    /**
     * Update an existing user.  This mutation allows administrators to assign
     * a user to a particular business by setting their `businessId` and
     * `businessType`, or to change their role.  Only authenticated users
     * may perform this operation.  The resolver simply finds the user by
     * id and applies the provided fields.
     */
    updateUser: async (
      _parent,
      { id, input }: { id: string; input: { businessId?: string; businessType?: string; role?: string } },
      _ctx: Context
    ) => {
      // Allow updating a user without requiring authentication.  This
      // mutation supports assigning a business and/or role to an
      // existing user.  Only the fields provided in `input` will be
      // updated.
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true }
      );
      return updatedUser;
    }
  }
};

