import { useState, useEffect } from "react";
import {
  fetchAirlines,
  fetchCities,
  createAirline,
  updateAirline,
  deleteAirline,
} from "../../api/api";
import "../../styles/AdminTabs.css";

export default function AirlinesAdmin() {
  const [airlines, setAirlines] = useState([]);
  const [allAirlines, setAllAirlines] = useState([]);
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
      const [airlinesRes, citiesRes] = await Promise.all([
        fetchAirlines(),
        fetchCities(),
      ]);
      setAllAirlines(airlinesRes.data);
      setAirlines(airlinesRes.data);
      setCities(citiesRes.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load airlines or cities", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setAirlines(allAirlines);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < allAirlines.length; i++) {
        const al = allAirlines[i];

        let idMatches = false;
        if (al.id.toString().includes(term)) idMatches = true;

        let nameMatches = false;
        if (al.name && al.name.toLowerCase().includes(term)) nameMatches = true;

        let codeMatches = false;
        if (al.code && al.code.toLowerCase().includes(term)) codeMatches = true;

        let cityMatches = false;
        if (al.city && al.city.name && al.city.name.toLowerCase().includes(term)) cityMatches = true;

        if (idMatches || nameMatches || codeMatches || cityMatches) {
          results.push(al);
        }
      }

      setAirlines(results);
    }
  }, [searchTerm, allAirlines]);

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

    const airlineData = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    };

    let cityId = null;
    if (form.cityId !== "") {
      cityId = Number(form.cityId);
    }

    try {
      if (editingId !== null) {
        await updateAirline(editingId, airlineData, cityId);
        resetForm();
        showMessage("Successfully updated airline: " + airlineData.name, "success");
      } else {
        await createAirline(airlineData, cityId);
        resetForm();
        showMessage("Successfully added airline: " + airlineData.name, "success", 8000);
      }
      await loadData();
    } catch (err) {
      showMessage("Operation failed. Check if code is unique or city exists.", "error", 10000);
    }
  }

  function startEdit(airline) {
    setForm({
      name: airline.name || "",
      code: airline.code || "",
      cityId: airline.city ? airline.city.id.toString() : "",
    });
    setEditingId(airline.id);

    let cityDisplay = "None";
    if (airline.city) {
      cityDisplay = airline.city.name;
      if (airline.city.province) {
        cityDisplay += ", " + airline.city.province;
      }
    }

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing airline</span>
        <br />
        <span className="left">
          <strong>ID:</strong> {airline.id}
        </span>
        <span className="right">
          <strong>Name:</strong> {airline.name}
        </span>
        <br />
        <span className="left">
          <strong>Code:</strong> {airline.code}
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
      await deleteAirline(id);
      showMessage("Successfully deleted airline", "success", 2000);
      await loadData();
    } catch (err) {
      showMessage("Cannot delete airline: it may be used in flights or aircraft", "error", 10000);
    }
  }

  if (loading) {
    return <p className="loading-message">Attempting to load airlines and cities from database....</p>;
  }

  let formTitle = "Add New Airline";
  if (editingId !== null) {
    formTitle = "Edit Airline";
  }

  let buttonText = "Create";
  if (editingId !== null) {
    buttonText = "Update";
  }

  let noDataText = "No airlines yet. Add one above!";
  if (searchTerm !== "") {
    noDataText = "No airlines match your search.";
  }

  let showCancelButton = false;
  if (editingId !== null) {
    showCancelButton = true;
  }

  let noCitiesAvailable = cities.length === 0;

  return (
    <div className="cities-page">
      <h2 className="cities-title">Airlines Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <input
            type="text"
            placeholder="Airline Name  (eg Air Canada)"
            required
            value={form.name}
            onChange={function (e) {
              setForm({ ...form, name: e.target.value });
            }}
            className="cities-input"
          />

          <input
            type="text"
            placeholder="Airline Code (eg AC)"
            required
            maxLength="3"
            value={form.code}
            onChange={function (e) {
              setForm({ ...form, code: e.target.value.toUpperCase() });
            }}
            className="cities-input"
          />

          <div>
            <label className="form-label">Headquarters City:  </label>
            {noCitiesAvailable ? (
              <p className="no-data" style={{ margin: "10px 0", color: "#fb923c" }}>
                Please create a city first in the Cities tab.
              </p>
            ) : (
              <select
                value={form.cityId}
                onChange={function (e) {
                  setForm({ ...form, cityId: e.target.value });
                }}
                className="cities-input"
              >
                <option value="">-- No city --</option>
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
        <h3 className="list-title">All Airlines ({airlines.length})</h3>
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

      {airlines.length === 0 ? (
        <p className="no-data">{noDataText}</p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Headquarters City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map(function (al) {
              let cityDisplay = "-";
              if (al.city) {
                cityDisplay = al.city.name;
                if (al.city.province) {
                  cityDisplay += ", " + al.city.province;
                }
              }

              function handleEdit() {
                startEdit(al);
              }

              function handleDeleteClick() {
                handleDelete(al.id);
              }

              return (
                <tr key={al.id}>
                  <td>{al.id}</td>
                  <td>{al.name}</td>
                  <td>
                    <strong>{al.code}</strong>
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