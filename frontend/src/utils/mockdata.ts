import type { Company, Work, Load, Sample } from '../types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    nome: 'Construtora ABC Ltda',
    cnpj: '12.345.678/0001-99',
    telefone: '(11) 3456-7890',
    email: 'contato@construtorabc.com.br',
  },
  {
    id: 2,
    nome: 'Engenharia XYZ S.A.',
    cnpj: '98.765.432/0001-11',
    telefone: '(11) 98765-4321',
    email: 'comercial@engxyz.com.br',
  },
];

export const MOCK_WORKS: Work[] = [
  {
    id: 1,
    empresa_id: 1,
    codigo: 'OB-001',
    nome: 'Edifício Residencial Alpha',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    fck_projeto: 25,
    responsavel_obra: 'João Silva',
    contrato: 'CONTR-001/2024',
    data_inicio: '2025-01-15',
    status: 'active',
  },
  {
    id: 2,
    empresa_id: 1,
    codigo: 'OB-002',
    nome: 'Shopping Center Beta',
    endereco: 'Av. Principal, 456',
    cidade: 'São Paulo',
    estado: 'SP',
    fck_projeto: 30,
    responsavel_obra: 'Maria Santos',
    contrato: 'CONTR-002/2024',
    data_inicio: '2025-02-01',
    status: 'active',
  },
  {
    id: 3,
    empresa_id: 2,
    codigo: 'VDT-001',
    nome: 'Viaduto Central',
    endereco: 'Via Expressa, Km 15',
    cidade: 'Guarulhos',
    estado: 'SP',
    fck_projeto: 35,
    responsavel_obra: 'Carlos Oliveira',
    contrato: 'CONTR-003/2024',
    data_inicio: '2025-03-10',
    status: 'active',
  },
];

export const MOCK_LOADS: Load[] = [
  {
    id: 1,
    obra_id: 1,
    numero_planilha: 1,
    fornecedor_concreto: 'ConcreMix Ltda',
    data_moldagem: '2025-11-01',
    caminhao: 'CAM-001',
    nota_fiscal: 'NF-12345',
    volume_m3: 8.5,
    slump_cm: 100,
    fck_mpa: 25,
    pavimento: '3º Andar',
    peca: 'Laje L1',
    observacoes: null,
  },
  {
    id: 2,
    obra_id: 1,
    numero_planilha: 1,
    fornecedor_concreto: 'ConcreMix Ltda',
    data_moldagem: '2025-11-01',
    caminhao: 'CAM-002',
    nota_fiscal: 'NF-12346',
    volume_m3: 7.0,
    slump_cm: 100,
    fck_mpa: 25,
    pavimento: '3º Andar',
    peca: 'Pilar P1-P5',
    observacoes: null,
  },
  {
    id: 3,
    obra_id: 1,
    numero_planilha: 2,
    fornecedor_concreto: 'ConcreMix Ltda',
    data_moldagem: '2025-11-05',
    caminhao: 'CAM-003',
    nota_fiscal: 'NF-12347',
    volume_m3: 6.2,
    slump_cm: 120,
    fck_mpa: 30,
    pavimento: '4º Andar',
    peca: 'Viga V1',
    observacoes: null,
  },
];

export const MOCK_SAMPLES: Sample[] = [
  // Amostras da Carga 1 (7 dias) - Números do laboratório começam em 5320
  {
    id: 1,
    carga_id: 1,
    sequencia: 1,
    numero_laboratorio: 5320,
    data_prevista_rompimento: '2025-11-08',
    data_rompimento: '2025-11-08',
    idade_dias: 7,
    diametro_mm: 100,
    altura_mm: 200,
    carga_kn: 196,
    resistencia_mpa: 23.5,
    status: 'testado',
  },
  {
    id: 2,
    carga_id: 1,
    sequencia: 2,
    numero_laboratorio: 5321,
    data_prevista_rompimento: '2025-11-08',
    data_rompimento: '2025-11-08',
    idade_dias: 7,
    diametro_mm: 100,
    altura_mm: 200,
    carga_kn: 201,
    resistencia_mpa: 24.1,
    status: 'testado',
  },
  // Amostras da Carga 1 (28 dias)
  {
    id: 3,
    carga_id: 1,
    sequencia: 3,
    numero_laboratorio: 5322,
    data_prevista_rompimento: '2025-11-29',
    data_rompimento: null,
    idade_dias: 28,
    diametro_mm: null,
    altura_mm: null,
    carga_kn: null,
    resistencia_mpa: null,
    status: 'pendente',
  },
  {
    id: 4,
    carga_id: 1,
    sequencia: 4,
    numero_laboratorio: 5323,
    data_prevista_rompimento: '2025-11-29',
    data_rompimento: null,
    idade_dias: 28,
    diametro_mm: null,
    altura_mm: null,
    carga_kn: null,
    resistencia_mpa: null,
    status: 'pendente',
  },
  // Amostras da Carga 2 (7 dias)
  {
    id: 5,
    carga_id: 2,
    sequencia: 1,
    numero_laboratorio: 5324,
    data_prevista_rompimento: '2025-11-10',
    data_rompimento: null,
    idade_dias: 7,
    diametro_mm: null,
    altura_mm: null,
    carga_kn: null,
    resistencia_mpa: null,
    status: 'pendente',
  },
  {
    id: 6,
    carga_id: 2,
    sequencia: 2,
    numero_laboratorio: 5325,
    data_prevista_rompimento: '2025-11-10',
    data_rompimento: null,
    idade_dias: 7,
    diametro_mm: null,
    altura_mm: null,
    carga_kn: null,
    resistencia_mpa: null,
    status: 'pendente',
  },
  // Amostras da Carga 2 (28 dias)
  {
    id: 7,
    carga_id: 2,
    sequencia: 3,
    numero_laboratorio: 5326,
    data_prevista_rompimento: '2025-12-01',
    data_rompimento: null,
    idade_dias: 28,
    diametro_mm: null,
    altura_mm: null,
    carga_kn: null,
    resistencia_mpa: null,
    status: 'pendente',
  },
  {
    id: 8,
    carga_id: 2,
    sequencia: 4,
    numero_laboratorio: 5327,
    data_prevista_rompimento: '2025-12-01',
    data_rompimento: null,
    idade_dias: 28,
    diametro_mm: null,
    altura_mm: null,
    carga_kn: null,
    resistencia_mpa: null,
    status: 'pendente',
  },
];

export function loadMockDataIfEmpty() {
  const STORAGE_KEYS = {
    COMPANIES: 'concrete-lab-companies',
    WORKS: 'concrete-lab-works',
    LOADS: 'concrete-lab-loads',
    SAMPLES: 'concrete-lab-samples',
    LAST_LAB_NUMBER: 'concrete-lab-last-number',
  };

  // Verificar se já existem dados
  const hasCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  
  // Se não houver dados, carregar dados de exemplo
  if (!hasCompanies) {
    console.log('📦 Carregando dados de exemplo...');
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(MOCK_COMPANIES));
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(MOCK_WORKS));
    localStorage.setItem(STORAGE_KEYS.LOADS, JSON.stringify(MOCK_LOADS));
    localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(MOCK_SAMPLES));
    
    // Definir último número do laboratório (maior número usado nos dados de exemplo)
    const maxLabNumber = Math.max(...MOCK_SAMPLES.map(s => s.numero_laboratorio));
    localStorage.setItem(STORAGE_KEYS.LAST_LAB_NUMBER, maxLabNumber.toString());
    console.log(`✅ Dados de exemplo carregados! Último nº laboratório: ${maxLabNumber}`);
    
    return true;
  }
  
  return false;
}