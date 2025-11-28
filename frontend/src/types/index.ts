// types/index.ts
// Tipos TypeScript para o Sistema de Gestão de Laboratório de Concreto
// Interfaces fornecidas pelo usuário (schema real do banco)

export interface Company {
  id: number;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  address?: string;
}

export interface Work {
  id: number;
  empresa_id: number | null;
  code: string;
  name: string;
  address: string;
  cidade: string;
  estado: string;
  fck_projeto: number | null;
  responsavel_obra: string;
  contrato: string;
  start_date: string | null;
  status: 'active' | 'inactive' | 'completed' | 'paused';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface Load {
  id: number;
  obra_id: number;
  invoice_number: number;
  concrete_type: string | null;
  molding_date: string;
  caminhao: string;
  nota_fiscal: string;
  volume_m3: number;
  slump_cm: number;
  fck_mpa: number;
  pavimento: string | null;
  peca: string | null;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface Sample {
  id: number;
  carga_id: number;
  sequencia: number;
  numero_laboratorio: number;
  data_prevista_rompimento: string;
  data_rompimento: string | null;
  data_moldagem: string;
  idade_dias: number;
  diametro_mm: number | null;
  altura_mm: number | null;
  carga_kn: number | null;
  resistencia_mpa: number | null;
  status: 'pendente' | 'testado' | string;
  observacoes: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  created_at?: string;
  updated_at?: string;
}

// Helper para gerar próximo número de planilha
export function getNextPlanilhaNumber(loads: Load[], workId: number): number {
  const workLoads = loads.filter((load) => load.obra_id === workId);
  if (workLoads.length === 0) return 1;

  // Nota: invoice_number é number, não numero_planilha
  const maxNumber = Math.max(...workLoads.map((load) => load.invoice_number));
  return maxNumber + 1;
}
