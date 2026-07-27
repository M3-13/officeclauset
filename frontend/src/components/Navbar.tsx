import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-bg-surface border-b border-border h-16 flex items-center justify-between px-6">
      <Link
        to="/"
        className="font-heading text-2xl text-accent tracking-wider"
        style={{ textShadow: "0 0 20px rgba(255,215,0,0.3)" }}
      >
        OfficeClauset
      </Link>

      <div className="flex items-center gap-8">
        {isAuthenticated ? (
          <>
            <Link
              to="/gallery"
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Galerie
            </Link>
            <Link
              to="/outfits"
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Outfits
            </Link>
            <Link
              to="/outfit-creator"
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Creator
            </Link>
            <Link
              to="/settings"
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Einstellungen
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm uppercase tracking-widest text-fg-muted hover:text-accent transition-colors"
            >
              Registrierung
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
