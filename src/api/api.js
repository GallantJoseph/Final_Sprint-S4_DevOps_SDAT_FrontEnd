// this file connects our front end to our backend
import axios from "axios";

// axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Airports / public flight lookups

export function fetchAirports() {
  return API.get("/api/airports");
}

export function fetchAirportByCode(code) {
  return API.get(`/api/airports/code/${code}`);
}

export function fetchFlightsDepartures(code) {
  return API.get(`/api/flights/departures?airportCode=${code}`);
}

export function fetchFlightsArrivals(code) {
  return API.get(`/api/flights/arrivals?airportCode=${code}`);
}

// City API calls

export function fetchCities() {
  return API.get("/cities");
}

export function createCity(cityData) {
  return API.post("/cities", cityData);
}

export function updateCity(id, cityData) {
  return API.put(`/cities/${id}`, cityData);
}

export function deleteCity(id) {
  return API.delete(`/cities/${id}`);
}

// Passenger API calls

export function fetchPassengers() {
  return API.get("/passengers");
}

export function createPassenger(passengerData, cityId, flightId) {
  const params = {};

  if (cityId !== null && cityId !== undefined) {
    params.city_id = cityId;
  }

  if (flightId !== null && flightId !== undefined) {
    params.flight_id = flightId;
  }

  return API.post("/passengers", passengerData, { params: params });
}

export function updatePassenger(id, passengerData, cityId) {
  const params = {};

  if (cityId !== null && cityId !== undefined) {
    params.city_id = cityId;
  }

  return API.put(`/passengers/${id}`, passengerData, { params: params });
}

export function deletePassenger(id) {
  return API.delete(`/passengers/${id}`);
}

// Airport admin API calls

export function fetchAllAirports() {
  return API.get("/airports");
}

export function createAirport(airportData, cityId) {
  return API.post("/airports", airportData, {
    params: { city_id: cityId },
  });
}

export function updateAirport(id, airportData, cityId) {
  const params = {};

  if (cityId !== null && cityId !== undefined) {
    params.city_id = cityId;
  }

  return API.put(`/airports/${id}`, airportData, { params: params });
}

export function deleteAirport(id) {
  return API.delete(`/airports/${id}`);
}

// Gate API calls

export function fetchGates() {
  return API.get("/gates");
}

export function createGate(gateData, airportId) {
  return API.post("/gates", gateData, {
    params: { airport_id: airportId },
  });
}

export function updateGate(id, gateData, airportId) {
  const params = {};

  if (airportId !== null && airportId !== undefined) {
    params.airport_id = airportId;
  }

  return API.put(`/gates/${id}`, gateData, { params: params });
}

export function deleteGate(id) {
  return API.delete(`/gates/${id}`);
}

// Aircraft API calls

export function fetchAircraft() {
  return API.get("/aircraft");
}

// Existing imports
export function fetchAircrafts() {
  return API.get("/aircraft");
}

export function createAircraft(aircraftData, airlineId) {
  return API.post("/aircraft", aircraftData, {
    params: { airline_id: airlineId },
  });
}

export function updateAircraft(id, aircraftData, airlineId) {
  const params = {};

  if (airlineId !== null && airlineId !== undefined) {
    params.airline_id = airlineId;
  }

  return API.put(`/aircraft/${id}`, aircraftData, { params: params });
}

export function deleteAircraft(id) {
  return API.delete(`/aircraft/${id}`);
}

// Airline API calls

export function fetchAirlines() {
  return API.get("/airlines");
}

export function createAirline(airlineData, cityId) {
  const params = {};

  if (cityId !== null && cityId !== undefined) {
    params.city_id = cityId;
  }

  return API.post("/airlines", airlineData, { params: params });
}

export function updateAirline(id, airlineData, cityId) {
  const params = {};

  if (cityId !== null && cityId !== undefined) {
    params.city_id = cityId;
  }

  return API.put(`/airlines/${id}`, airlineData, { params: params });
}

export function deleteAirline(id) {
  return API.delete(`/airlines/${id}`);
}

// Flight API calls

export function fetchFlights() {
  return API.get("/flights");
}

export function createFlight(flightData, params) {
  return API.post("/flights", flightData, { params: params });
}

export function updateFlight(id, flightData, params) {
  return API.put(`/flights/${id}`, flightData, { params: params });
}

export function deleteFlight(id) {
  return API.delete(`/flights/${id}`);
}

// Booking / flight passenger

export function addPassengerToFlight(flightId, passengerId) {
  return API.post(`/flights/${flightId}/passengers/${passengerId}`);
}

export function removePassengerFromFlight(flightId, passengerId) {
  return API.delete(`/flights/${flightId}/passengers/${passengerId}`);
}

export function getFlightPassengers(flightId) {
  return API.get(`/flights/${flightId}/passengers`);
}
