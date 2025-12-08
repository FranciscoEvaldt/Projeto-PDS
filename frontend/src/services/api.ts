import type { Company, Work, Load, Sample } from '../types';

// Tipo para User
export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

const API_BASE_URL = 'http://localhost:3001/api';

// Export para outros componentes usarem
export const getApiBaseUrl = () => API_BASE_URL;

// Utility function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Erro na requisição';
    
    // Tratamento específico por código HTTP
    if (response.status === 404) {
      errorMessage = 'Recurso não encontrado';
    } else if (response.status === 400) {
      errorMessage = 'Requisição inválida';
    } else if (response.status === 401) {
      errorMessage = 'Não autorizado';
    } else if (response.status === 403) {
      errorMessage = 'Acesso negado';
    } else if (response.status === 500) {
      errorMessage = 'Erro interno do servidor';
    }
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // Se a resposta é HTML (erro do backend)
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
        if (errorText.includes('pg-pool') || errorText.includes('postgres')) {
          errorMessage = `❌ ERRO DE CONEXÃO COM O BANCO DE DADOS!\n\nO backend não conseguiu conectar ao PostgreSQL.\n\nVerifique:\n1. PostgreSQL está rodando?\n2. Credenciais corretas no arquivo .env do backend?\n3. Banco de dados existe?\n4. Tabelas foram criadas?\n\nStatus HTTP: ${response.status}`;
        } else if (response.status >= 500) {
          errorMessage = `Erro interno do servidor (${response.status}). Verifique os logs do backend.`;
        }
      } else if (errorText && response.status !== 404) {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
    }
    
    console.error(`❌ Erro na API [${response.status}]:`, errorMessage);
    throw new Error(errorMessage);
  }
  
  // Para respostas sem conteúdo (DELETE geralmente retorna 204)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  
  return response.json();
}

// Utility function to handle network errors
async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  console.log(`🔵 Requisição: ${options?.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const data = await handleResponse<T>(response);
    console.log(`✅ Resposta [${response.status}]:`, data);
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const errorMsg = `
❌ NÃO FOI POSSÍVEL CONECTAR AO BACKEND!

URL tentada: ${url}

Possíveis causas:
1. Backend não está rodando
2. Porta incorreta (verifique se é 3001)
3. CORS não configurado no backend

Como resolver:
1. Inicie o backend: cd BACKEND_COMPLETO && npm run dev
2. Verifique a porta em /services/api.ts
3. Configure CORS no backend para aceitar requisições de http://localhost:5173

Backend configurado: ${API_BASE_URL}
      `.trim();
      
      console.error(errorMsg);
      throw new Error('Backend desconectado. Verifique o console para mais detalhes.');
    }
    throw error;
  }
}

// Companies API
export const companiesApi = {
  getAll: async (): Promise<Company[]> => {
    return safeFetch<Company[]>(`${API_BASE_URL}/companies`);
  },

  getById: async (id: number): Promise<Company> => {
    return safeFetch<Company>(`${API_BASE_URL}/companies/${id}`);
  },

  create: async (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Company> => {
    return safeFetch<Company>(`${API_BASE_URL}/companies`, {
      method: 'POST',
      body: JSON.stringify(company),
    });
  },

  update: async (id: number, company: Partial<Company>): Promise<Company> => {
    return safeFetch<Company>(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  },

  delete: async (id: number): Promise<void> => {
    return safeFetch<void>(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
    });
  },
};

// Works API
export const worksApi = {
  getAll: async (): Promise<Work[]> => {
    return safeFetch<Work[]>(`${API_BASE_URL}/works`);
  },

  getById: async (id: number): Promise<Work> => {
    return safeFetch<Work>(`${API_BASE_URL}/works/${id}`);
  },

  getByCompany: async (empresaId: number): Promise<Work[]> => {
    return safeFetch<Work[]>(`${API_BASE_URL}/works?empresa_id=${empresaId}`);
  },

  create: async (work: Omit<Work, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Work> => {
    return safeFetch<Work>(`${API_BASE_URL}/works`, {
      method: 'POST',
      body: JSON.stringify(work),
    });
  },

  update: async (id: number, work: Partial<Work>): Promise<Work> => {
    return safeFetch<Work>(`${API_BASE_URL}/works/${id}`, {
      method: 'PUT',
      body: JSON.stringify(work),
    });
  },

  delete: async (id: number): Promise<void> => {
    return safeFetch<void>(`${API_BASE_URL}/works/${id}`, {
      method: 'DELETE',
    });
  },
};

// Loads API
export const loadsApi = {
  getAll: async (): Promise<Load[]> => {
    return safeFetch<Load[]>(`${API_BASE_URL}/loads`);
  },

  getById: async (id: number): Promise<Load> => {
    return safeFetch<Load>(`${API_BASE_URL}/loads/${id}`);
  },

  getByWork: async (obraId: number): Promise<Load[]> => {
    return safeFetch<Load[]>(`${API_BASE_URL}/loads?obra_id=${obraId}`);
  },

  create: async (load: Omit<Load, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Load> => {
    return safeFetch<Load>(`${API_BASE_URL}/loads`, {
      method: 'POST',
      body: JSON.stringify(load),
    });
  },

  update: async (id: number, load: Partial<Load>): Promise<Load> => {
    return safeFetch<Load>(`${API_BASE_URL}/loads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(load),
    });
  },

  delete: async (id: number): Promise<void> => {
    return safeFetch<void>(`${API_BASE_URL}/loads/${id}`, {
      method: 'DELETE',
    });
  },
};

// Samples API
export const samplesApi = {
  getAll: async (): Promise<Sample[]> => {
    return safeFetch<Sample[]>(`${API_BASE_URL}/samples`);
  },

  getById: async (id: number): Promise<Sample> => {
    return safeFetch<Sample>(`${API_BASE_URL}/samples/${id}`);
  },

  getByLoad: async (cargaId: number): Promise<Sample[]> => {
    return safeFetch<Sample[]>(`${API_BASE_URL}/samples?carga_id=${cargaId}`);
  },

  create: async (sample: Omit<Sample, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Sample> => {
    return safeFetch<Sample>(`${API_BASE_URL}/samples`, {
      method: 'POST',
      body: JSON.stringify(sample),
    });
  },

  update: async (id: number, sample: Partial<Sample>): Promise<Sample> => {
    return safeFetch<Sample>(`${API_BASE_URL}/samples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sample),
    });
  },

  delete: async (id: number): Promise<void> => {
    return safeFetch<void>(`${API_BASE_URL}/samples/${id}`, {
      method: 'DELETE',
    });
  },

  bulkCreate: async (samples: Omit<Sample, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[]): Promise<Sample[]> => {
    return safeFetch<Sample[]>(`${API_BASE_URL}/samples/bulk`, {
      method: 'POST',
      body: JSON.stringify(samples),
    });
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return safeFetch<User[]>(`${API_BASE_URL}/users`);
  },

  getById: async (id: number): Promise<User> => {
    return safeFetch<User>(`${API_BASE_URL}/users/${id}`);
  },

  authenticate: async (username: string, password: string): Promise<AuthResponse> => {
    return safeFetch<AuthResponse>(`${API_BASE_URL}/users/authenticate`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  create: async (user: { username: string; password: string; name: string; role: 'admin' | 'user' }): Promise<User> => {
    return safeFetch<User>(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  update: async (id: number, user: { name?: string; role?: 'admin' | 'user' }): Promise<User> => {
    return safeFetch<User>(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  delete: async (id: number): Promise<void> => {
    return safeFetch<void>(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
  },
};