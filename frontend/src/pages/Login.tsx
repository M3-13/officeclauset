import { useContext, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/gallery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,215,0,0.06) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 w-full max-w-[440px] mx-4 bg-bg-card border border-border-gold/25 rounded-xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <h2 className="font-heading text-scale-2xl text-accent text-center mb-8">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-error text-scale-sm text-center">{error}</p>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-email"
              className="text-scale-sm text-fg-muted"
            >
              E-Mail
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
              placeholder="ihre@email.de"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-password"
              className="text-scale-sm text-fg-muted"
            >
              Passwort
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-5 py-3 rounded-md bg-accent text-bg font-semibold font-body text-scale-base uppercase tracking-wider min-h-[48px] hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(255,215,0,0.4)] active:scale-[0.97] active:shadow-[0_0_12px_rgba(255,215,0,0.3)] transition-all duration-250 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:shadow-none"
          >
            {loading ? "Lädt..." : "Anmelden"}
          </button>
        </form>

        <p className="text-scale-sm text-fg-muted text-center mt-6">
          Noch kein Konto?{" "}
          <Link
            to="/register"
            className="text-accent hover:text-accent-glow transition-colors underline"
          >
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
