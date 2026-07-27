import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteItem, getImageUrl, getItem } from "../api/items";
import { AuthContext } from "../context/AuthContext";
import type { ClothingItem } from "../types";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    setError("");
    getItem(Number(id))
      .then(setItem)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load item"),
      )
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleDelete = async () => {
    if (!token || !id) return;
    setDeleting(true);
    try {
      await deleteItem(Number(id));
      navigate("/gallery");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete item",
      );
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-fg-muted text-center">Lädt...</p>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-error text-center">{error}</p>
        <div className="text-center mt-4">
          <Link
            to="/gallery"
            className="text-accent hover:text-accent-glow transition-colors underline"
          >
            Zurück zur Galerie
          </Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-fg-muted text-center">Kleidungsstück nicht gefunden.</p>
        <div className="text-center mt-4">
          <Link
            to="/gallery"
            className="text-accent hover:text-accent-glow transition-colors underline"
          >
            Zurück zur Galerie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        to="/gallery"
        className="inline-block text-scale-sm text-fg-muted hover:text-accent transition-colors mb-8"
      >
        &larr; Zurück zur Galerie
      </Link>

      {error && (
        <p className="text-error text-scale-sm mb-4">{error}</p>
      )}

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="aspect-[4/3] bg-bg-surface overflow-hidden">
          {item.image_path ? (
            <img
              src={getImageUrl(item.image_path)}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-fg-muted">
              Kein Bild
            </div>
          )}
        </div>

        <div className="p-8">
          <h1 className="font-heading text-scale-2xl text-accent mb-6">
            {item.name}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <span className="text-scale-sm text-fg-muted block">Kategorie</span>
              <span className="text-scale-lg text-fg">{item.category}</span>
            </div>
            {item.color && (
              <div>
                <span className="text-scale-sm text-fg-muted block">Farbe</span>
                <span className="text-scale-lg text-fg">{item.color}</span>
              </div>
            )}
            {item.brand && (
              <div>
                <span className="text-scale-sm text-fg-muted block">Marke</span>
                <span className="text-scale-lg text-fg">{item.brand}</span>
              </div>
            )}
            <div>
              <span className="text-scale-sm text-fg-muted block">
                Hinzugefügt am
              </span>
              <span className="text-scale-lg text-fg">
                {new Date(item.created_at).toLocaleDateString("de-DE")}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/items/${item.id}/edit`}
              className="px-5 py-3 rounded-md border-[1.5px] border-accent text-accent font-medium uppercase tracking-wider min-h-[48px] hover:bg-accent/8 hover:border-accent-glow hover:text-accent-glow hover:shadow-[0_0_16px_rgba(255,215,0,0.2)] transition-all duration-250"
            >
              Bearbeiten
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-3 rounded-md border-[1.5px] border-error text-error font-medium uppercase tracking-wider min-h-[48px] hover:bg-error/8 transition-all duration-250"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay">
          <div className="bg-bg-modal border border-border rounded-xl p-8 max-w-md mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <h3 className="font-heading text-scale-xl text-accent mb-4">
              Wirklich löschen?
            </h3>
            <p className="text-fg-muted mb-6">
              Möchten Sie &quot;{item.name}&quot; wirklich löschen? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-md border border-border text-fg-muted min-h-[44px] hover:border-fg-muted transition-colors disabled:opacity-40"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-error text-fg font-semibold min-h-[44px] hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {deleting ? "Löschen..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
