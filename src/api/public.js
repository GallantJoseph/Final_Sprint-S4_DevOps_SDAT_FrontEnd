// this file allows us to access the file from any
//  computer in our household by typing "npm run dev -- --host" or --host
import axios from "axios";

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default publicApi;
