import { useState, useEffect } from "react";
import {
  fetchPassengers,
  fetchCities,
  fetchFlights,
  createPassenger,
  updatePassenger,
  deletePassenger,
  removePassengerFromFlight,
} from "../../api/api";
import "../../styles/AdminTabs.css";

export default function PassengersAdmin() {
  const [passengers, setPassengers] = useState([]);
  const [allPassengers, setAllPassengers] = useState([]);
  const [cities, setCities] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    cityId: "",
    flightId: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(function () {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [passengersRes, citiesRes, flightsRes] = await Promise.all([
        fetchPassengers(),
        fetchCities(),
        fetchFlights(),
      ]);
      setAllPassengers(passengersRes.data);
      setPassengers(passengersRes.data);
      setCities(citiesRes.data);
      setFlights(flightsRes.data);
      setLoading(false);
    } catch (err) {
      showMessage("Failed to load data", "error");
      setLoading(false);
    }
  }

  useEffect(function () {
    if (searchTerm === "") {
      setPassengers(allPassengers);
    } else {
      const term = searchTerm.toLowerCase();
      const results = [];

      for (let i = 0; i < allPassengers.length; i++) {
        const p = allPassengers[i];
        const fullName = (p.firstName + " " + p.lastName).toLowerCase();

        let matches = false;

        if (p.id.toString().includes(term)) matches = true;
        if (fullName.includes(term)) matches = true;
        if (p.phone && p.phone.toLowerCase().includes(term)) matches = true;
        if (p.city && p.city.name.toLowerCase().includes(term)) matches = true;

        if (p.flights && p.flights.length > 0) {
          for (let j = 0; j < p.flights.length; j++) {
            const f = p.flights[j];
            if (f.departureAirport && f.departureAirport.code.toLowerCase().includes(term)) matches = true;
            if (f.arrivalAirport && f.arrivalAirport.code.toLowerCase().includes(term)) matches = true;
            if (f.status && f.status.toLowerCase().includes(term)) matches = true;
          }
        }

        if (matches) results.push(p);
      }

      setPassengers(results);
    }
  }, [searchTerm, allPassengers]);

  function showMessage(text, type, duration = 8000) {
    setMessage(text);
    setMessageType(type);
    setTimeout(function () {
      setMessage("");
      setMessageType("");
    }, duration);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.cityId === "") {
      showMessage("City is required", "error");
      return;
    }

    if (editingId === null && form.flightId === "") {
      showMessage("Flight is required when adding a new passenger", "error");
      return;
    }

    const passengerData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || null,
    };

    const cityId = Number(form.cityId);
    const flightId = form.flightId !== "" ? Number(form.flightId) : null;

    try {
      if (editingId !== null) {
        await updatePassenger(editingId, passengerData, cityId);
        resetForm();
        showMessage(`Updated: ${passengerData.firstName} ${passengerData.lastName}`, "success");
      } else {
        await createPassenger(passengerData, cityId, flightId);
        resetForm();
        showMessage(`Added & booked: ${passengerData.firstName} ${passengerData.lastName}`, "success");
      }
      await loadData();
    } catch (err) {
      showMessage("Operation failed. Try again.", "error");
    }
  }

  function startEdit(passenger) {
    setForm({
      firstName: passenger.firstName || "",
      lastName: passenger.lastName || "",
      phone: passenger.phone || "",
      cityId: passenger.city ? passenger.city.id.toString() : "",
      flightId: "",
    });
    setEditingId(passenger.id);

    let cityDisplay = "None";
    if (passenger.city) {
      cityDisplay = passenger.city.name + (passenger.city.province ? ", " + passenger.city.province : "");
    }

    let phoneDisplay = passenger.phone || "None";

    const editingMessage = (
      <span className="edit-mesg">
        <span className="edit-header">Now editing passenger</span>
        <br />
        <span className="left"><strong>ID:</strong> {passenger.id}</span>
        <span className="right"><strong>Name:</strong> {passenger.firstName} {passenger.lastName}</span>
        <br />
        <span className="left"><strong>Phone:</strong> {phoneDisplay}</span>
        <span className="right"><strong>City:</strong> {cityDisplay}</span>
      </span>
    );

    setMessage(editingMessage);
    setMessageType("editing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ firstName: "", lastName: "", phone: "", cityId: "", flightId: "" });
    setEditingId(null);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    const passenger = passengers.find(p => p.id === id);

    if (passenger && passenger.flights && passenger.flights.length > 0) {
      let removeSuccess = true;
      for (let i = 0; i < passenger.flights.length; i++) {
        const flightId = passenger.flights[i].id;
        try {
          await removePassengerFromFlight(flightId, id);
        } catch (err) {
          removeSuccess = false;
        }
      }

      if (!removeSuccess) {
        showMessage("Could not remove passenger from all flights", "error");
        return;
      }
    }

    try {
      await deletePassenger(id);
      showMessage("Passenger deleted successfully", "success", 3000);
      await loadData();
    } catch (err) {
      showMessage("Delete failed after removing from flights", "error");
    }
  }

  if (loading) {
    return <p className="loading-message">Loading passengers and data...</p>;
  }

  let formTitle = editingId !== null ? "Edit Passenger" : "Add New Passenger (and Book on Flight)";
  let buttonText = editingId !== null ? "Update" : "Create & Book";
  let showCancelButton = editingId !== null;

  let noCitiesAvailable = cities.length === 0;
  let noFlightsAvailable = flights.length === 0;

  return (
    <div className="cities-page">
      <h2 className="cities-title">Passengers Management</h2>

      <div className="cities-card">
        <h3 className="form-title">{formTitle}</h3>

        <form onSubmit={handleSubmit} className="cities-form">
          <input
            type="text"
            placeholder="First Name"
            required
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            className="cities-input"
          />
          <input
            type="text"
            placeholder="Last Name"
            required
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            className="cities-input"
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="cities-input"
          />

          <div>
            <label className="form-label">City:  </label>
            {noCitiesAvailable ? (
              <p className="no-data" style={{ margin: "10px 0", color: "#fb923c" }}>
                Create a city first in Cities tab.
              </p>
            ) : (
              <select
                required
                value={form.cityId}
                onChange={e => setForm({ ...form, cityId: e.target.value })}
                className="cities-input"
              >
                <option value="">-- Select city --</option>
                {cities.map(city => {
                  let text = city.name;
                  if (city.province) text += ", " + city.province;
                  text += ` (Pop: ${city.population.toLocaleString()})`;
                  return <option key={city.id} value={city.id}>{text}</option>;
                })}
              </select>
            )}
          </div>

          {editingId === null && (
            <div>
              <label className="form-label">Book on Flight:  </label>
              {noFlightsAvailable ? (
                <p className="no-data" style={{ margin: "10px 0", color: "#fb923c" }}>
                  Create a flight first in Flights tab.
                </p>
              ) : (
                <select
                  required
                  value={form.flightId}
                  onChange={e => setForm({ ...form, flightId: e.target.value })}
                  className="cities-input"
                >
                  <option value="">-- Select flight --</option>
                  {flights.map(f => {
                    let from = f.departureAirport ? f.departureAirport.code : "?";
                    let to = f.arrivalAirport ? f.arrivalAirport.code : "?";
                    let time = f.departureTime ? new Date(f.departureTime).toLocaleString() : "No time";
                    return <option key={f.id} value={f.id}>{from} To {to} ({time})</option>;
                  })}
                </select>
              )}
            </div>
          )}

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
        <h3 className="list-title">All Passengers ({passengers.length})</h3>
        <input
          type="text"
          placeholder="Search by name, phone, city, or flight..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {passengers.length === 0 ? (
        <p className="no-data">No passengers yet. Add one above!</p>
      ) : (
        <table className="cities-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Booked Flight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map(function (p) {
              let phoneDisplay = p.phone || "-";

              let cityDisplay = "-";
              if (p.city) {
                cityDisplay = p.city.name + (p.city.province ? ", " + p.city.province : "");
              }

              let flightDisplay = "Not booked";
              if (p.flights && p.flights.length > 0) {
                const f = p.flights[0];
                const from = f.departureAirport ? f.departureAirport.code : "?";
                const to = f.arrivalAirport ? f.arrivalAirport.code : "?";
                flightDisplay = `${from} To ${to}`;
              }

              function handleEdit() { startEdit(p); }
              function handleDeleteClick() { handleDelete(p.id); }

              return (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{phoneDisplay}</td>
                  <td>{cityDisplay}</td>
                  <td><strong>{flightDisplay}</strong></td>
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