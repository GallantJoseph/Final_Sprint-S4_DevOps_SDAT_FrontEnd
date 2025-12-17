import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

export default function HomePage() {
  const [currentFlightType, setCurrentFlightType] = useState("departures");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

  function formatDateTime(dateString) {
    if (!dateString) return { date: "—", time: "—" };

    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let hours = date.getHours();
    let minutes = date.getMinutes().toString().padStart(2, "0");
    let ampm = "AM";
    if (hours >= 12) ampm = "PM";
    hours = hours % 12 || 12;
    const timePart = `${hours}:${minutes} ${ampm}`;

    return { date: datePart, time: timePart };
  }

function generateFlightNumber(flight) {
  const code = flight.airline?.code?.toUpperCase() || "Error";
  return `${code}${flight.id}`;
}


  async function loadFlights() {
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`${API_BASE}/flights`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      const sorted = data.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));

      setFlights(sorted);
      setLoading(false);
    } catch (err) {
      console.error("Error loading flights:", err);
      setError(true);
      setLoading(false);
      setFlights([]);
    }
  }

  useEffect(() => {
    loadFlights();
  }, []);

  function getFilteredFlights() {
    if (flights.length === 0) return [];

    const term = searchTerm.toLowerCase();

    return flights.filter((flight) => {
      const airlineName = flight.airline?.name || "";
      const flightNumber = generateFlightNumber(flight);
      const status = flight.status || "";
      const depAirport = flight.departureAirport?.code || "";
      const arrAirport = flight.arrivalAirport?.code || "";
      const depCity = flight.departureAirport?.city?.name || "";
      const arrCity = flight.arrivalAirport?.city?.name || "";

      const matchesSearch =
        airlineName.toLowerCase().includes(term) ||
        flightNumber.toLowerCase().includes(term) ||
        status.toLowerCase().includes(term) ||
        depAirport.toLowerCase().includes(term) ||
        arrAirport.toLowerCase().includes(term) ||
        depCity.toLowerCase().includes(term) ||
        arrCity.toLowerCase().includes(term);

      const isDeparture = currentFlightType === "departures";

      return matchesSearch;
    });
  }

  function getButtonClass(type) {
    return currentFlightType === type ? "toggle-btn active" : "toggle-btn";
  }

function renderFlightsTable() {
  if (loading) return <p className="loading-text">Loading flights...</p>;
  if (error) return <p className="error-text">Failed to load flights.</p>;
  if (flights.length === 0) return <p>No flights available.</p>;

  const filtered = getFilteredFlights();
  if (filtered.length === 0) return <p>No flights match your search.</p>;

  const headers = [ "Flight #",currentFlightType === "departures" ? "Departing Airport" : "Arriving Airport", currentFlightType === "departures" ? "Arriving Airport" : "Departing Airport", "Airline", "Date / Time", "Status"];

  return (
    <table className="flight-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((flight, i) => {
          const rowClass = i % 2 === 0 ? "flight-row-even" : "flight-row-odd";

          const airport =
            currentFlightType === "departures"
              ? flight.departureAirport
              : flight.arrivalAirport;

          const fromToAirport =
            currentFlightType === "departures"
              ? flight.arrivalAirport
              : flight.departureAirport;

          const dateTime = formatDateTime(
            currentFlightType === "departures"
              ? flight.departureTime
              : flight.arrivalTime
          );

          return (
            <tr key={flight.id} className={rowClass}>

              <td>
                <Link to={`/flight/${flight.id}`} className="flight-link">
                  {generateFlightNumber(flight)}
                </Link>
              </td>


              <td>{airport?.name ? `${airport.name} [${airport.code}]` : "Unknown [?]"}</td>



              <td>
                {fromToAirport?.name
                  ? `${fromToAirport.name} [${fromToAirport.code}]`
                  : "Unknown [?]"}
              </td>

              <td>{flight.airline?.name || "—"}</td>

              <td>
                {dateTime.date}, {dateTime.time}
              </td>


              <td>
                  {flight.status || "Scheduled"}

              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

  const today = new Date();
const todayFormatted = today.toLocaleDateString("en-US", {
  weekday: "long", 
  month: "short",  
  day: "numeric",  
  year: "numeric", 
});

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to CodeBrew Airways!</h1>

      <div className="toggle-bar">
        <button
          className={getButtonClass("arrivals")}
          onClick={() => setCurrentFlightType("arrivals")}
        >
          Arrivals
        </button>

        <button
          className={getButtonClass("departures")}
          onClick={() => setCurrentFlightType("departures")}
        >
          Departures
        </button>

        <button className="refresh-btn" onClick={loadFlights}>
          ↻ Refresh
        </button>

        <input
          type="text"
          placeholder="Search flights..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <span className="today-date">{todayFormatted}</span>
      </div>

      <div className="flight-card">{renderFlightsTable()}</div>
    </div>
  );
}