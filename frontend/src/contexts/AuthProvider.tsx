import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { AuthContext } from "./AuthContext";
import type { User, AuthContextType, StoredUser } from "./AuthTypes";

const STORAGE_KEY = "concrete-lab-auth";
const USERS_STORAGE_KEY = "concrete-lab-users";

const DEFAULT_USERS = [
  { id: 1, username: "admin", password: "admin123", nome: "Administrador", role: "admin" as const },
  { id: 2, username: "tecnico", password: "tecnico123", nome: "Técnico Laboratório", role: "user" as const },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }

    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);
  

  const login: AuthContextType["login"] = async (username, password) => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) return false;

    const users: StoredUser[] = JSON.parse(storedUsers);
    const foundUser = users.find((u) => u.username === username && u.password === password);

    if (!foundUser) {
      toast.error("Usuário ou senha incorretos");
      return false;
    }

    const authenticatedUser: User = {
      id: foundUser.id,
      username: foundUser.username,
      nome: foundUser.nome,
      role: foundUser.role,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: authenticatedUser, timestamp: new Date().toISOString() })
    );

    setUser(authenticatedUser);
    toast.success(`Bem-vindo, ${authenticatedUser.nome}!`);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    toast.success("Logout realizado com sucesso");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
