import { useState, useEffect } from "react";
import {
  fetchCities,
  createCity,
  updateCity,
  deleteCity,
  fetchPassengers,
} from "../../api/api";
import "../../styles/AdminTabs.css";

export default function CitiesAdmin() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    province: "",
    population: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(function () {
    loadCities();
  }, []);

  async function loadCities() {
    try {
      const response = await fetchCities();
      setCities(response.data);
      setFilteredCities(response.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load cities", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setFilteredCities(cities);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const idMatches = city.id.toString().includes(term);
        const nameMatches = city.name.toLowerCase().includes(term);
        const provinceMatches =
          city.province && city.province.toLowerCase().includes(term);
        const populationMatches = city.population.toString().includes(term);

        if (idMatches || nameMatches || provinceMatches || populationMatches) {
          results.push(city);
        }
      }

      setFilteredCities(results);
    }
  }, [searchTerm, cities]);

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

    const cityData = {
      name: form.name.trim(),
      province: form.province.trim(),
      population: Number(form.population) || 0,
    };

    try {
      if (editingId !== null) {
        await updateCity(editingId, cityData);
        resetForm();
        showMessage("Successfully updated city: " + cityData.name, "success");
        await loadCities();
      } else {
        await createCity(cityData);
        resetForm();
        showMessage("Successfully added city: " + cityData.name, "success", 8000);
        await loadCities();
      }
    } catch (err) {
      showMessage("Operation failed. Please try again.", "error", 10000);
    }
  }

  function startEdit(city) {
    setForm({
      name: city.name,
      province: city.province || "",
      population: city.population.toString(),
    });
    setEditingId(city.id);

    let provinceText = city.province;
    if (!provinceText) {
      provinceText = "None";
    }

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing city</span>
        <br />
        <span className="left">
          <strong>ID:</strong> {city.id}
        </span>
        <span className="right">
          <strong>Name:</strong> {city.name}
        </span>
        <br />
        <span className="left">
          <strong>Population:</strong> {city.population.toLocaleString()}
        </span>
        <span className="right">
          <strong>Province:</strong> {provinceText}
        </span>
      </span>
    );

    setMessage(editingMessage);
    setMessageType("editing");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ name: "", province: "", population: "" });
    setEditingId(null);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    const city = cities.find(function (c) {
      return c.id === id;
    });
    const cityName = city ? city.name : "Unknown city";

    try {
      await deleteCity(id);
      showMessage("Successfully deleted city: " + cityName, "success", 2000);
      await loadCities();
    } catch (err) {
      let attachedTo = [];

      try {
        const res = await fetchPassengers();
        const linked = res.data.filter(function (p) {
          return p.city && p.city.id === id;
        });
        if (linked.length > 0) {
          attachedTo.push("one or more other feilds");
        }
      } catch (e) {}

      let errorMsg = "Cannot delete city: " + cityName;
      if (attachedTo.length > 0) {
        errorMsg += " because it is attached to " + attachedTo.join(" and ") + ".";
      } else {
        errorMsg += " because it is attached to related records.";
      }

      showMessage(errorMsg, "error", 10000);
    }
  }

  if (loading) {
    return <p className="loading-message">Loading cities...</p>;
  }

  let formTitle = "Add New City";
  if (editingId !== null) {
    formTitle = "Edit City";
  }

  let buttonText = "Create";
  if (editingId !== null) {
    buttonText = "Update";
  }

  let noDataText = "No cities yet. To Add one fill out the form above!";
  if (searchTerm !== "") {
    noDataText = "No cities match your search";
  }

  let showCancelButton = false;
  if (editingId !== null) {
    showCancelButton = true;
  }

  return (
    <div className="cities-page">
      <h2 className="cities-title">Cities Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <input
            type="text"
            placeholder="City Name"
            required
            value={form.name}
            onChange={function (e) {
              setForm({ ...form, name: e.target.value });
            }}
            className="cities-input"
          />
          <input
            type="text"
            placeholder="Province"
            value={form.province}
            onChange={function (e) {
              setForm({ ...form, province: e.target.value });
            }}
            className="cities-input"
          />
          <input
            type="number"
            placeholder="Population"
            value={form.population}
            onChange={function (e) {
              setForm({ ...form, population: e.target.value });
            }}
            className="cities-input"
          />
          
          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {buttonText}
            </button>

            {editingId !== null && (
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
        <h3 className="list-title">All Cities ({filteredCities.length})</h3>
        <input
          type="text"
          placeholder="Search by ID, Name, Province, or Population..."
          value={searchTerm}
          onChange={function (e) {
            setSearchTerm(e.target.value);
          }}
          className="search-input"
        />
      </div>

      {filteredCities.length === 0 ? (
        <p className="no-data">
          {noDataText}
        </p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Province</th>
              <th>Population</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCities.map(function (city) {
              let provinceDisplay = "-";
              if (city.province) {
                provinceDisplay = city.province;
              }

              function handleEdit() {
                startEdit(city);
              }

              function handleDeleteClick() {
                handleDelete(city.id);
              }

              return (
                <tr key={city.id}>
                  <td>{city.id}</td>
                  <td>{city.name}</td>
                  <td>{provinceDisplay}</td>
                  <td>{city.population.toLocaleString()}</td>
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