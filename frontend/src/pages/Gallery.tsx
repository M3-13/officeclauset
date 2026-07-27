import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl, getItems } from "../api/items";
import { AuthContext } from "../context/AuthContext";
import type { ClothingItem } from "../types";

const CATEGORIES = ["Oberteile", "Hosen", "Schuhe", "Accessoires", "Jacken", "Kleider"];

export default function Gallery() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params: { category?: string; search?: string } = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      const data = await getItems(params);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent mb-6" />
        <h1
          className="font-heading text-scale-3xl text-accent text-center mb-4"
          style={{ textShadow: "0 0 30px rgba(255,215,0,0.2)" }}
        >
          Galerie
        </h1>
        <p className="text-fg-muted text-center">Ihre Garderobe</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-pill text-scale-sm font-medium transition-all ${
              selectedCategory === null
                ? "bg-accent text-bg"
                : "bg-bg-surface text-fg-muted border border-border hover:border-accent"
            }`}
          >
            Alle
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-pill text-scale-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-accent text-bg"
                  : "bg-bg-surface text-fg-muted border border-border hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => navigate("/items/new")}
          className="px-5 py-3 rounded-md bg-accent text-bg font-semibold font-body text-scale-base uppercase tracking-wider min-h-[48px] hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(255,215,0,0.4)] active:scale-[0.97] transition-all duration-250"
        >
          + Neues Kleidungsstück
        </button>
      </div>

      {error && <p className="text-error text-scale-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-fg-muted text-center py-16">Lädt...</p>
      ) : items.length === 0 ? (
        <p className="text-fg-muted text-center py-16">
          {search || selectedCategory
            ? "Keine Kleidungsstücke gefunden."
            : "Noch keine Kleidungsstücke. Legen Sie Ihr erstes Stück an!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="group bg-bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-[0_0_24px_rgba(255,215,0,0.15)] transition-all duration-250"
            >
              <div className="aspect-square bg-bg-surface overflow-hidden">
                {item.image_path ? (
                  <img
                    src={getImageUrl(item.image_path)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-fg-muted text-scale-sm">
                    Kein Bild
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-heading text-scale-lg text-fg truncate">
                  {item.name}
                </h3>
                <p className="text-scale-sm text-fg-muted mt-1">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
