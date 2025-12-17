import { useState, useEffect } from "react";
import {
  fetchGates,
  fetchAllAirports,
  createGate,
  updateGate,
  deleteGate,
} from "../../api/api";
import "../../styles/AdminTabs.css";

export default function GatesAdmin() {
  const [gates, setGates] = useState([]);
  const [allGates, setAllGates] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    gateNumber: "",
    status: "",
    airportId: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(function () {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [gatesRes, airportsRes] = await Promise.all([
        fetchGates(),
        fetchAllAirports(),
      ]);
      setAllGates(gatesRes.data);
      setGates(gatesRes.data);
      setAirports(airportsRes.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load gates or airports", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setGates(allGates);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < allGates.length; i++) {
        const gate = allGates[i];

        let idMatches = false;
        if (gate.id.toString().includes(term)) idMatches = true;

        let numberMatches = false;
        if (gate.gateNumber && gate.gateNumber.toLowerCase().includes(term)) numberMatches = true;

        let statusMatches = false;
        if (gate.status && gate.status.toLowerCase().includes(term)) statusMatches = true;

        let airportMatches = false;
        if (gate.airport) {
          if (gate.airport.code.toLowerCase().includes(term) ||
              gate.airport.name.toLowerCase().includes(term)) {
            airportMatches = true;
          }
        }

        if (idMatches || numberMatches || statusMatches || airportMatches) {
          results.push(gate);
        }
      }

      setGates(results);
    }
  }, [searchTerm, allGates]);

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

    if (form.airportId === "") {
      showMessage("Please select an airport for the gate", "error", 8000);
      return;
    }

    const gateData = {
      gateNumber: form.gateNumber.trim(),
      status: form.status.trim() || null,
    };

    try {
      if (editingId !== null) {
        await updateGate(editingId, gateData, Number(form.airportId));
        resetForm();
        showMessage("Successfully updated gate: " + gateData.gateNumber, "success");
      } else {
        await createGate(gateData, Number(form.airportId));
        resetForm();
        showMessage("Successfully added gate: " + gateData.gateNumber, "success", 8000);
      }
      await loadData();
    } catch (err) {
      showMessage("Operation failed. Check if gate number is unique or airport exists.", "error", 10000);
    }
  }

  function startEdit(gate) {
    setForm({
      gateNumber: gate.gateNumber || "",
      status: gate.status || "",
      airportId: gate.airport ? gate.airport.id.toString() : "",
    });
    setEditingId(gate.id);

    let airportDisplay = "None";
    if (gate.airport) {
      airportDisplay = gate.airport.code + " - " + gate.airport.name;
    }

    let statusDisplay = "None";
    if (gate.status) {
      statusDisplay = gate.status;
    }

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing gate</span>
        <br />
        <span className="left">
          <strong>ID:</strong> {gate.id}
        </span>
        <span className="right">
          <strong>Gate Number:</strong> {gate.gateNumber}
        </span>
        <br />
        <span className="left">
          <strong>Status:</strong> {statusDisplay}
        </span>
        <span className="right">
          <strong>Airport:</strong> {airportDisplay}
        </span>
      </span>
    );

    setMessage(editingMessage);
    setMessageType("editing");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ gateNumber: "", status: "", airportId: "" });
    setEditingId(null);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    try {
      await deleteGate(id);
      showMessage("Successfully deleted gate", "success", 2000);
      await loadData();
    } catch (err) {
      showMessage("Cannot delete gate: it may be used.", "error", 10000);
    }
  }

  if (loading) {
    return <p className="loading-message">Loading gates and airports...</p>;
  }

  let formTitle = "Add New Gate";
  if (editingId !== null) {
    formTitle = "Edit Gate";
  }

  let buttonText = "Create";
  if (editingId !== null) {
    buttonText = "Update";
  }

  let noDataText = "No gates yet. Add one above!";
  if (searchTerm !== "") {
    noDataText = "No gates match your search.";
  }

  let showCancelButton = false;
  if (editingId !== null) {
    showCancelButton = true;
  }

  let noAirportsAvailable = airports.length === 0;

  return (
    <div className="cities-page">
      <h2 className="cities-title">Gates Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <input
            type="text"
            placeholder="Gate Number (eg A12, B45)"
            required
            value={form.gateNumber}
            onChange={function (e) {
              setForm({ ...form, gateNumber: e.target.value });
            }}
            className="cities-input"
          />

          <input
            type="text"
            placeholder="Status (eg Unboarding, Boarding)"
            value={form.status}
            onChange={function (e) {
              setForm({ ...form, status: e.target.value });
            }}
            className="cities-input"
          />

          <div>
            <label className="form-label">Airport: </label>
            {noAirportsAvailable ? (
              <p className="no-data">
                Please create an airport first in the Airports tab.
              </p>
            ) : (
              <select
                required
                value={form.airportId}
                onChange={function (e) {
                  setForm({ ...form, airportId: e.target.value });
                }}
                className="cities-input"
              >
                <option value="">-- Select an airport --</option>
                {airports.map(function (airport) {
                  return (
                    <option key={airport.id} value={airport.id}>
                      {airport.code} - {airport.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {buttonText}
            </button>

            {showCancelButton && (
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="message-area">
        {message !== "" && (
          <div className={"message-banner " + messageType + "-message"}>
            {message}
          </div>
        )}
      </div>

      <div className="list-header">
        <h3 className="list-title">All Gates ({gates.length})</h3>
        <input
          type="text"
          placeholder="Search by ID, Gate Number, Status, or Airport..."
          value={searchTerm}
          onChange={function (e) {
            setSearchTerm(e.target.value);
          }}
          className="search-input"
        />
      </div>

      {gates.length === 0 ? (
        <p className="no-data">{noDataText}</p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Gate Number</th>
              <th>Status</th>
              <th>Airport</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gates.map(function (gate) {
              let statusDisplay = "-";
              if (gate.status) {
                statusDisplay = gate.status;
              }

              let airportDisplay = "-";
              if (gate.airport) {
                airportDisplay = gate.airport.code + " - " + gate.airport.name;
              }

              function handleEdit() {
                startEdit(gate);
              }

              function handleDeleteClick() {
                handleDelete(gate.id);
              }

              return (
                <tr key={gate.id}>
                  <td>{gate.id}</td>
                  <td>{gate.gateNumber}</td>
                  <td>{statusDisplay}</td>
                  <td>{airportDisplay}</td>
                  <td className="action-buttons">
                    <button onClick={handleEdit} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={handleDeleteClick} className="delete-btn">
                      Delete
                    </button>
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