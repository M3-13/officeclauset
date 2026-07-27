import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl, getItems } from "../api/items";
import { createOutfit } from "../api/outfits";
import { AuthContext } from "../context/AuthContext";
import type { ClothingItem, OutfitItemCreate } from "../types";

const CATEGORIES = ["Oberteile", "Hosen", "Schuhe", "Accessoires", "Jacken", "Kleider"] as const;

interface Selection {
  clothing_item_id: number;
  category: string;
  item: ClothingItem;
}

export default function OutfitCreator() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [outfitName, setOutfitName] = useState("");
  const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getItems();
      setAllItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const itemsByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = allItems.filter((item) => item.category === cat);
      return acc;
    },
    {} as Record<string, ClothingItem[]>,
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const selectItem = (item: ClothingItem) => {
    const newSelections = new Map(selections);
    newSelections.set(item.category, {
      clothing_item_id: item.id,
      category: item.category,
      item,
    });
    setSelections(newSelections);
  };

  const removeSelection = (category: string) => {
    const newSelections = new Map(selections);
    newSelections.delete(category);
    setSelections(newSelections);
  };

  const handleSave = async () => {
    if (!outfitName.trim()) {
      setSaveError("Bitte geben Sie einen Namen ein.");
      return;
    }
    if (selections.size === 0) {
      setSaveError("Bitte wählen Sie mindestens ein Kleidungsstück aus.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const items: OutfitItemCreate[] = Array.from(selections.values()).map((s) => ({
        clothing_item_id: s.clothing_item_id,
        category: s.category,
      }));
      await createOutfit({ name: outfitName.trim(), items });
      navigate("/outfits");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-fg-muted text-center py-16">Lädt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-error text-center py-16">{error}</p>
      </div>
    );
  }

  const selectedItems = Array.from(selections.values());

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent mb-6" />
        <h1
          className="font-heading text-scale-3xl text-accent text-center mb-4"
          style={{ textShadow: "0 0 30px rgba(255,215,0,0.2)" }}
        >
          Outfit-Creator
        </h1>
        <p className="text-fg-muted text-center">
          Kombinieren Sie Ihre Lieblingsstücke zu einem Outfit
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <h2 className="font-heading text-scale-xl text-accent mb-4">Kategorien</h2>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const catItems = itemsByCategory[cat];
              const isExpanded = expandedCategory === cat;
              const selection = selections.get(cat);

              return (
                <div key={cat} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface hover:bg-bg-card transition-colors text-left min-h-[48px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-body text-scale-base text-fg">{cat}</span>
                      {selection && (
                        <span className="text-scale-xs text-success font-medium">
                          Ausgewählt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-scale-sm text-fg-muted">{catItems.length}</span>
                      <svg
                        className={`w-4 h-4 text-fg-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-border">
                      {selection && (
                        <div className="mb-3 p-2 bg-bg rounded-md border border-accent/30">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-bg-surface">
                              {selection.item.image_path ? (
                                <img
                                  src={getImageUrl(selection.item.image_path)}
                                  alt={selection.item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-scale-xs text-fg-muted">
                                  -
                                </div>
                              )}
                            </div>
                            <span className="text-scale-sm text-fg truncate flex-1">
                              {selection.item.name}
                            </span>
                            <button
                              onClick={() => removeSelection(cat)}
                              className="text-fg-muted hover:text-error transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                              title="Entfernen"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {catItems.length === 0 ? (
                        <p className="text-scale-sm text-fg-muted py-2 text-center">
                          Keine Kleidungsstücke in dieser Kategorie.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                          {catItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectItem(item)}
                              className={`p-2 rounded-md border text-left transition-all min-h-[48px] ${
                                selection?.clothing_item_id === item.id
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-bg hover:border-accent/50"
                              }`}
                            >
                              <div className="w-full aspect-square rounded overflow-hidden bg-bg-surface mb-1">
                                {item.image_path ? (
                                  <img
                                    src={getImageUrl(item.image_path)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-scale-xs text-fg-muted">
                                    Kein Bild
                                  </div>
                                )}
                              </div>
                              <span className="text-scale-xs text-fg truncate block">
                                {item.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div
            className="bg-bg rounded-xl border border-border-gold/30 p-8 relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at center 30%, rgba(255,215,0,0.04) 0%, transparent 65%)",
            }}
          >
            <div className="h-px w-3/5 mx-auto bg-gradient-to-r from-transparent via-accent-dark/25 to-transparent mb-8" />

            <h2
              className="font-heading text-scale-2xl text-accent text-center mb-8"
              style={{ textShadow: "0 0 30px rgba(255,215,0,0.2)" }}
            >
              Dein Look
            </h2>

            {selectedItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-fg-muted text-scale-lg mb-2">
                  Wählen Sie Kleidungsstücke aus den Kategorien aus
                </p>
                <p className="text-fg-muted text-scale-sm">
                  Ihre Auswahl erscheint hier als Live-Vorschau
                </p>
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                {selectedItems.map((sel) => (
                  <div
                    key={sel.category}
                    className="flex items-center gap-4 p-4 bg-bg-surface rounded-lg border border-border"
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-bg">
                      {sel.item.image_path ? (
                        <img
                          src={getImageUrl(sel.item.image_path)}
                          alt={sel.item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-scale-xs text-fg-muted">
                          Kein Bild
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-scale-lg text-fg truncate">
                        {sel.item.name}
                      </h3>
                      <p className="text-scale-sm text-fg-muted">{sel.category}</p>
                      {sel.item.brand && (
                        <p className="text-scale-xs text-fg-muted">{sel.item.brand}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeSelection(sel.category)}
                      className="text-fg-muted hover:text-error transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Entfernen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <label htmlFor="outfitName" className="block text-scale-sm text-fg-muted mb-2">
                  Outfit-Name
                </label>
                <input
                  id="outfitName"
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  maxLength={100}
                  placeholder="Mein neues Outfit..."
                  className="w-full px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
                />
              </div>

              {saveError && (
                <p className="text-error text-scale-sm">{saveError}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || selectedItems.length === 0}
                className="w-full px-5 py-3 rounded-md bg-accent text-bg font-semibold font-body text-scale-base uppercase tracking-wider min-h-[48px] hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(255,215,0,0.4)] active:scale-[0.97] transition-all duration-250 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:shadow-none"
              >
                {saving ? "Speichert..." : "Outfit speichern"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
