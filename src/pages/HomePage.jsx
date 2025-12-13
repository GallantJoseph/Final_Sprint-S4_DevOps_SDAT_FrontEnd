// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import "../styles/HomePage.css";

export default function HomePage() {
  const [currentFlightType, setCurrentFlightType] = useState("departures");
  const [flightList, setFlightList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sampleFlights = {
    departures: [
      { id: 1, airline: "WestJet", flightNumber: "WS123", date: "2025-12-12T14:30:00Z", to: "Toronto", status: "On Time" },
      { id: 2, airline: "Air Canada", flightNumber: "AC456", date: "2025-12-12T16:15:00Z", to: "Vancouver", status: "Delayed" },
      { id: 3, airline: "Porter Airlines", flightNumber: "PD789", date: "2025-12-12T18:45:00Z", to: "Montreal", status: "Cancelled" }
    ],
    arrivals: [
      { id: 4, airline: "WestJet", flightNumber: "WS321", date: "2025-12-12T12:30:00Z", from: "Toronto", status: "On Time" },
      { id: 5, airline: "Air Canada", flightNumber: "AC654", date: "2025-12-12T15:15:00Z", from: "Vancouver", status: "Delayed" },
      { id: 6, airline: "Porter Airlines", flightNumber: "PD987", date: "2025-12-12T17:45:00Z", from: "Montreal", status: "On Time" }
    ]
  };

  function formatDateTime(dateString) {
    let date = new Date(dateString);
    let options = { month: "short", day: "numeric" };
    let datePart = date.toLocaleDateString(undefined, options);

    let hours = date.getHours();
    let minutes = date.getMinutes().toString().padStart(2, "0");
    let ampm = "AM";
    if (hours >= 12) { ampm = "PM"; }
    hours = hours % 12;
    if (hours === 0) { hours = 12; }
    let timePart = hours + ":" + minutes + " " + ampm;

    return { date: datePart, time: timePart };
  }

  function generateFlightNumber(flight) {
    // Airline code
    let airlineParts = flight.airline.split(" ");
    let code = airlineParts[0].charAt(0).toUpperCase();
    if (airlineParts.length > 1) {
      code += airlineParts[1].charAt(0).toUpperCase();
    } else if (airlineParts[0].length > 1) {
      code += airlineParts[0].charAt(1).toUpperCase();
    }

    // Take first 2 digits from flightNumber
    let digitsMatch = flight.flightNumber.match(/\d{2}/);
    let numberPart = digitsMatch ? digitsMatch[0] : "00";

    // Append flight ID to ensure uniqueness
    return code + numberPart + flight.id;
  }

  function getApiUrl(path) {
    return import.meta.env.VITE_API_URL + path;
  }

  function fetchFlights() {
    setLoading(true);
    setError(false);
    setFlightList(null);

    let controller = new AbortController();
    let timeout = setTimeout(function () {
      controller.abort();
      setError(true);
      setLoading(false);
      setFlightList(sampleFlights[currentFlightType]);
    }, 8000);

    let now = new Date();
    let twelveMonthsLater = new Date();
    twelveMonthsLater.setMonth(now.getMonth() + 12);
    let start = now.toISOString();
    let end = twelveMonthsLater.toISOString();

    let url = getApiUrl("/api/flights?type=" + currentFlightType + "&start=" + start + "&end=" + end);

    fetch(url, { signal: controller.signal })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        clearTimeout(timeout);
        if (data.length > 0) {
          setFlightList(data);
        } else {
          setFlightList(sampleFlights[currentFlightType]);
        }
        setLoading(false);
      })
      .catch(function (err) {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
          setFlightList(sampleFlights[currentFlightType]);
        }
      });

    return function () { clearTimeout(timeout); };
  }

  useEffect(function () {
    let cleanup = fetchFlights();
    return function () { cleanup(); };
  }, [currentFlightType]);

  function getButtonClass(buttonType) {
    if (currentFlightType === buttonType) {
      return "toggle-btn active";
    }
    return "toggle-btn";
  }

  function getFilteredFlights() {
    if (!flightList) { return []; }
    let term = searchTerm.toLowerCase();
    return flightList.filter(function (flight) {
      let generatedNumber = generateFlightNumber(flight).toLowerCase();

      if (currentFlightType === "departures") {
        if (flight.airline.toLowerCase().includes(term)) return true;
        if (generatedNumber.includes(term)) return true;
        if (flight.to.toLowerCase().includes(term)) return true;
        if (flight.status.toLowerCase().includes(term)) return true;
        let dt = formatDateTime(flight.date);
        if (dt.date.toLowerCase().includes(term)) return true;
        if (dt.time.toLowerCase().includes(term)) return true;
        return false;
      } else {
        if (flight.airline.toLowerCase().includes(term)) return true;
        if (generatedNumber.includes(term)) return true;
        if (flight.from.toLowerCase().includes(term)) return true;
        if (flight.status.toLowerCase().includes(term)) return true;
        let dt = formatDateTime(flight.date);
        if (dt.date.toLowerCase().includes(term)) return true;
        if (dt.time.toLowerCase().includes(term)) return true;
        return false;
      }
    });
  }

  function renderFlightsTable() {
    if (loading) return <p>Loading flights...</p>;
    if (!flightList || flightList.length === 0) return <p>No flights available in the next 12 months.</p>;

    let headers = ["Airline", "Flight Number", "Date", "Time"];
    if (currentFlightType === "departures") { headers.push("To"); }
    else { headers.push("From"); }
    headers.push("Status");

    let filteredFlights = getFilteredFlights();
    let rows = [];

    for (let i = 0; i < filteredFlights.length; i++) {
      let flight = filteredFlights[i];
      let rowClass;
      if (i % 2 === 0) { rowClass = "flight-row-even"; } else { rowClass = "flight-row-odd"; }
      let dt = formatDateTime(flight.date);

      rows.push(
        <tr key={flight.id} className={rowClass}>
          <td>{flight.airline}</td>
          <td>
            <a href={"/flight/" + flight.id} className="flight-link">
              {generateFlightNumber(flight)}
            </a>
          </td>
          <td>{dt.date}</td>
          <td>{dt.time}</td>
          {currentFlightType === "departures" ? <td>{flight.to}</td> : <td>{flight.from}</td>}
          <td>{flight.status}</td>
        </tr>
      );
    }

    return (
      <table className="flight-table">
        <thead>
          <tr>
            {headers.map(function (header) { return <th key={header}>{header}</th>; })}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  let today = new Date();
  let todayFormatted = today.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to CodeBrew Airways!</h1>

      <div className="toggle-bar">
        <button className={getButtonClass("arrivals")} onClick={function () { setCurrentFlightType("arrivals"); }}>
          Arrivals
        </button>

        <button className={getButtonClass("departures")} onClick={function () { setCurrentFlightType("departures"); }}>
          Departures
        </button>

        <button
          className={"refresh-btn"}
          onClick={fetchFlights}
        >
          &#x21bb; Refresh
        </button>

        <input
          type="text"
          placeholder="Search flights..."
          value={searchTerm}
          onChange={function(e) { setSearchTerm(e.target.value); }}
          className="search-input"
        />

        <span className="today-date">{todayFormatted}</span>
      </div>

      <div className="flight-card">{renderFlightsTable()}</div>
    </div>
  );
}
