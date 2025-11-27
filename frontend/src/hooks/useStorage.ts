import { useState, useEffect } from 'react';

// ============================================
// 📦 TIPOS DE DADOS
// ============================================

export interface Company {
  id: string;
  nome: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  created_at?: string;
}

export interface Work {
  id: string;
  empresa_id: string;
  empresa: string;
  nome: string;
  codigo: string;
  endereco?: string;
  contrato?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Load {
  id: string;
  obra_id: string;
  numero_planilha: number;
  caminhao: string;
  nota_fiscal: string;
  volume_m3: number;
  fck_mpa: number;
  slump?: number;
  data_moldagem: string;
  fornecedor_concreto?: string;
  pavimento?: string;
  peca?: string;
  traco?: string;
  quantidade_7_dias: number;
  quantidade_14_dias: number;
  quantidade_28_dias: number;
  quantidade_63_dias: number;
  created_at?: string;
}

export interface Sample {
  id: string;
  carga_id: string;
  numero_laboratorio: string;
  sequencia: string;
  idade_dias: number;
  data_prevista_rompimento: string;
  data_rompimento?: string;
  resistencia_mpa?: number;
  observacoes?: string;
  status: 'pendente' | 'testado';
  created_at?: string;
}

// ============================================
// 🔧 FUNÇÕES AUXILIARES
// ============================================

export function getNextPlanilhaNumber(loads: Load[], obraId: string): number {
  const obraLoads = loads.filter(l => l.obra_id === obraId);
  if (obraLoads.length === 0) return 1;
  
  const maxNumber = Math.max(...obraLoads.map(l => l.numero_planilha || 0));
  return maxNumber + 1;
}

export function getNextLabNumber(samples: Sample[]): string {
  if (samples.length === 0) return '1';
  
  const numbers = samples
    .map(s => parseInt(s.numero_laboratorio))
    .filter(n => !isNaN(n));
  
  if (numbers.length === 0) return '1';
  
  const maxNumber = Math.max(...numbers);
  return String(maxNumber + 1);
}

// ============================================
// 🎣 HOOK DE STORAGE (LocalStorage)
// ============================================

export function useStorage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);

  // Carrega dados do localStorage ao iniciar
  useEffect(() => {
    const loadedCompanies = localStorage.getItem('companies');
    const loadedWorks = localStorage.getItem('works');
    const loadedLoads = localStorage.getItem('loads');
    const loadedSamples = localStorage.getItem('samples');

    if (loadedCompanies) setCompanies(JSON.parse(loadedCompanies));
    if (loadedWorks) setWorks(JSON.parse(loadedWorks));
    if (loadedLoads) setLoads(JSON.parse(loadedLoads));
    if (loadedSamples) setSamples(JSON.parse(loadedSamples));
  }, []);

  // Salva companies no localStorage
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  // Salva works no localStorage
  useEffect(() => {
    localStorage.setItem('works', JSON.stringify(works));
  }, [works]);

  // Salva loads no localStorage
  useEffect(() => {
    localStorage.setItem('loads', JSON.stringify(loads));
  }, [loads]);

  // Salva samples no localStorage
  useEffect(() => {
    localStorage.setItem('samples', JSON.stringify(samples));
  }, [samples]);

  // ============================================
  // 🏢 COMPANIES (Empresas)
  // ============================================

  const addCompany = (company: Omit<Company, 'id' | 'created_at'>) => {
    const newCompany: Company = {
      ...company,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setCompanies([...companies, newCompany]);
    return newCompany;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCompany = (id: string) => {
    // Remove a empresa
    setCompanies(companies.filter(c => c.id !== id));
    
    // Remove obras relacionadas e suas cargas/amostras
    const relatedWorks = works.filter(w => w.empresa_id === id);
    const relatedWorkIds = relatedWorks.map(w => w.id);
    
    setWorks(works.filter(w => w.empresa_id !== id));
    
    const relatedLoads = loads.filter(l => relatedWorkIds.includes(l.obra_id));
    const relatedLoadIds = relatedLoads.map(l => l.id);
    
    setLoads(loads.filter(l => !relatedWorkIds.includes(l.obra_id)));
    setSamples(samples.filter(s => !relatedLoadIds.includes(s.carga_id)));
  };

  // ============================================
  // 🏗️ WORKS (Obras)
  // ============================================

  const addWork = (work: Omit<Work, 'id' | 'created_at'>) => {
    const newWork: Work = {
      ...work,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setWorks([...works, newWork]);
    return newWork;
  };

  const updateWork = (id: string, updates: Partial<Work>) => {
    setWorks(works.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWork = (id: string) => {
    // Remove a obra
    setWorks(works.filter(w => w.id !== id));
    
    // Remove cargas relacionadas e suas amostras
    const relatedLoads = loads.filter(l => l.obra_id === id);
    const relatedLoadIds = relatedLoads.map(l => l.id);
    
    setLoads(loads.filter(l => l.obra_id !== id));
    setSamples(samples.filter(s => !relatedLoadIds.includes(s.carga_id)));
  };

  // ============================================
  // 📦 LOADS (Cargas/Planilhas)
  // ============================================

  const addLoad = (load: Omit<Load, 'id' | 'created_at'>) => {
    const newLoad: Load = {
      ...load,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setLoads([...loads, newLoad]);
    return newLoad;
  };

  const updateLoad = (id: string, updates: Partial<Load>) => {
    setLoads(loads.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLoad = (id: string) => {
    // Remove a carga
    setLoads(loads.filter(l => l.id !== id));
    
    // Remove amostras relacionadas
    setSamples(samples.filter(s => s.carga_id !== id));
  };

  // ============================================
  // 🧪 SAMPLES (Amostras)
  // ============================================

  const addSample = (sample: Omit<Sample, 'id' | 'created_at'>) => {
    const newSample: Sample = {
      ...sample,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setSamples([...samples, newSample]);
    return newSample;
  };

  const addSamplesBulk = (newSamples: Omit<Sample, 'id' | 'created_at'>[]) => {
    const samplesWithIds = newSamples.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }));
    setSamples([...samples, ...samplesWithIds]);
    return samplesWithIds;
  };

  const updateSample = (id: string, updates: Partial<Sample>) => {
    setSamples(samples.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSample = (id: string) => {
    setSamples(samples.filter(s => s.id !== id));
  };

  return {
    // Data
    companies,
    works,
    loads,
    samples,
    
    // Companies
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Works
    addWork,
    updateWork,
    deleteWork,
    
    // Loads
    addLoad,
    updateLoad,
    deleteLoad,
    
    // Samples
    addSample,
    addSamplesBulk,
    updateSample,
    deleteSample,
  };
}
