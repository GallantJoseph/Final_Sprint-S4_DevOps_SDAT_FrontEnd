import { useState } from "react";
import "../styles/AdminDashboard.css";

// Placeholder tab components
function AirportsTab() {
  return <div>Airports management content here</div>;
}
function FlightsTab() {
  return <div>Flights management content here</div>;
}
function AirlinesTab() {
  return <div>Airlines management content here</div>;
}
function AircraftTab() {
  return <div>Aircraft management content here</div>;
}
function GatesTab() {
  return <div>Gates management content here</div>;
}
function PassengersTab() {
  return <div>Passengers management content here</div>;
}

const TABS = [
  { key: "Airports", component: AirportsTab },
  { key: "Flights", component: FlightsTab },
  { key: "Airlines", component: AirlinesTab },
  { key: "Aircraft", component: AircraftTab },
  { key: "Gates", component: GatesTab },
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
          {ActiveComponent && <ActiveComponent />}
          {!ActiveComponent && <p>Select a tab to view content.</p>}
        </div>
      </main>
    </div>
  );
}

