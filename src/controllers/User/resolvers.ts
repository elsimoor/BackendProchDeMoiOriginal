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
  businessType?: string | null;
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
    removeAdminRoleFromServices: async () => {
      // Update all users with role "admin" and businessType in ["hotel", "restaurant", "salon"]
      // to have role "manager"
      await UserModel.updateMany(
        {
          role: "admin",
          businessType: { $in: ["hotel", "restaurant", "salon"] }
        },
        {
          $set: { role: "manager" }
        }
      );
      return true;
    },

    register: async (
      _parent,
      { input }: MutationRegisterArgs
    ) => {
      const { lastName, firstName, email, password, businessType } = input;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new UserInputError('User already exists with this email');
      }

      // Determine role and activation based on the presence of a businessType.
      // When a businessType is provided the user is a manager for that
      // business and must await administrator approval.  Without a
      // businessType the user is registered as a system administrator
      // with immediate access.
      let role: string;
      let isActive: boolean;
      let assignedBusinessType: string | undefined;
      if (businessType) {
        // Manager accounts are tied to a specific business and begin
        // inactive until the business is approved by an admin.
        role = 'manager';
        isActive = false;
        assignedBusinessType = businessType;
      } else {
        // System administrators manage the application.  They have no
        // associated business and are active immediately.
        role = 'admin';
        isActive = true;
        assignedBusinessType = undefined;
      }

      // Create new user
      const user = new UserModel({
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

    ,

    /**
     * Append a new service to an existing user.  This mutation
     * enables a manager to add additional businesses (e.g. a
     * restaurant or salon) without overwriting the primary
     * `businessId`/`businessType`.  The resolver checks for an
     * existing association before pushing a new entry onto the
     * services array.  Returns the updated user.
     */
    appendUserService: async (
      _parent: any,
      { input }: { input: { userId: string; businessId: string; businessType: string } },
      _ctx: Context
    ) => {
      const { userId, businessId, businessType } = input;
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new UserInputError('User not found');
      }
      // Initialize services array if undefined
      if (!Array.isArray((user as any).services)) {
        (user as any).services = [];
      }
      // Avoid duplicates
      const exists = (user as any).services.some((s: any) => {
        return (
          (s.businessId?.toString?.() || '') === businessId &&
          s.businessType === businessType
        );
      });
      if (!exists) {
        (user as any).services.push({ businessId, businessType });
        await user.save();
      }
      return user;
    }

    ,

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
    deleteUser: async (
      _parent: any,
      { id }: { id: string },
      _ctx: Context
    ): Promise<boolean> => {
      const user = await UserModel.findByIdAndDelete(id);
      return !!user;
    }
  }
};

