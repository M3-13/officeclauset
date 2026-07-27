import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { del } from "../api/client";
import { AuthContext } from "../context/AuthContext";

export default function Settings() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await del("/users/me");
      logout();
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Löschung fehlgeschlagen",
      );
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-heading text-scale-2xl text-accent mb-6">
        Einstellungen
      </h1>

      <section className="bg-bg-card border border-error/30 rounded-lg p-6 max-w-[520px]">
        <h2 className="font-heading text-scale-xl text-error mb-2">
          Konto löschen
        </h2>
        <p className="text-scale-sm text-fg-muted mb-4">
          Dies löscht unwiderruflich alle deine Daten, Kleidungsstücke, Outfits
          und Bilder.
        </p>

        {error && (
          <p className="text-error text-scale-sm mb-3">{error}</p>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="px-5 py-3 rounded-md bg-transparent text-error border border-error font-medium font-body min-h-[48px] hover:bg-[rgba(224,85,85,0.1)] hover:shadow-[0_0_16px_rgba(224,85,85,0.25)] active:bg-[rgba(224,85,85,0.18)] transition-all duration-250 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
        >
          Mein Konto löschen
        </button>
      </section>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.75)] backdrop-blur-[8px]"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative z-10 bg-bg-modal border border-border-gold/25 rounded-xl p-8 max-w-[520px] mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(255,215,0,0.05)]">
            <div className="flex justify-center mb-6">
              <div className="w-1/2 h-[2px] bg-accent/60" />
            </div>
            <h2 className="font-heading text-scale-xl text-fg text-center mb-3">
              Wirklich löschen?
            </h2>
            <p className="text-scale-sm text-fg-muted text-center mb-6">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine
              Daten, Kleidungsstücke, Outfits und Bilder werden unwiderruflich
              gelöscht.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-5 py-3 rounded-md bg-transparent text-accent border border-accent font-medium font-body min-h-[48px] hover:bg-[rgba(255,215,0,0.08)] hover:border-accent-glow hover:text-accent-glow hover:shadow-[0_0_16px_rgba(255,215,0,0.2)] active:bg-[rgba(255,215,0,0.14)] transition-all duration-250 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-3 rounded-md bg-transparent text-error border border-error font-medium font-body min-h-[48px] hover:bg-[rgba(224,85,85,0.1)] hover:shadow-[0_0_16px_rgba(224,85,85,0.25)] active:bg-[rgba(224,85,85,0.18)] transition-all duration-250 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                {loading ? "Wird gelöscht..." : "Löschen bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
