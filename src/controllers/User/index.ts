import { userResolvers } from "./resolvers";
import { userTypeDefs } from "./typeDefs";
import {GraphQlDateTime} from 'graphql-iso-date'


const customDateScalarResolver = {
    Date: GraphQlDateTime
  }



export { customDateScalarResolver,userResolvers, userTypeDefs };
