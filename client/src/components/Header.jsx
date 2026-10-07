import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import api from "../api/axios";
import "../styles/header.css";

function Header() {
  const { user, setUser } = useAuth();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="header-container">
      <Link to="/" className="title-link">
        <h1 className="header-title">Gakuran</h1>
      </Link>

      <div className="header-actions">
        {user ? (
          <>
            <span className="username">
              {user.username}
            </span>

            <button
              onClick={handleLogout}
              className="btn-register"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">
              Login
            </Link>

            <Link to="/register" className="btn-register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;