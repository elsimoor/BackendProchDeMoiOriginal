import { skip } from "graphql-resolvers";
import { verifyToken } from ".";

export const isAuthenticated = async (_, __, { req }) => {
  try {
    await verifyToken(req);
    return skip;
  } catch (error) {
    throw new Error("Access Forbiden");
  }
};

