import type { ClothingItem, ClothingItemCreate } from "../types";
import { del, get, putFile, uploadFile } from "./client";

const UPLOADS_BASE = "http://localhost:8000/uploads";

export function getImageUrl(imagePath: string | null): string {
  if (!imagePath) return "";
  return `${UPLOADS_BASE}/${imagePath}`;
}

export async function getItems(params?: {
  category?: string;
  search?: string;
}): Promise<ClothingItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return get<ClothingItem[]>(`/items${qs ? `?${qs}` : ""}`);
}

export async function getItem(id: number): Promise<ClothingItem> {
  return get<ClothingItem>(`/items/${id}`);
}

export async function createItem(
  data: ClothingItemCreate & { image: File },
): Promise<ClothingItem> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("category", data.category);
  if (data.color) formData.append("color", data.color);
  if (data.brand) formData.append("brand", data.brand);
  formData.append("image", data.image);
  return uploadFile<ClothingItem>("/items", formData);
}

export async function updateItem(
  id: number,
  data: {
    name?: string;
    category?: string;
    color?: string;
    brand?: string;
    image?: File | null;
  },
): Promise<ClothingItem> {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.category !== undefined) formData.append("category", data.category);
  if (data.color !== undefined) formData.append("color", data.color);
  if (data.brand !== undefined) formData.append("brand", data.brand);
  if (data.image) formData.append("image", data.image);
  return putFile<ClothingItem>(`/items/${id}`, formData);
}

export async function deleteItem(id: number): Promise<void> {
  await del(`/items/${id}`);
}
