export interface User {
  id: number;
  email: string;
}

export interface ClothingItem {
  id: number;
  user_id: number;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  image_path: string | null;
  created_at: string;
}

export interface Outfit {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
}

export interface OutfitItem {
  id: number;
  clothing_item_id: number;
  category: string;
  clothing_item: ClothingItem | null;
}

export interface OutfitDetail extends Outfit {
  items: OutfitItem[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, privacyConsent: boolean) => Promise<void>;
  logout: () => void;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  privacy_accepted: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ClothingItemCreate {
  name: string;
  category: string;
  color?: string;
  brand?: string;
}

export interface OutfitItemCreate {
  clothing_item_id: number;
  category: string;
}

export interface OutfitCreate {
  name: string;
  items: OutfitItemCreate[];
}
