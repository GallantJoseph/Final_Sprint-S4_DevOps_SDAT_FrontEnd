import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Flight.css";

export default function Flight() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sampleFlight = {
    id: id,
    airline: { id: 1, name: "CodeBrew Airways" },
    departureAirport: { id: 1, code: "YYZ", city: "Toronto", country: "Canada", timezone: "America/Toronto" },
    arrivalAirport: { id: 2, code: "YVR", city: "Vancouver", country: "Canada", timezone: "America/Vancouver" },
    departureGate: "A1",
    arrivalGate: "B3",
    aircraft: { model: "Boeing 738" },
    status: "Scheduled",
    departureTime: "2025-12-15T08:30:00",
    arrivalTime: "2025-12-15T10:45:00",
    flightNumber: "WS123"
  };

  function getApiUrl(path) {
    return import.meta.env.VITE_API_URL + path;
  }

  function generateFlightNumber(flight) {
    let airlineParts = flight.airline.name.split(" ");
    let code = airlineParts[0].charAt(0).toUpperCase();
    if (airlineParts.length > 1) code += airlineParts[1].charAt(0).toUpperCase();
    else if (airlineParts[0].length > 1) code += airlineParts[0].charAt(1).toUpperCase();

    let digitsMatch = flight.flightNumber.match(/\d{2}/);
    let numberPart = digitsMatch ? digitsMatch[0] : "00";
    return code + numberPart + flight.id;
  }

  function formatFullDate(dateString, timeZone) {
    let d = new Date(dateString);
    let weekday = d.toLocaleDateString(undefined, { weekday: "long" });
    let dateLong = d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    let timeWithZone = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short", timeZone: timeZone });
    return { weekday, dateLong, timeWithZone };
  }

  function computeDuration(startString, endString) {
    let start = new Date(startString);
    let end = new Date(endString);
    let diffMs = end - start;
    if (diffMs < 0) return "N/A";
    let minutes = Math.floor(diffMs / 60000);
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours}h ${mins < 10 ? "0" : ""}${mins}m`;
  }

  useEffect(() => {
    setLoading(true);
    setError(false);
    let controller = new AbortController();
    let timeout = setTimeout(() => {
      controller.abort();
      setError(true);
      setLoading(false);
      setFlight(sampleFlight);
    }, 8000);

    fetch(getApiUrl("/api/flights/" + id), { signal: controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        clearTimeout(timeout);
        setFlight(data || sampleFlight);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
          setFlight(sampleFlight);
        }
      });

    return () => clearTimeout(timeout);
  }, [id]);

  if (loading) return (
    <div className="flight-details-page">
      <p className="flight-loading">Loading flight details...</p>
    </div>
  );

  if (!flight) return (
    <div className="flight-details-page">
      <p className="flight-error">Flight not found.</p>
    </div>
  );

  const depParts = formatFullDate(flight.departureTime, flight.departureAirport.timezone);
  const arrParts = formatFullDate(flight.arrivalTime, flight.arrivalAirport.timezone);
  const duration = computeDuration(flight.departureTime, flight.arrivalTime);
  const flightID = generateFlightNumber(flight);

  return (
    <div className="flight-details-page">
      <div className="flight-card-top">
        <div className="flight-airline">{flight.airline.name}</div>
        <div className="flight-number">Flight {flightID}</div>
      </div>

      <div className="flight-details-grid">
        {/* Departure */}
        <div className="flight-side departure-side">
          <div><strong>Gate:</strong> {flight.departureGate}</div>
          <div className="airport-code">{flight.departureAirport.code}</div>
          <div className="airport-city">{flight.departureAirport.city}, {flight.departureAirport.country}</div>
          <div className="weekday">{depParts.weekday}</div>
          <div className="date">{depParts.dateLong}</div>
          <div className="time">{depParts.timeWithZone}</div>
        </div>

        {/* Middle - Empty now */}
        <div className="flight-middle">
          {/* Aircraft removed from middle */}
        </div>

        {/* Arrival */}
        <div className="flight-side arrival-side">
          <div><strong>Gate:</strong> {flight.arrivalGate}</div>
          <div className="airport-code">{flight.arrivalAirport.code}</div>
          <div className="airport-city">{flight.arrivalAirport.city}, {flight.arrivalAirport.country}</div>
          <div className="weekday">{arrParts.weekday}</div>
          <div className="date">{arrParts.dateLong}</div>
          <div className="time">{arrParts.timeWithZone}</div>
        </div>
      </div>

      {/* Extra Info */}
      <div className="flight-extra">
        <div className="flight-aircraft"><strong>Aircraft:</strong> {flight.aircraft.model}</div>
        <div className="flight-duration"><strong>Total Flight Time:</strong> {duration}</div>
        <div className="flight-status"><strong>Status:</strong> {flight.status}</div>
      </div>
    </div>
  );
}
