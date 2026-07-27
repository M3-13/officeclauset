import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../api/items";
import { getOutfits } from "../api/outfits";
import { AuthContext } from "../context/AuthContext";
import type { OutfitDetail } from "../types";

export default function Outfits() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<OutfitDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getOutfits()
      .then((data) => setOutfits(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load outfits"))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent mb-6" />
        <h1
          className="font-heading text-scale-3xl text-accent text-center mb-4"
          style={{ textShadow: "0 0 30px rgba(255,215,0,0.2)" }}
        >
          Outfits
        </h1>
        <p className="text-fg-muted text-center">Ihre gespeicherten Outfits</p>
      </div>

      <div className="mb-8">
        <button
          onClick={() => navigate("/outfit-creator")}
          className="px-5 py-3 rounded-md bg-accent text-bg font-semibold font-body text-scale-base uppercase tracking-wider min-h-[48px] hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(255,215,0,0.4)] active:scale-[0.97] transition-all duration-250"
        >
          + Neues Outfit
        </button>
      </div>

      {error && <p className="text-error text-scale-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-fg-muted text-center py-16">Lädt...</p>
      ) : outfits.length === 0 ? (
        <p className="text-fg-muted text-center py-16">
          Noch keine Outfits. Erstellen Sie Ihr erstes Outfit im Creator!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {outfits.map((outfit) => {
            const coverItem = outfit.items[0]?.clothing_item;

            return (
              <Link
                key={outfit.id}
                to={`/outfits/${outfit.id}`}
                className="group bg-bg-card border border-border-gold/30 rounded-lg overflow-hidden hover:border-accent/70 hover:shadow-[0_8px_40px_rgba(255,215,0,0.15)] hover:-translate-y-1 transition-all duration-350"
              >
                <div className="aspect-[3/4] bg-bg-surface overflow-hidden relative">
                  {coverItem?.image_path ? (
                    <img
                      src={getImageUrl(coverItem.image_path)}
                      alt={outfit.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-fg-muted text-scale-sm">
                      Kein Bild
                    </div>
                  )}
                  {outfit.items.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-bg/80 text-scale-xs text-fg-muted px-2 py-1 rounded-pill border border-border">
                      +{outfit.items.length - 1}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-border-gold/25">
                  <h3 className="font-heading text-scale-lg text-fg truncate">
                    {outfit.name}
                  </h3>
                  <p className="text-scale-sm text-fg-muted mt-1">
                    {outfit.items.length} Stück{outfit.items.length !== 1 ? "e" : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
