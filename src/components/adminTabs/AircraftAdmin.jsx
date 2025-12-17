import { useState, useEffect } from "react";
import {
  fetchAircraft,
  fetchAllAirports,
  fetchAirlines,
  createAircraft,
  updateAircraft,
  deleteAircraft,
} from "../../api/api";
import "../../styles/AdminTabs.css";


export default function AircraftAdmin() {
  const [aircrafts, setAircrafts] = useState([]);
  const [allAircrafts, setAllAircrafts] = useState([]);
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    type: "",
    numberOfPassengers: "",
    airlineId: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(function () {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [aircraftRes, airportsRes, airlinesRes] = await Promise.all([
        fetchAircraft(),
        fetchAllAirports(),
        fetchAirlines(),
      ]);
      setAllAircrafts(aircraftRes.data);
      setAircrafts(aircraftRes.data);
      setAirports(airportsRes.data);
      setAirlines(airlinesRes.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load aircraft or related data", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setAircrafts(allAircrafts);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < allAircrafts.length; i++) {
        const ac = allAircrafts[i];

        let idMatches = ac.id.toString().includes(term);
        let typeMatches = ac.type && ac.type.toLowerCase().includes(term);
        let passengersMatches = ac.numberOfPassengers.toString().includes(term);
        let airlineMatches =
          ac.airline && ac.airline.name && ac.airline.name.toLowerCase().includes(term);

        if (idMatches || typeMatches || passengersMatches || airlineMatches) {
          results.push(ac);
        }
      }

      setAircrafts(results);
    }
  }, [searchTerm, allAircrafts]);

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

    if (form.airlineId === "") {
      showMessage("Please select an airline for the aircraft", "error", 8000);
      return;
    }

    const aircraftData = {
      type: form.type.trim(),
      numberOfPassengers: Number(form.numberOfPassengers) || 0,
    };

    const airlineId = Number(form.airlineId);

    try {
      if (editingId !== null) {
        await updateAircraft(editingId, aircraftData, airlineId);
        resetForm();
        showMessage("Successfully updated aircraft: " + aircraftData.type, "success");
      } else {
        await createAircraft(aircraftData, airlineId);
        resetForm();
        showMessage("Successfully added aircraft: " + aircraftData.type, "success", 8000);
      }
      await loadData();
    } catch (err) {
      showMessage("Operation failed. Check required fields and relations.", "error", 10000);
    }
  }

  function startEdit(ac) {
    setForm({
      type: ac.type || "",
      numberOfPassengers: ac.numberOfPassengers.toString(),
      airlineId: ac.airline ? ac.airline.id.toString() : "",
    });
    setEditingId(ac.id);

    let airlineDisplay = ac.airline ? ac.airline.name || "Airline" : "None";

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing aircraft</span>
        <br />
        <span className="left"><strong>ID:</strong> {ac.id}</span>
        <span className="right"><strong>Type:</strong> {ac.type}</span>
        <br />
        <span className="left"><strong>Passengers:</strong> {ac.numberOfPassengers}</span>
        <span className="right"><strong>Airline:</strong> {airlineDisplay}</span>
      </span>
    );

    setMessage(editingMessage);
    setMessageType("editing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ type: "", numberOfPassengers: "", airlineId: "" });
    setEditingId(null);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    try {
      await deleteAircraft(id);
      showMessage("Successfully deleted aircraft", "success", 2000);
      await loadData();
    } catch (err) {
      showMessage("Cannot delete aircraft: it may be used in a flight", "error", 10000);
    }
  }

  if (loading) {
    return <p className="loading-message">Attempting to load aircrafts from database...</p>;
  }

  let formTitle = editingId !== null ? "Edit Aircraft" : "Add New Aircraft";
  let buttonText = editingId !== null ? "Update" : "Create";
  let noDataText =
    searchTerm !== "" ? "No aircraft match your search." : "No aircraft yet. Add one above!";
  let showCancelButton = editingId !== null;
  let noAirlinesAvailable = airlines.length === 0;

  return (
    <div className="cities-page">
      <h2 className="cities-title">Aircraft Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <input
            type="text"
            placeholder="Aircraft Type (eg Boeing 737)"
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="cities-input"
          />

          <input
            type="number"
            placeholder="Number of Passengers"
            required
            min="1"
            value={form.numberOfPassengers}
            onChange={(e) => setForm({ ...form, numberOfPassengers: e.target.value })}
            className="cities-input"
          />

          <div>
            <label className="form-label">Airline:  </label>
            {noAirlinesAvailable ? (
              <p className="no-data" style={{ margin: "10px 0", color: "#fb923c" }}>
                Please create an airline first.
              </p>
            ) : (
              <select
                required
                value={form.airlineId}
                onChange={(e) => setForm({ ...form, airlineId: e.target.value })}
                className="cities-input"
              >
                <option value="">-- Select an airline --</option>
                {airlines.map((al) => (
                  <option key={al.id} value={al.id}>{al.name}</option>
                ))}
              </select>
            )}
          </div>

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
        <h3 className="list-title">All Aircraft ({aircrafts.length})</h3>
        <input
          type="text"
          placeholder="Search by ID, Type, Passengers, or Airline..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {aircrafts.length === 0 ? (
        <p className="no-data">{noDataText}</p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Passengers</th>
              <th>Airline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {aircrafts.map((ac) => (
              <tr key={ac.id}>
                <td>{ac.id}</td>
                <td>{ac.type}</td>
                <td>{ac.numberOfPassengers}</td>
                <td>{ac.airline ? ac.airline.name : "-"}</td>
                <td className="action-buttons">
                  <button onClick={() => startEdit(ac)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(ac.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
