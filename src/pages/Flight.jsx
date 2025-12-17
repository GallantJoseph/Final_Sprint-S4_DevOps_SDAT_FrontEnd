import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Flight.css";

export default function Flight() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  function formatFullDate(dateString, timeZone) {
    if (!dateString) return { weekday: "—", dateLong: "—", timeWithZone: "—" };

    const d = new Date(dateString);
    const optionsDate = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const optionsTime = { hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short" };

    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const dateLong = d.toLocaleDateString("en-US", optionsDate);
    const timeWithZone = d.toLocaleTimeString("en-US", { ...optionsTime, timeZone: timeZone || undefined });

    return { weekday, dateLong, timeWithZone };
  }


  function computeDuration(startString, endString) {
    if (!startString || !endString) return "—";

    const start = new Date(startString);
    const end = new Date(endString);
    const diffMs = end - start;
    if (diffMs <= 0) return "—";

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins < 10 ? "0" : ""}${mins}m`;
  }

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`${API_BASE}/flights/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Flight not found");
        return res.json();
      })
      .then((data) => {
        setFlight(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading flight:", err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flight-details-page">
        <p className="flight-loading">Attempting to load flight details from database...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="flight-details-page">
        <p className="flight-error">Flight not found.</p>
      </div>
    );
  }

  const depParts = formatFullDate(flight.departureTime, flight.departureAirport?.timezone);
  const arrParts = formatFullDate(flight.arrivalTime, flight.arrivalAirport?.timezone);
  const duration = computeDuration(flight.departureTime, flight.arrivalTime);

const flightNumber = flight.airline?.code
  ? `${flight.airline.code.toUpperCase()}${flight.id}`
  : `Error${flight.id}`;


  return (
    <div className="flight-details-page">
      <div className="flight-card-top">
        <div className="flight-airline">{flight.airline?.name || "Unknown Airline"}</div>
        <div className="flight-number">{flightNumber}</div>
      </div>

      <div className="flight-details-grid">
        {/* Departure */}
        <div className="flight-side left departure-side">
          <div className="section-title">Departing From</div>
          <div className="airport-code">{flight.departureAirport?.code || "?"}</div>
          <div className="airport-city">
            {flight.departureAirport?.name || flight.departureAirport?.city || "Unknown Airport"},{" "}
            {flight.departureAirport?.country || ""}
          </div>
          <div>
            <strong>Departing from</strong>{" "}
            <span className="highlight">
              Gate {flight.departureGate?.gateNumber || "-"}
            </span>
          </div>
          <div className="date">{depParts.dateLong}</div>
          <div className="time">{depParts.timeWithZone}</div>
        </div>


        <div className="flight-middle"></div>

        {/* Arrival */}
        <div className="flight-side right arrival-side">
          <div className="section-title">Arriving At</div>
          <div className="airport-code">{flight.arrivalAirport?.code || "?"}</div>
          <div className="airport-city">
            {flight.arrivalAirport?.name || flight.arrivalAirport?.city || "Unknown Airport"},{" "}
            {flight.arrivalAirport?.country || ""}
          </div>
          <div>
            <strong>Landing at</strong>{" "}
            <span className="highlight">
              Gate {flight.arrivalGate?.gateNumber || "-"}
            </span>
          </div>
          <div className="date">{arrParts.dateLong}</div>
          <div className="time">{arrParts.timeWithZone}</div>
        </div>
      </div>

      {/* Extra Info */}
      <div className="flight-extra">
        <div className="flight-aircraft">
          <strong>Aircraft:</strong>{" "}
          <span className="highlight">{flight.aircraft?.type || "Unknown"}</span>
        </div>
        <div className="flight-duration">
          <strong>Total Flight Time:</strong> <span className="highlight">{duration}</span>
        </div>
        <div className="flight-status">
          <strong>Status:</strong>{" "}
          <span className="highlight">{flight.status || "Scheduled"}</span>
        </div>
      </div>
    </div>
  );
}