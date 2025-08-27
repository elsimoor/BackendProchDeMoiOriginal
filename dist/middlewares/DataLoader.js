"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchRestaurant = exports.BatchUStaff = exports.BatchService = exports.BatchTable = exports.BatchRoom = exports.BatchBusiness = exports.BatchUsers = void 0;
const RoomModel_1 = __importDefault(require("../models/RoomModel"));
const ServiceModel_1 = __importDefault(require("../models/ServiceModel"));
const StaffModel_1 = __importDefault(require("../models/StaffModel"));
// Import the Client model used to load businesses/clients.  Previously we
// loaded Hotel documents directly; in order to support multi‑tenant clients
// we now resolve business IDs to the new Client model instead.
const ClientModel_1 = __importDefault(require("../models/ClientModel"));
const TableModel_1 = __importDefault(require("../models/TableModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const RestaurantModel_1 = __importDefault(require("../models/RestaurantModel"));
const BatchUsers = async (ids) => {
    const users = await UserModel_1.default.find({ _id: { $in: ids } });
    return ids.map((id) => users.find((user) => user.id == id));
};
exports.BatchUsers = BatchUsers;
const BatchBusiness = async (ids) => {
    // Batch load clients by ID.  A single Client represents a tenant or
    // organisation using the reservation system.  This loader returns
    // documents in the same order as the incoming IDs.  Missing IDs
    // produce `undefined` in the resulting array to satisfy DataLoader’s
    // contract.
    const businesses = await ClientModel_1.default.find({ _id: { $in: ids } });
    return ids.map((id) => businesses.find((business) => business && business.id == id));
};
exports.BatchBusiness = BatchBusiness;
const BatchRoom = async (ids) => {
    // Implement your logic to batch load rooms
    const rooms = await RoomModel_1.default.find({ _id: { $in: ids } });
    return ids.map((id) => rooms.find((room) => room.id == id));
};
exports.BatchRoom = BatchRoom;
const BatchTable = async (ids) => {
    // Implement your logic to batch load tables
    // Assuming you have a TableModel
    const tables = await TableModel_1.default.find({ _id: { $in: ids } });
    return ids.map((id) => tables.find((table) => table.id == id));
};
exports.BatchTable = BatchTable;
const BatchService = async (ids) => {
    // Implement your logic to batch load services
    // Assuming you have a ServiceModel
    const services = await ServiceModel_1.default.find({ _id: { $in: ids } });
    return ids.map((id) => services.find((service) => service.id == id));
};
exports.BatchService = BatchService;
const BatchUStaff = async (ids) => {
    // Implement your logic to batch load staff
    const staff = await StaffModel_1.default.find({ _id: { $in: ids }, role: 'staff' });
    return ids.map((id) => staff.find((s) => s.id == id));
};
exports.BatchUStaff = BatchUStaff;
const BatchRestaurant = async (ids) => {
    // Implement your logic to batch load restaurants
    const restaurants = await RestaurantModel_1.default.find({ _id: { $in: ids } });
    return ids.map((id) => restaurants.find((restaurant) => restaurant && restaurant.id == id));
};
exports.BatchRestaurant = BatchRestaurant;
//# sourceMappingURL=DataLoader.js.map