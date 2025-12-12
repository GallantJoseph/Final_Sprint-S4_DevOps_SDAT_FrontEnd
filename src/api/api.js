// this file connects our front end to our backend 
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

export const fetchAirports = () => API.get('/api/airports');
export const fetchFlightsDepartures = (code) => API.get(`/api/flights/departures?airportCode=${code}`);
export const fetchFlightsArrivals = (code) => API.get(`/api/flights/arrivals?airportCode=${code}`);
export const fetchAirportByCode = (code) => API.get(`/api/airports/code/${code}`);