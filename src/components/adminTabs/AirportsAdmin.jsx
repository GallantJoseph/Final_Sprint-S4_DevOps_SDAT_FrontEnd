import { useState, useEffect } from "react";
import {
  fetchAllAirports,
  fetchCities,
  createAirport,
  updateAirport,
  deleteAirport,
} from "../../api/api";
import "../../styles/AdminTabs.css";

export default function AirportsAdmin() {
  const [airports, setAirports] = useState([]);
  const [allAirports, setAllAirports] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    cityId: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(function () {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [airportsRes, citiesRes] = await Promise.all([
        fetchAllAirports(),
        fetchCities(),
      ]);
      setAllAirports(airportsRes.data);
      setAirports(airportsRes.data);
      setCities(citiesRes.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load airports or cities", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setAirports(allAirports);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < allAirports.length; i++) {
        const airport = allAirports[i];

        let idMatches = false;
        if (airport.id.toString().includes(term)) {
          idMatches = true;
        }

        let nameMatches = false;
        if (airport.name.toLowerCase().includes(term)) {
          nameMatches = true;
        }

        let codeMatches = false;
        if (airport.code.toLowerCase().includes(term)) {
          codeMatches = true;
        }

        let cityMatches = false;
        if (airport.city && airport.city.name.toLowerCase().includes(term)) {
          cityMatches = true;
        }

        if (idMatches || nameMatches || codeMatches || cityMatches) {
          results.push(airport);
        }
      }

      setAirports(results);
    }
  }, [searchTerm, allAirports]);

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

    if (form.cityId === "") {
      showMessage("Please select a city for the airport", "error", 8000);
      return;
    }

    const airportData = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    };

    try {
      if (editingId !== null) {
        await updateAirport(editingId, airportData, Number(form.cityId));
        resetForm();
        showMessage("Successfully updated airport: " + airportData.name, "success");
      } else {
        await createAirport(airportData, Number(form.cityId));
        resetForm();
        showMessage("Successfully added airport: " + airportData.name, "success", 8000);
      }
      await loadData();
    } catch (err) {
      showMessage("Operation failed. Check if code is unique or city exists.", "error", 10000);
    }
  }

  function startEdit(airport) {
    setForm({
      name: airport.name,
      code: airport.code,
      cityId: airport.city ? airport.city.id.toString() : "",
    });
    setEditingId(airport.id);

    let cityDisplay = "None";
    if (airport.city) {
      cityDisplay = airport.city.name;
      if (airport.city.province) {
        cityDisplay += ", " + airport.city.province;
      }
    }

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing airport</span>
        <br />
        <span className="left">
          <strong>ID:</strong> {airport.id}
        </span>
        <span className="right">
          <strong>Name:</strong> {airport.name}
        </span>
        <br />
        <span className="left">
          <strong>Code:</strong> {airport.code}
        </span>
        <span className="right">
          <strong>City:</strong> {cityDisplay}
        </span>
      </span>
    );

    setMessage(editingMessage);
    setMessageType("editing");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ name: "", code: "", cityId: "" });
    setEditingId(null);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    try {
      await deleteAirport(id);
      showMessage("Successfully deleted airport", "success", 2000);
      await loadData();
    } catch (err) {
      showMessage("Cannot delete airport: it may be used in flights", "error", 10000);
    }
  }

  if (loading) {
    return <p className="loading-message">Loading airports and cities...</p>;
  }

  let formTitle = "Add New Airport";
  if (editingId !== null) {
    formTitle = "Edit Airport";
  }

  let buttonText = "Create";
  if (editingId !== null) {
    buttonText = "Update";
  }

  let noDataText = "No airports yet. Add one above!";
  if (searchTerm !== "") {
    noDataText = "No airports match your search.";
  }

  let showCancelButton = false;
  if (editingId !== null) {
    showCancelButton = true;
  }

  let noCitiesAvailable = cities.length === 0;

  return (
    <div className="cities-page">
      <h2 className="cities-title">Airports Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <input
            type="text"
            placeholder="Airport Name"
            required
            value={form.name}
            onChange={function (e) {
              setForm({ ...form, name: e.target.value });
            }}
            className="cities-input"
          />
          <input
            type="text"
            placeholder="Airport Code (3 letters)"
            required
            maxLength="3"
            value={form.code}
            onChange={function (e) {
              setForm({ ...form, code: e.target.value.toUpperCase() });
            }}
            className="cities-input"
          />

          <div>
            <label className="form-label">City: </label>
            {noCitiesAvailable ? (
              <p className="no-data" style={{ margin: "10px 0", color: "#fb923c" }}>
                Please create a city first in the Cities tab.
              </p>
            ) : (
              <select
                required
                value={form.cityId}
                onChange={function (e) {
                  setForm({ ...form, cityId: e.target.value });
                }}
                className="cities-input"
              >
                <option value="">-- Select a city --</option>
                {cities.map(function (city) {
                  let displayText = city.name;
                  if (city.province) {
                    displayText += ", " + city.province;
                  }
                  displayText += " (Pop: " + city.population.toLocaleString() + ")";
                  return (
                    <option key={city.id} value={city.id}>
                      {displayText}
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
        <h3 className="list-title">All Airports ({airports.length})</h3>
        <input
          type="text"
          placeholder="Search by ID, Name, Code, or City..."
          value={searchTerm}
          onChange={function (e) {
            setSearchTerm(e.target.value);
          }}
          className="search-input"
        />
      </div>

      {airports.length === 0 ? (
        <p className="no-data">{noDataText}</p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airports.map(function (airport) {
              let cityDisplay = "No city";
              if (airport.city) {
                cityDisplay = airport.city.name;
                if (airport.city.province) {
                  cityDisplay += ", " + airport.city.province;
                }
              }

              function handleEdit() {
                startEdit(airport);
              }

              function handleDeleteClick() {
                handleDelete(airport.id);
              }

              return (
                <tr key={airport.id}>
                  <td>{airport.id}</td>
                  <td>{airport.name}</td>
                  <td>
                    <strong>{airport.code}</strong>
                  </td>
                  <td>{cityDisplay}</td>
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