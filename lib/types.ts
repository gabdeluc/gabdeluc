// Types per l'applicazione

export interface User {
  id: number;
  username: string;
  password: string; // hashed
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: Buffer | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export type SafeUser = Omit<User, 'password'>;

export type ProductWithImage = Product & {
  imageUrl?: string;
};