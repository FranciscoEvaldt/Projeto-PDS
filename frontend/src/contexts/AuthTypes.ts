export interface User {
  id: number;
  username: string;
  nome: string;
  role: 'admin' | 'user' | 'manager' | 'viewer';
}

export interface StoredUser extends User {
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
