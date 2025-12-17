import { useState, useEffect } from "react";
import {
  fetchFlights,
  fetchAllAirports,
  fetchAircraft,
  fetchGates,
  fetchAirlines,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../../api/api";
import "../../styles/AdminTabs.css";

export default function FlightsAdmin() {
  const [flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [allAircrafts, setAllAircrafts] = useState([]);
  const [gates, setGates] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    departureAirportId: "",
    arrivalAirportId: "",
    departureGateId: "",
    arrivalGateId: "",
    aircraftId: "",
    airlineId: "",
    status: "",
    departureTime: "",
    arrivalTime: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(function () {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [flightsRes, airportsRes, aircraftsRes, gatesRes, airlinesRes] = await Promise.all([
        fetchFlights(),
        fetchAllAirports(),
        fetchAircraft(),
        fetchGates(),
        fetchAirlines(),
      ]);
      setAllFlights(flightsRes.data);
      setFlights(flightsRes.data);
      setAirports(airportsRes.data);
      setAllAircrafts(aircraftsRes.data);
      setGates(gatesRes.data);
      setAirlines(airlinesRes.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load flights or related data", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setFlights(allFlights);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < allFlights.length; i++) {
        const f = allFlights[i];

        let idMatches = false;
        if (f.id.toString().includes(term)) idMatches = true;

        let depMatches = false;
        if (f.departureAirport && f.departureAirport.code.toLowerCase().includes(term)) depMatches = true;

        let arrMatches = false;
        if (f.arrivalAirport && f.arrivalAirport.code.toLowerCase().includes(term)) arrMatches = true;

        let statusMatches = false;
        if (f.status && f.status.toLowerCase().includes(term)) statusMatches = true;

        let aircraftMatches = false;
        if (f.aircraft && f.aircraft.type && f.aircraft.type.toLowerCase().includes(term)) aircraftMatches = true;

        let airlineMatches = false;
        if (f.airline && f.airline.name && f.airline.name.toLowerCase().includes(term)) airlineMatches = true;

        if (idMatches || depMatches || arrMatches || statusMatches || aircraftMatches || airlineMatches) {
          results.push(f);
        }
      }

      setFlights(results);
    }
  }, [searchTerm, allFlights]);

  function showMessage(text, type, duration) {
    setMessage(text);
    setMessageType(type);

    const messageArea = document.querySelector(".message-area");
    if (messageArea) {
      messageArea.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (duration !== null && duration !== undefined) {
      setTimeout(function () {
        setMessage("");
        setMessageType("");
      }, duration);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.departureAirportId === "" || form.arrivalAirportId === "") {
      showMessage("Please select both departure and arrival airports", "error", 8000);
      return;
    }

    const flightData = {
      status: form.status.trim() || "Scheduled",
      departureTime: form.departureTime || null,
      arrivalTime: form.arrivalTime || null,
    };

    const params = {};
    if (form.aircraftId !== "") params.aircraftId = Number(form.aircraftId);
    if (form.airlineId !== "") params.airlineId = Number(form.airlineId);
    if (form.departureAirportId !== "") params.departureAirportId = Number(form.departureAirportId);
    if (form.arrivalAirportId !== "") params.arrivalAirportId = Number(form.arrivalAirportId);
    if (form.departureGateId !== "") params.departureGateId = Number(form.departureGateId);
    if (form.arrivalGateId !== "") params.arrivalGateId = Number(form.arrivalGateId);

    try {
      if (editingId !== null) {
        await updateFlight(editingId, flightData, params);
        resetForm();
        showMessage("Successfully updated flight", "success");
      } else {
        await createFlight(flightData, params);
        resetForm();
        showMessage("Successfully added flight", "success", 8000);
      }
      await loadData();
    } catch (err) {
      showMessage("Operation failed. Check required fields and relations.", "error", 10000);
    }
  }

  function startEdit(flight) {
    setForm({
      departureAirportId: flight.departureAirport ? flight.departureAirport.id.toString() : "",
      arrivalAirportId: flight.arrivalAirport ? flight.arrivalAirport.id.toString() : "",
      departureGateId: flight.departureGate ? flight.departureGate.id.toString() : "",
      arrivalGateId: flight.arrivalGate ? flight.arrivalGate.id.toString() : "",
      aircraftId: flight.aircraft ? flight.aircraft.id.toString() : "",
      airlineId: flight.airline ? flight.airline.id.toString() : "",
      status: flight.status || "",
      departureTime: flight.departureTime ? flight.departureTime.slice(0, 16) : "",
      arrivalTime: flight.arrivalTime ? flight.arrivalTime.slice(0, 16) : "",
    });
    setEditingId(flight.id);

    let depDisplay = "None";
    if (flight.departureAirport) depDisplay = flight.departureAirport.code;

    let arrDisplay = "None";
    if (flight.arrivalAirport) arrDisplay = flight.arrivalAirport.code;

    let aircraftDisplay = "None";
    if (flight.aircraft) aircraftDisplay = flight.aircraft.type;

    let depGateDisplay = "None";
    if (flight.departureGate) depGateDisplay = flight.departureGate.gateNumber;

    let arrGateDisplay = "None";
    if (flight.arrivalGate) arrGateDisplay = flight.arrivalGate.gateNumber;

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing flight</span>
        <br />
        <span className="left"><strong>ID:</strong> {flight.id}</span>
        <span className="right"><strong>Status:</strong> {flight.status || "Scheduled"}</span>
        <br />
        <span className="left"><strong>From:</strong> {depDisplay}</span>
        <span className="right"><strong>To:</strong> {arrDisplay}</span>
        <br />
        <span className="left"><strong>Dep Gate:</strong> {depGateDisplay}</span>
        <span className="right"><strong>Arr Gate:</strong> {arrGateDisplay}</span>
        <br />
        <span className="left"><strong>Aircraft:</strong> {aircraftDisplay}</span>
      </span>
    );

    setMessage(editingMessage);
    setMessageType("editing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({
      departureAirportId: "",
      arrivalAirportId: "",
      departureGateId: "",
      arrivalGateId: "",
      aircraftId: "",
      airlineId: "",
      status: "",
      departureTime: "",
      arrivalTime: "",
    });
    setEditingId(null);
    setMessage("");
    setMessageType("");
  }

async function handleDelete(flightId) {
  const flight = flights.find(f => f.id === flightId);
  if (!flight) return;

  const passengerCount = flight.passengers ? flight.passengers.length : 0;
  if (passengerCount > 0) {
    showMessage("Cannot delete flight: passengers are attached", "error", 5000);
    return;
  }

  try {
    await deleteFlight(flightId); 


    setFlights(prev => prev.filter(f => f.id !== flightId));
    setAllFlights(prev => prev.filter(f => f.id !== flightId));

    showMessage("Successfully deleted flight", "success", 2000);

  } catch (err) {
    console.error("Delete failed:", err);
    showMessage("Failed to delete flight", "error", 5000);
  }
}





  if (loading) {
    return <p className="loading-message">Loading flights and data...</p>;
  }

  let formTitle = "Add New Flight";
  if (editingId !== null) formTitle = "Edit Flight";

  let buttonText = "Create";
  if (editingId !== null) buttonText = "Update";

  let noDataText = "No flights yet. Add one above!";
  if (searchTerm !== "") noDataText = "No flights match your search.";

  let showCancelButton = false;
  if (editingId !== null) showCancelButton = true;

  // Filter gates and aircraft based on selection
  let departureGates = [];
  if (form.departureAirportId !== "") {
    const depAirportId = Number(form.departureAirportId);
    departureGates = gates.filter(function (g) {
      return g.airport && g.airport.id === depAirportId;
    });
  }

  let arrivalGates = [];
  if (form.arrivalAirportId !== "") {
    const arrAirportId = Number(form.arrivalAirportId);
    arrivalGates = gates.filter(function (g) {
      return g.airport && g.airport.id === arrAirportId;
    });
  }

  let availableAircraft = [];
  if (form.airlineId !== "") {
    const airlineId = Number(form.airlineId);
    availableAircraft = allAircrafts.filter(function (ac) {
      return ac.airline && ac.airline.id === airlineId;
    });
  }

  return (
    <div className="cities-page">
      <h2 className="cities-title">Flights Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <div>
            <label className="form-label">Departure Airport  </label>
            <select
              required
              value={form.departureAirportId}
              onChange={function (e) {
                setForm({ ...form, departureAirportId: e.target.value, departureGateId: "" });
              }}
              className="cities-input"
            >
              <option value="">-- Select departure airport --</option>
              {airports.map(function (a) {
                return <option key={a.id} value={a.id}>{a.code} - {a.name}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="form-label">Departure Gate:  </label>
            {form.departureAirportId === "" ? (
              <p className="no-data" style={{ margin: "8px 0", color: "#fb923c" }}>
                Please select a departure airport to view gates
              </p>
            ) : (
              <select
                value={form.departureGateId}
                onChange={function (e) {
                  setForm({ ...form, departureGateId: e.target.value });
                }}
                className="cities-input"
              >
                <option value="">-- No gate --</option>
                {departureGates.map(function (g) {
                  return <option key={g.id} value={g.id}>{g.gateNumber} ({g.status || "Available"})</option>;
                })}
              </select>
            )}
          </div>

          <div>
            <label className="form-label">Arrival Airport  </label>
            <select
              required
              value={form.arrivalAirportId}
              onChange={function (e) {
                setForm({ ...form, arrivalAirportId: e.target.value, arrivalGateId: "" });
              }}
              className="cities-input"
            >
              <option value="">-- Select arrival airport --</option>
              {airports.map(function (a) {
                return <option key={a.id} value={a.id}>{a.code} - {a.name}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="form-label">Arrival Gate:  </label>
            {form.arrivalAirportId === "" ? (
              <p className="no-data" style={{ margin: "8px 0", color: "#fb923c" }}>
                Please select an arrival airport to view gates
              </p>
            ) : (
              <select
                value={form.arrivalGateId}
                onChange={function (e) {
                  setForm({ ...form, arrivalGateId: e.target.value });
                }}
                className="cities-input"
              >
                <option value="">-- No gate --</option>
                {arrivalGates.map(function (g) {
                  return <option key={g.id} value={g.id}>{g.gateNumber} ({g.status || "Available"})</option>;
                })}
              </select>
            )}
          </div>

          <div>
            <label className="form-label">Airline  </label>
            <select
              value={form.airlineId}
              onChange={function (e) {
                setForm({ ...form, airlineId: e.target.value, aircraftId: "" });
              }}
              className="cities-input"
            >
              <option value="">-- No airline --</option>
              {airlines.map(function (al) {
                return <option key={al.id} value={al.id}>{al.name} ({al.code})</option>;
              })}
            </select>
          </div>

          <div>
            <label className="form-label">Aircraft:  </label>
            {form.airlineId === "" ? (
              <p className="no-data" style={{ margin: "8px 0", color: "#fb923c" }}>
                Please select an airline to view aircraft
              </p>
            ) : (
              <select
                value={form.aircraftId}
                onChange={function (e) {
                  setForm({ ...form, aircraftId: e.target.value });
                }}
                className="cities-input"
              >
                <option value="">-- No aircraft --</option>
                {availableAircraft.map(function (ac) {
                  return (
                    <option key={ac.id} value={ac.id}>
                      {ac.type} (Seats: {ac.numberOfPassengers})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <input
            type="text"
            placeholder="Status (e.g., On Time, Delayed, Cancelled)"
            value={form.status}
            onChange={function (e) {
              setForm({ ...form, status: e.target.value });
            }}
            className="cities-input"
          />

          <input
            type="datetime-local"
            placeholder="Departure Time"
            value={form.departureTime}
            onChange={function (e) {
              setForm({ ...form, departureTime: e.target.value });
            }}
            className="cities-input"
          />

          <input
            type="datetime-local"
            placeholder="Arrival Time"
            value={form.arrivalTime}
            onChange={function (e) {
              setForm({ ...form, arrivalTime: e.target.value });
            }}
            className="cities-input"
          />

          <div className="form-buttons">
            <button type="submit" className="submit-btn">{buttonText}</button>
            {showCancelButton && (
              <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="message-area">
        {message !== "" && (
          <div className={"message-banner " + messageType + "-message"}>{message}</div>
        )}
      </div>

      <div className="list-header">
        <h3 className="list-title">All Flights ({flights.length})</h3>
        <input
          type="text"
          placeholder="Search by ID, airports, aircraft, airline, status..."
          value={searchTerm}
          onChange={function (e) { setSearchTerm(e.target.value); }}
          className="search-input"
        />
      </div>

      {flights.length === 0 ? (
        <p className="no-data">{noDataText}</p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>From</th>
              <th>Dep Gate</th>
              <th>To</th>
              <th>Arr Gate</th>
              <th>Aircraft</th>
              <th>Airline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(function (f) {
              let fromDisplay = "-";
              if (f.departureAirport) fromDisplay = f.departureAirport.code;

              let toDisplay = "-";
              if (f.arrivalAirport) toDisplay = f.arrivalAirport.code;

              let depGateDisplay = "-";
              if (f.departureGate) depGateDisplay = f.departureGate.gateNumber;

              let arrGateDisplay = "-";
              if (f.arrivalGate) arrGateDisplay = f.arrivalGate.gateNumber;

              let aircraftDisplay = "-";
              if (f.aircraft) aircraftDisplay = f.aircraft.type;

              let airlineDisplay = "-";
              if (f.airline) airlineDisplay = f.airline.name;

              function handleEdit() { startEdit(f); }
              function handleDeleteClick() { handleDelete(f.id); }

              return (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{fromDisplay}</td>
                  <td>{depGateDisplay}</td>
                  <td>{toDisplay}</td>
                  <td>{arrGateDisplay}</td>
                  <td>{aircraftDisplay}</td>
                  <td>{airlineDisplay}</td>
                  <td>{f.status || "Scheduled"}</td>
                  <td className="action-buttons">
                    <button onClick={handleEdit} className="edit-btn">Edit</button>
                    <button onClick={handleDeleteClick} className="delete-btn">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}