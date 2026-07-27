import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getImageUrl } from "../api/items";
import { deleteOutfit, getOutfit } from "../api/outfits";
import { AuthContext } from "../context/AuthContext";
import type { OutfitDetail as OutfitDetailType } from "../types";

export default function OutfitDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState<OutfitDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    setError("");
    getOutfit(Number(id))
      .then((data) => setOutfit(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load outfit"))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteOutfit(Number(id));
      navigate("/outfits");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen");
      setShowDeleteDialog(false);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-fg-muted text-center py-16">Lädt...</p>
      </div>
    );
  }

  if (error && !outfit) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-error text-center py-16">{error}</p>
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-fg-muted text-center py-16">Outfit nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate("/outfits")}
          className="text-scale-sm text-fg-muted hover:text-accent transition-colors inline-flex items-center gap-2 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Übersicht
        </button>
      </div>

      <div className="mb-8">
        <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent mb-6" />
        <h1
          className="font-heading text-scale-3xl text-accent text-center mb-2"
          style={{ textShadow: "0 0 30px rgba(255,215,0,0.2)" }}
        >
          {outfit.name}
        </h1>
        <p className="text-fg-muted text-center text-scale-sm">
          {outfit.items.length} Stück{outfit.items.length !== 1 ? "e" : ""}
        </p>
      </div>

      <div
        className="bg-bg rounded-xl border border-border-gold/30 p-8 mb-8 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center 30%, rgba(255,215,0,0.04) 0%, transparent 65%)",
        }}
      >
        {outfit.items.length === 0 ? (
          <p className="text-fg-muted text-center py-8">Dieses Outfit enthält keine Kleidungsstücke.</p>
        ) : (
          <div className="space-y-6">
            {outfit.items.map((outfitItem) => {
              const item = outfitItem.clothing_item;
              if (!item) return null;

              return (
                <div
                  key={outfitItem.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-bg-surface rounded-lg border border-border"
                >
                  <div className="w-full sm:w-48 aspect-[3/4] rounded-md overflow-hidden flex-shrink-0 bg-bg">
                    {item.image_path ? (
                      <img
                        src={getImageUrl(item.image_path)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-scale-sm text-fg-muted">
                        Kein Bild
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-3 py-1 rounded-pill bg-accent/10 text-accent border border-accent-dark/30 text-scale-xs font-medium uppercase tracking-wide mb-2">
                      {outfitItem.category}
                    </span>
                    <h3 className="font-heading text-scale-xl text-fg mb-1">{item.name}</h3>
                    {item.brand && (
                      <p className="text-scale-sm text-fg-muted mb-1">{item.brand}</p>
                    )}
                    {item.color && (
                      <p className="text-scale-sm text-fg-muted">{item.color}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="px-8 py-3 rounded-md bg-transparent text-error border border-error font-medium font-body text-scale-base min-h-[48px] hover:bg-error/10 hover:shadow-[0_0_16px_rgba(224,85,85,0.25)] active:bg-error/20 transition-all duration-250"
        >
          Outfit löschen
        </button>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-overlay backdrop-blur-sm">
          <div className="bg-bg-modal border border-border-gold/25 rounded-xl p-8 max-w-[520px] w-full shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(255,215,0,0.05)]">
            <div className="w-1/2 h-0.5 mx-auto bg-accent mb-6" />
            <h2 className="font-heading text-scale-xl text-fg text-center mb-4">
              {outfit.name}
            </h2>
            <p className="text-fg-muted text-center mb-8">Wirklich löschen?</p>
            {error && (
              <p className="text-error text-scale-sm mb-4 text-center">{error}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="flex-1 px-5 py-3 rounded-md bg-transparent text-accent border border-accent font-medium font-body text-scale-base min-h-[48px] hover:bg-accent/10 hover:border-accent-glow hover:text-accent-glow hover:shadow-[0_0_16px_rgba(255,215,0,0.2)] transition-all duration-250 disabled:opacity-35"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-5 py-3 rounded-md bg-transparent text-error border border-error font-medium font-body text-scale-base min-h-[48px] hover:bg-error/10 hover:shadow-[0_0_16px_rgba(224,85,85,0.25)] active:bg-error/20 transition-all duration-250 disabled:opacity-35"
              >
                {deleting ? "Löscht..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
