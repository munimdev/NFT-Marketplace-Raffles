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
export const getAllRaffles = async () => {
  const res = await api.get("/api/raffles/all");
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
