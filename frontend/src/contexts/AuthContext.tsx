import { AuthResponse, User, usersApi } from '../services/api';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserSession {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: UserSession | null;
  users: User[];
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadUsers: () => Promise<void>;
  addUser: (user: { username: string; password: string; name: string; role: 'admin' | 'user' }) => Promise<void>;
  updateUser: (id: number, updates: { name?: string; role?: 'admin' | 'user' }) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Carregar sessão ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('labconcreto_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('labconcreto_user');
      }
    }
    setIsLoadingAuth(false);
  }, []);

  // Carregar lista de usuários
  const loadUsers = async () => {
    try {
      const usersData = await usersApi.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Não mostrar toast aqui para não poluir a UI
      // Se der erro 404, significa que o backend não foi reiniciado
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('⚠️ Rota /api/users não encontrada. Reinicie o backend!');
      }
    }
  };

  // Carregar usuários quando usuário for admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      // Aguardar um pouco antes de carregar para dar tempo do backend iniciar
      const timer = setTimeout(() => {
        loadUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response: AuthResponse = await usersApi.authenticate(username, password);
      
      const userData: UserSession = {
        id: response.id,
        username: response.username,
        name: response.name,
        role: response.role,
      };
      
      setUser(userData);
      localStorage.setItem('labconcreto_user', JSON.stringify(userData));
      return true;
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('labconcreto_user');
  };

  const addUser = async (newUser: { username: string; password: string; name: string; role: 'admin' | 'user' }) => {
    try {
      const createdUser = await usersApi.create(newUser);
      setUsers([...users, createdUser]);
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  };

  const updateUser = async (id: number, data: Partial<User>) => {
    try {
      const updatedUser = await usersApi.update(id, data);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
      
      // Se está editando o próprio usuário, atualiza a sessão
      if (user && user.id === id) {
        const updatedSession = { ...user, ...updatedUser };
        setUser(updatedSession);
        localStorage.setItem('labconcreto_user', JSON.stringify(updatedSession));
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await usersApi.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error: unknown) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        isLoadingAuth,
        login,
        logout,
        loadUsers,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}