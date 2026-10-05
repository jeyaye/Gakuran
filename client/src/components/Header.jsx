import { Link } from "react-router-dom"
import '../styles/header.css';

function Header() {
  return (
    <header className="header-container">
      <Link to="/" className="title-link">
        <h1 className="header-title">Gakuran</h1>
      </Link>
      
      <div className="header-actions">
        <Link to="/login" className="btn-login">Login</Link>
        <Link to="/register" className="btn-register">Register</Link>
      </div>
    </header>
  );
}

export default Header;