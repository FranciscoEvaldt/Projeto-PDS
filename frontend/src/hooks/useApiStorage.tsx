import { useState, useEffect, useCallback } from 'react';
import { companiesApi, worksApi, loadsApi, samplesApi } from '../services/api';
import { toast } from 'sonner';
import type { Company, Work, Load, Sample } from '../types';

// Re-exportar tipos para compatibilidade com componentes antigos
export type { Company, Work, Load, Sample };

// ============================================
// 🔧 FUNÇÕES AUXILIARES
// ============================================

export function getNextPlanilhaNumber(loads: Load[], obraId: number): number {
  const obraLoads = loads.filter(l => l.obra_id === obraId);
  if (obraLoads.length === 0) return 1;
  
  const maxNumber = Math.max(...obraLoads.map(l => l.numero_planilha || 0));
  return maxNumber + 1;
}

export function getNextLabNumber(samples: Sample[]): number {
  if (samples.length === 0) return 1;
  
  const numbers = samples
    .map(s => s.numero_laboratorio)
    .filter(n => !isNaN(n));
  
  if (numbers.length === 0) return 1;
  
  const maxNumber = Math.max(...numbers);
  return maxNumber + 1;
}

// ============================================
// 🎣 HOOK DE STORAGE (API PostgreSQL)
// ============================================

export function useApiStorage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // 📥 CARREGAMENTO INICIAL DOS DADOS
  // ============================================

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando dados do backend PostgreSQL...');
      
      // Carrega todos os dados em paralelo
      const [companiesData, worksData, loadsData, samplesData] = await Promise.all([
        companiesApi.getAll(),
        worksApi.getAll(),
        loadsApi.getAll(),
        samplesApi.getAll(),
      ]);

      setCompanies(companiesData);
      setWorks(worksData);
      setLoads(loadsData);
      setSamples(samplesData);

      console.log('✅ Dados carregados com sucesso:', {
        companies: companiesData.length,
        works: worksData.length,
        loads: loadsData.length,
        samples: samplesData.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      console.error('❌ Erro ao carregar dados:', errorMessage);
      setError(errorMessage);
      toast.error('Erro ao carregar dados do servidor', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega dados ao iniciar
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============================================
  // 🏢 COMPANIES (Empresas)
  // ============================================

  const addCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      console.log('📤 Criando empresa:', company);
      const newCompany = await companiesApi.create(company);
      setCompanies([...companies, newCompany]);
      toast.success('Empresa criada com sucesso!');
      return newCompany;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar empresa';
      console.error('❌ Erro ao criar empresa:', errorMessage);
      toast.error('Erro ao criar empresa', { description: errorMessage });
      throw err;
    }
  };

  const updateCompany = async (id: number, updates: Partial<Company>) => {
    try {
      console.log('📤 Atualizando empresa:', id, updates);
      const updatedCompany = await companiesApi.update(id, updates);
      setCompanies(companies.map(c => c.id === id ? updatedCompany : c));
      toast.success('Empresa atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar empresa';
      console.error('❌ Erro ao atualizar empresa:', errorMessage);
      toast.error('Erro ao atualizar empresa', { description: errorMessage });
      throw err;
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      console.log('📤 Deletando empresa:', id);
      await companiesApi.delete(id);
      
      // Remove a empresa localmente
      setCompanies(companies.filter(c => c.id !== id));
      
      // Remove obras relacionadas (as cargas e amostras serão removidas em cascata no banco)
      setWorks(works.filter(w => w.empresa_id !== id));
      
      // Recarrega tudo para sincronizar
      await loadAllData();
      
      toast.success('Empresa deletada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar empresa';
      console.error('❌ Erro ao deletar empresa:', errorMessage);
      toast.error('Erro ao deletar empresa', { description: errorMessage });
      throw err;
    }
  };

  // ============================================
  // 🏗️ WORKS (Obras)
  // ============================================

  const addWork = async (work: Omit<Work, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('📤 Criando obra:', work);
      const newWork = await worksApi.create(work);
      setWorks([...works, newWork]);
      toast.success('Obra criada com sucesso!');
      return newWork;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar obra';
      console.error('❌ Erro ao criar obra:', errorMessage);
      toast.error('Erro ao criar obra', { description: errorMessage });
      throw err;
    }
  };

  const updateWork = async (id: number, updates: Partial<Work>) => {
    try {
      console.log('📤 Atualizando obra:', id, updates);
      const updatedWork = await worksApi.update(id, updates);
      setWorks(works.map(w => w.id === id ? updatedWork : w));
      toast.success('Obra atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar obra';
      console.error('❌ Erro ao atualizar obra:', errorMessage);
      toast.error('Erro ao atualizar obra', { description: errorMessage });
      throw err;
    }
  };

  const deleteWork = async (id: number) => {
    try {
      console.log('📤 Deletando obra:', id);
      await worksApi.delete(id);
      
      // Remove a obra localmente
      setWorks(works.filter(w => w.id !== id));
      
      // Recarrega tudo para sincronizar com o backend
      await loadAllData();
      
      toast.success('Obra deletada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar obra';
      console.error('❌ Erro ao deletar obra:', errorMessage);
      toast.error('Erro ao deletar obra', { description: errorMessage });
      throw err;
    }
  };

  // ============================================
  // 📦 LOADS (Cargas/Planilhas)
  // ============================================

  const addLoad = async (load: Omit<Load, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('📤 Criando carga:', load);
      const newLoad = await loadsApi.create(load);
      setLoads([...loads, newLoad]);
      toast.success('Carga criada com sucesso!');
      return newLoad;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar carga';
      console.error('❌ Erro ao criar carga:', errorMessage);
      toast.error('Erro ao criar carga', { description: errorMessage });
      throw err;
    }
  };

  const updateLoad = async (id: number, updates: Partial<Load>) => {
    try {
      console.log('📤 Atualizando carga:', id, updates);
      const updatedLoad = await loadsApi.update(id, updates);
      setLoads(loads.map(l => l.id === id ? updatedLoad : l));
      toast.success('Carga atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar carga';
      console.error('❌ Erro ao atualizar carga:', errorMessage);
      toast.error('Erro ao atualizar carga', { description: errorMessage });
      throw err;
    }
  };

  const deleteLoad = async (id: number) => {
    try {
      console.log('📤 Deletando carga:', id);
      await loadsApi.delete(id);
      
      // Remove a carga localmente
      setLoads(loads.filter(l => l.id !== id));
      
      // Remove amostras relacionadas localmente
      setSamples(samples.filter(s => s.carga_id !== id));
      
      toast.success('Carga deletada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar carga';
      console.error('❌ Erro ao deletar carga:', errorMessage);
      toast.error('Erro ao deletar carga', { description: errorMessage });
      throw err;
    }
  };

  // ============================================
  // 🧪 SAMPLES (Amostras)
  // ============================================

  const addSample = async (sample: Omit<Sample, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('📤 Criando amostra:', sample);
      const newSample = await samplesApi.create(sample);
      setSamples([...samples, newSample]);
      toast.success('Amostra criada com sucesso!');
      return newSample;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar amostra';
      console.error('❌ Erro ao criar amostra:', errorMessage);
      toast.error('Erro ao criar amostra', { description: errorMessage });
      throw err;
    }
  };

  const addSamplesBulk = async (newSamples: Omit<Sample, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      console.log('📤 Criando amostras em lote:', newSamples.length);
      const createdSamples = await samplesApi.bulkCreate(newSamples);
      setSamples([...samples, ...createdSamples]);
      toast.success(`${createdSamples.length} amostras criadas com sucesso!`);
      return createdSamples;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar amostras';
      console.error('❌ Erro ao criar amostras em lote:', errorMessage);
      toast.error('Erro ao criar amostras', { description: errorMessage });
      throw err;
    }
  };

  const updateSample = async (id: number, updates: Partial<Sample>) => {
    try {
      console.log('📤 Atualizando amostra:', id, updates);
      const updatedSample = await samplesApi.update(id, updates);
      setSamples(samples.map(s => s.id === id ? updatedSample : s));
      toast.success('Amostra atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar amostra';
      console.error('❌ Erro ao atualizar amostra:', errorMessage);
      toast.error('Erro ao atualizar amostra', { description: errorMessage });
      throw err;
    }
  };

  const deleteSample = async (id: number) => {
    try {
      console.log('📤 Deletando amostra:', id);
      await samplesApi.delete(id);
      setSamples(samples.filter(s => s.id !== id));
      toast.success('Amostra deletada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar amostra';
      console.error('❌ Erro ao deletar amostra:', errorMessage);
      toast.error('Erro ao deletar amostra', { description: errorMessage });
      throw err;
    }
  };

  return {
    // Data
    companies,
    works,
    loads,
    samples,
    
    // Loading state
    isLoading,
    error,
    
    // Refresh function
    loadAllData,
    
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