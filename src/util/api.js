import axios from "axios";
const dotenv = require("dotenv");
dotenv.config();

export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_DATABASE_URL,
});

// console.log(
//   "process.env.BACKEND_DATABASE_URL",
//   process.env.REACT_APP_BACKEND_DATABASE_URL
// );

export const createDummyRaffle = async () => {
  const res = await api.get("/api/raffles/dummy");
  return res.data;
};
export const createRaffle = async (payload) => {
  const res = await api.post("/api/raffles/create", payload);
  return res.data;
};
export const getAllRaffles = async () => {
  const res = await api.get("/api/raffles/all");
  return res.data;
};
export const raffleHistory = async () => {
  const res = await api.get("/api/raffles/history");
  return res.data;
};
export const getUserRaffles = async (payload) => {
  const res = await api.get(
    `/api/raffles/${payload.raffleId}/tickets/${payload.address}`
  );
  return res.data;
};
export const purchaseTickets = async (payload) => {
  const res = await api.post(
    `/api/raffles/${payload.raffleId}/purchase`,
    payload
  );
  return res.data;
};

export const createUser = async (payload) => {
  const res = await api.post("/api/users/create", payload);
  return res.data;
};
export const searchUser = async (payload) => {
  const res = await api.post("/api/users/search", payload);
  return res.data;
};
export const banUser = async (payload) => {
  const res = await api.post("/api/users/ban", payload);
  return res.data;
};
export const unbanUser = async (payload) => {
  const res = await api.post("/api/users/unban", payload);
  return res.data;
};
export const addPoints = async (payload) => {
  const res = await api.post("/api/users/points/add", payload);
  return res.data;
};
