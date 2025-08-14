// Export definitions and resolvers for the RoomType entity.  A room type
// represents a category of rooms within a hotel (e.g. Standard,
// Deluxe).  Hotels can create their own custom room types via
// mutations exposed in this module.

export { roomTypeResolvers } from './resolvers';
export { roomTypeTypeDef } from './typeDefs';