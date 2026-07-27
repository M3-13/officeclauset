import { useContext, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createItem, getImageUrl, getItem, updateItem } from "../api/items";
import { AuthContext } from "../context/AuthContext";
import type { ClothingItem } from "../types";

const CATEGORIES = ["Oberteile", "Hosen", "Schuhe", "Accessoires", "Jacken", "Kleider"];

export default function ItemForm() {
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (!id || !token) return;
    setFetching(true);
    getItem(Number(id))
      .then((item: ClothingItem) => {
        setName(item.name);
        setCategory(item.category);
        setColor(item.color || "");
        setBrand(item.brand || "");
        setExistingImage(getImageUrl(item.image_path));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load item"),
      )
      .finally(() => setFetching(false));
  }, [id, token]);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Name ist erforderlich");
      }
      if (!category) {
        throw new Error("Kategorie ist erforderlich");
      }
      if (!isEditing && !imageFile) {
        throw new Error("Bild ist erforderlich");
      }

      if (isEditing && id) {
        const updateData: {
          name?: string;
          category?: string;
          color?: string;
          brand?: string;
          image?: File | null;
        } = {};
        updateData.name = name.trim();
        updateData.category = category;
        if (color.trim()) {
          updateData.color = color.trim();
        }
        if (brand.trim()) {
          updateData.brand = brand.trim();
        }
        if (imageFile) {
          updateData.image = imageFile;
        }
        await updateItem(Number(id), updateData);
      } else {
        await createItem({
          name: name.trim(),
          category,
          color: color.trim() || undefined,
          brand: brand.trim() || undefined,
          image: imageFile!,
        });
      }
      navigate("/gallery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-fg-muted text-center">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,215,0,0.06) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 w-full max-w-[520px] mx-4 bg-bg-card border border-border-gold/25 rounded-xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <h2 className="font-heading text-scale-2xl text-accent text-center mb-8">
          {isEditing ? "Bearbeiten" : "Neues Kleidungsstück"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-error text-scale-sm text-center">{error}</p>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="item-name" className="text-scale-sm text-fg-muted">
              Name *
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
              placeholder="z.B. Schwarze Lederjacke"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="item-category"
              className="text-scale-sm text-fg-muted"
            >
              Kategorie *
            </label>
            <select
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23B0A89A'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "36px",
              }}
            >
              <option value="" disabled>
                Bitte wählen...
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="item-color"
              className="text-scale-sm text-fg-muted"
            >
              Farbe
            </label>
            <input
              id="item-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              maxLength={50}
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
              placeholder="z.B. Schwarz"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="item-brand"
              className="text-scale-sm text-fg-muted"
            >
              Marke
            </label>
            <input
              id="item-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              maxLength={50}
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] placeholder:text-fg-muted focus:border-accent focus:outline-none focus:shadow-[0_0_12px_rgba(255,215,0,0.2)] transition-shadow"
              placeholder="z.B. Boss"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="item-image"
              className="text-scale-sm text-fg-muted"
            >
              Bild {!isEditing && "*"}
            </label>
            <input
              ref={fileInputRef}
              id="item-image"
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] ?? null)
              }
              className="px-3 py-2 rounded-md bg-bg text-fg border border-border text-scale-base min-h-[48px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-accent file:text-bg file:font-semibold file:cursor-pointer file:hover:bg-accent-glow file:transition-colors"
            />
            {(imagePreview || existingImage) && (
              <div className="mt-2 rounded-md overflow-hidden border border-border">
                <img
                  src={imagePreview || existingImage}
                  alt="Vorschau"
                  className="w-full max-h-48 object-contain bg-bg-surface"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-5 py-3 rounded-md bg-accent text-bg font-semibold font-body text-scale-base uppercase tracking-wider min-h-[48px] hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(255,215,0,0.4)] active:scale-[0.97] active:shadow-[0_0_12px_rgba(255,215,0,0.3)] transition-all duration-250 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:shadow-none"
          >
            {loading ? "Speichern..." : isEditing ? "Aktualisieren" : "Erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}
