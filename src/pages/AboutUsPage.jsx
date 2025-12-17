import { useState } from "react";
import "../styles/AboutUsPage.css";

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState("who");

  function renderContent() {
    if (activeTab === "who") {
      return (
        <div className="about-info">
          <h2>Who We Are</h2>
          <p>
            CodeBrew Airport is a student-built airport information system created as part of a software development
            project. The goal was to simulate how an airport website might display flights, gates, and other useful
            information for travelers.
          </p>
          <p>
            This project was built by students in St. John's, Newfoundland, and brought together coding skills,
            teamwork, and more coffee than we'd like to admit ☕.
          </p>
        </div>
      );
    }

    if (activeTab === "stand") {
      return (
        <div className="about-info">
          <h2>What We Stand For</h2>
          <p><strong>Clear Information</strong> — Flight details should be easy to find and easy to understand.</p>
          <p><strong>Learning First</strong> — This project exists to help us practice real-world development skills.</p>
          <p><strong>Team Effort</strong> — Everyone contributed, debugged, and helped improve the final result.</p>
          <p><strong>Coffee Breaks</strong> — A necessary part of keeping the airport “running” during long sprints.</p>
        </div>
      );
    }

    if (activeTab === "history") {
      return (
        <div className="about-info">
          <h2>Our History</h2>
          <p>
            CodeBrew Airport began as a simple idea during a development sprint: build a basic airport-style website
            that could display flight information in a clear and organized way.
          </p>
          <p>
            Over the course of the sprint, features were added, layouts were adjusted, and a few bugs tried to delay
            takeoff — but the project eventually came together as a complete student-built airport system.
          </p>
        </div>
      );
    }

    if (activeTab === "sustainability") {
      return (
        <div className="about-info">
          <h2>Sustainability & Responsibility</h2>
          <p>
            While this is only a student project, we still wanted to think about sustainability from an airport
            perspective.
          </p>
          <p>
            We focused on efficient code, simple designs, and reducing unnecessary features to keep the site fast
            and lightweight.
          </p>
          <p>
            It's not a real airport — but it reflects real ideas about responsibility and smart system design.
          </p>
        </div>
      );
    }

    return <p>Select a tab to learn more.</p>;
  }

  function handleTabClick(tab) {
    setActiveTab(tab);
  }

  function getTabClass(tabName) {
    return activeTab === tabName ? "about-tab-btn active" : "about-tab-btn";
  }

  return (
    <div className="about-page">
      {/* Top tab buttons */}
      <div className="about-tabs">
        <button className={getTabClass("who")} onClick={() => handleTabClick("who")}>
          Who We Are
        </button>
        <button className={getTabClass("stand")} onClick={() => handleTabClick("stand")}>
          What We Stand For
        </button>
        <button className={getTabClass("history")} onClick={() => handleTabClick("history")}>
          Our History
        </button>
        <button className={getTabClass("sustainability")} onClick={() => handleTabClick("sustainability")}>
          Sustainability
        </button>
      </div>

      {/* Main card content */}
      <main className="about-main">
        <div className="about-card">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
