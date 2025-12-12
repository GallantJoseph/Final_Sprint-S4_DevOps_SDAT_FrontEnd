import { Link, useLocation, useNavigate } from "react-router-dom";
// import "../styles/Header.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  let isAdmin;
  if (localStorage.getItem("isAdmin") === "true") {
    isAdmin = true;
  } else {
    isAdmin = false;
  }

  function isActive(path) {
    if (path === "/") {
      if (location.pathname === "/") {
        return true;
      } else {
        return false;
      }
    } else {
      if (location.pathname.startsWith(path)) {
        return true;
      } else {
        return false;
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    navigate("/");
  }

  let dashboardPath;
  let dashboardText;

  if (isAdmin) {
    dashboardPath = "/admin/dashboard";
    dashboardText = "Admin Dashboard";
  } else {
    dashboardPath = "/user/dashboard";
    dashboardText = "Dashboard";
  }

  let homeClass = "nav-link";
  if (isActive("/")) {
    homeClass = "nav-link active";
  }

  let dashboardClass = "nav-link";
  if (isActive(dashboardPath)) {
    dashboardClass = "nav-link active";
  }

  let aboutClass = "nav-link";
  if (isActive("/about")) {
    aboutClass = "nav-link active";
  }

  let contactClass = "nav-link";
  if (isActive("/contact")) {
    contactClass = "nav-link active";
  }

  let adminClass = "nav-link";
  if (isActive("/admin")) {
    adminClass = "nav-link active";
  }

  if (isAdmin) {
    return (
      <header className="header">
        <nav className="nav-container">
          <h1 className="site-title">CodeBrew Airways</h1>
          <div className="nav-links">
            <Link to="/" className={homeClass}>
              Home
            </Link>

            <Link to={dashboardPath} className={dashboardClass}>
              {dashboardText}
            </Link>

            <Link to="/about" className={aboutClass}>
              About Us
            </Link>

            <Link to="/contact" className={contactClass}>
              Contact Us
            </Link>

            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
      </header>
    );
  } else {
    return (
      <header className="header">
        <nav className="nav-container">
          <h1 className="site-title">CodeBrew Airways</h1>
          <div className="nav-links">
            <Link to="/" className={homeClass}>
              Home
            </Link>

            <Link to={dashboardPath} className={dashboardClass}>
              {dashboardText}
            </Link>

            <Link to="/about" className={aboutClass}>
              About Us
            </Link>

            <Link to="/contact" className={contactClass}>
              Contact Us
            </Link>

            <Link to="/admin" className={adminClass}>
              Admin
            </Link>
          </div>
        </nav>
      </header>
    );
  }
}
