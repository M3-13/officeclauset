import type { OutfitCreate, OutfitDetail } from "../types";
import { del, get, post } from "./client";

export async function getOutfits(): Promise<OutfitDetail[]> {
  return get<OutfitDetail[]>("/outfits");
}

export async function createOutfit(data: OutfitCreate): Promise<OutfitDetail> {
  return post<OutfitDetail>("/outfits", data);
}

export async function getOutfit(id: number): Promise<OutfitDetail> {
  return get<OutfitDetail>(`/outfits/${id}`);
}

export async function deleteOutfit(id: number): Promise<void> {
  await del(`/outfits/${id}`);
}
