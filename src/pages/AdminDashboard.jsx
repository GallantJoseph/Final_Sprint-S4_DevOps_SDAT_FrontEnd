import { useState } from "react";
import CitiesAdmin from "../components/adminTabs/CitiesAdmin";
import PassengersAdmin from "../components/adminTabs/PassengersAdmin";
import AirportsAdmin from "../components/adminTabs/AirportsAdmin";
import GatesAdmin from "../components/adminTabs/GatesAdmin";
import AircraftAdmin from "../components/adminTabs/AircraftAdmin";
import AirlinesAdmin from "../components/adminTabs/AirlinesAdmin";
import FlightsAdmin from "../components/adminTabs/FlightsAdmin";
import "../styles/AdminDashboard.css";


function CitiesTab() {
  return <CitiesAdmin />;
}
function PassengersTab() {
  return <PassengersAdmin />;
}
function AirportsTab() {
  return <AirportsAdmin />;
}
function GatesTab() {
  return <GatesAdmin />
}

function AircraftTab() {
  return <AircraftAdmin />
}

function AirlinesTab() {
  return <AirlinesAdmin />
}
function FlightsTab() {
  return <FlightsAdmin />
}


const TABS = [
  { key: "Cities", component: CitiesTab },
  { key: "Airports", component: AirportsTab },
  { key: "Gates", component: GatesTab },
  { key: "Airlines", component: AirlinesTab },
  { key: "Aircraft", component: AircraftTab },
  { key: "Flights", component: FlightsTab },
  { key: "Passengers", component: PassengersTab },

];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  let ActiveComponent = null;
  for (let i = 0; i < TABS.length; i++) {
    if (TABS[i].key === activeTab) {
      ActiveComponent = TABS[i].component;
      break;
    }
  }

  function handleTabClick(tabKey) {
    setActiveTab(tabKey);
  }

  function renderTabs() {
    const buttons = [];
    for (let i = 0; i < TABS.length; i++) {
      let btnClass = "tab-btn";
      if (activeTab === TABS[i].key) {
        btnClass = "tab-btn active";
      }
      buttons.push(
        <button
          key={TABS[i].key}
          onClick={function() { handleTabClick(TABS[i].key); }}
          className={btnClass}
        >
          {TABS[i].key}
        </button>
      );
    }
    return buttons;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Dashboard</h2>
        <nav className="sidebar-nav">
          {renderTabs()}
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="admin-card">
          {ActiveComponent && <ActiveComponent key={activeTab} />}
          {!ActiveComponent && <p>Select a tab to view content.</p>}
        </div>
      </main>

    </div>
  );
}

