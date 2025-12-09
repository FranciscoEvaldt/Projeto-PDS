export interface Company {
  id: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}
export interface Work {
  id: number;
  empresa_id: number;
  codigo?: string;
  nome: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  fck_projeto?: number;
  responsavel_obra?: string;
  contrato?: string;
  data_inicio?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface Load {
  id: number;
  obra_id: number;
  numero_planilha: number;
  data_moldagem: string;
  caminhao?: string;
  nota_fiscal?: string;
  volume_m3?: number;
  slump_cm?: string;
  fck_mpa?: number;
  pavimento?: string;
  peca?: string;
  fornecedor_concreto?: string;
  observacoes?: string;
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
  data_prevista_rompimento?: string;
  data_rompimento?: string;
  idade_dias?: number;
  diametro_mm?: number;
  altura_mm?: number;
  carga_kn?: number;
  resistencia_mpa?: number;
  status?: "pending" | "tested" | "cancelled";
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface SystemCounter {
  id: number;
  counter_name: string;
  counter_value: number;
  updated_at?: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  senha?: string; // Não retornado nas queries normais
  role?: "admin" | "manager" | "user" | "viewer";
  ativo?: boolean;
  ultimo_acesso?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SampleComplete extends Sample {
  obra_id: number;
  numero_planilha: number;
  data_moldagem: string;
  fck_carga?: number;
  fornecedor_concreto?: string;
  obra_nome: string;
  obra_codigo?: string;
  empresa_id: number;
  empresa_nome: string;
}
export interface WorkStatistics {
  id: number;
  nome: string;
  codigo?: string;
  total_cargas: number;
  total_amostras: number;
  amostras_testadas: number;
  amostras_pendentes: number;
  resistencia_media?: number;
}

export interface CompanyFormData {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export interface WorkFormData {
  empresa_id: number;
  codigo?: string;
  nome: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoadFormData {
  obra_id: number;
  numero_planilha: number;
  data_moldagem: string;
  caminhao?: string;
  nota_fiscal?: string;
  volume_m3?: number;
  slump_cm?: string;
  fck_mpa?: number;
  pavimento?: string;
  peca?: string;
  fornecedor_concreto?: string;
  observacoes?: string;
}

export interface SampleFormData {
  carga_id: number;
  sequencia: number;
  numero_laboratorio: number;
  data_prevista_rompimento?: string;
  data_rompimento?: string;
  idade_dias?: number;
  diametro_mm?: number;
  altura_mm?: number;
  carga_kn?: number;
  resistencia_mpa?: number;
  status?: "pending" | "tested" | "cancelled";
}

export const ESTADOS_BRASIL = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export function getNextPlanilhaNumber(loads: Load[], obraId: number): number {
  const obraLoads = loads.filter((l) => l.obra_id === obraId);
  if (obraLoads.length === 0) return 1;

  const maxNumber = Math.max(...obraLoads.map((l) => l.numero_planilha));
  return maxNumber + 1;
}

export function calcularDataRompimento(
  dataMoldagem: string,
  idadeDias: number
): string {
  const data = new Date(dataMoldagem);
  data.setDate(data.getDate() + idadeDias);
  return data.toISOString().split("T")[0];
}

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR");
}

export function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function gerarCodigoAmostra(
  obraId: number,
  numeroPlanilha: number,
  cargaSequencia: number,
  amostraSequencia: number
): string {
  const obra = String(obraId).padStart(3, "0");
  const planilha = String(numeroPlanilha).padStart(3, "0");
  const carga = String(cargaSequencia).padStart(2, "0");
  const amostra = String(amostraSequencia).padStart(3, "0");

  return `OB${obra}-PL${planilha}-C${carga}-A${amostra}`;
}

export function calcularPercentualFck(
  resistenciaMpa: number,
  fckMpa: number
): number {
  if (!fckMpa || fckMpa === 0) return 0;
  return Number(((resistenciaMpa / fckMpa) * 100).toFixed(2));
}

export function verificarConformidade(
  resistenciaMpa: number,
  fckMpa: number
): boolean {
  if (!fckMpa || !resistenciaMpa) return false;
  return resistenciaMpa >= fckMpa;
}
