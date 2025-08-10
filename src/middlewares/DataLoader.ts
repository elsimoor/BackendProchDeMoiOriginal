import RoomModel from "../models/RoomModel";
import ServiceModel from "../models/ServiceModel";
import StaffModel from "../models/StaffModel";

// Import the Client model used to load businesses/clients.  Previously we
// loaded Hotel documents directly; in order to support multi‑tenant clients
// we now resolve business IDs to the new Client model instead.
import ClientModel from "../models/ClientModel";
import TableModel from "../models/TableModel";
import UserModel from "../models/UserModel";
import RestaurantModel from "../models/RestaurantModel";



const BatchUsers = async (ids: any) => {
  const users = await UserModel.find({ _id: { $in: ids } })
  return ids.map((id: any) => users.find((user: any) => user.id == id));
};


const BatchBusiness = async (ids: any) => {
  // Batch load clients by ID.  A single Client represents a tenant or
  // organisation using the reservation system.  This loader returns
  // documents in the same order as the incoming IDs.  Missing IDs
  // produce `undefined` in the resulting array to satisfy DataLoader’s
  // contract.
  const businesses = await ClientModel.find({ _id: { $in: ids } });
  return ids.map((id: any) => businesses.find((business: any) => business && business.id == id));
};

const BatchRoom = async (ids: any) => {
  // Implement your logic to batch load rooms
  const rooms = await RoomModel.find({ _id: { $in: ids } });
  return ids.map((id: any) => rooms.find((room: any) => room.id == id));
};

const BatchTable = async (ids: any) => {
  // Implement your logic to batch load tables
  // Assuming you have a TableModel
  const tables = await TableModel.find({ _id: { $in: ids } });
  return ids.map((id: any) => tables.find((table: any) => table.id == id));
};

const BatchService = async (ids: any) => {
  // Implement your logic to batch load services
  // Assuming you have a ServiceModel
  const services = await ServiceModel.find({ _id: { $in: ids } });
  return ids.map((id: any) => services.find((service: any) => service.id == id));
};


const BatchUStaff = async (ids: any) => {
  // Implement your logic to batch load staff
  const staff = await StaffModel.find({ _id: { $in: ids }, role: 'staff' });
  return ids.map((id: any) => staff.find((s: any) => s.id == id));
};


const BatchRestaurant = async (ids: any) => {
  // Implement your logic to batch load restaurants
  const restaurants = await RestaurantModel.find({ _id: { $in: ids }});
  return ids.map((id: any) => restaurants.find((restaurant: any) => restaurant && restaurant.id == id));
}




export {
  BatchUsers,
  BatchBusiness,
  BatchRoom,
  BatchTable,
  BatchService,
  BatchUStaff,
  BatchRestaurant
};
