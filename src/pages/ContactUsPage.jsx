import { useState } from "react";
import "../styles/ContactUsPage.css";

export default function ContactUsPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [submitted, setSubmitted] = useState(false);

  function renderContent() {
    if (activeTab === "info") {
      return (
        <div className="contact-info">
          <h2>Contact Info</h2>
          <p><strong>Mailing Address:</strong> CodeBrew Lane, St. John's, Newfoundland</p>
          <p><strong>Telephone:</strong> 1-800-AIRCODE</p>
          <p><strong>Fax:</strong> 1-800-AIRBREW</p>
          <p><strong>Email:</strong> info@CodeBrewAirways.com</p>
        </div>
      );
    }

    if (activeTab === "feedback") {
      if (submitted) {
        return (
          <div className="contact-success">
            <h2>Thank you!</h2>
            <p>Your message has been successfully submitted.</p>
          </div>
        );
      }

      return (
        <div className="contact-feedback">
          <h2>Customer Feedback</h2>
          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true); 
            }}
          >
            <input type="text" placeholder="Name" className="contact-input" required />
            <input type="email" placeholder="Email" className="contact-input" required />
            <textarea placeholder="Message" rows="4" className="contact-input" required />
            <button type="submit" className="contact-btn">Send</button>
          </form>
        </div>
      );
    }

    return <p>Select a tab to see content.</p>;
  }

  function handleInfoClick() {
    setActiveTab("info");
    setSubmitted(false); 
  }

  function handleFeedbackClick() {
    setActiveTab("feedback");
    setSubmitted(false); 
  }

  function getTabClass(tabName) {
    if (activeTab === tabName) {
      return "contact-tab-btn active";
    } else {
      return "contact-tab-btn";
    }
  }

  return (
    <div className="contact-page">
      {/* Top tab buttons */}
      <div className="contact-tabs">
        <button className={getTabClass("info")} onClick={handleInfoClick}>
          Contact Info
        </button>
        <button className={getTabClass("feedback")} onClick={handleFeedbackClick}>
          Customer Feedback
        </button>
      </div>

      {/* Main card content */}
      <main className="contact-main">
        <div className="contact-card">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
