import React, { useState, useEffect, useCallback } from 'react';
import type { Company, Work, Load, Sample } from '../types';
import { companiesApi, worksApi, loadsApi, samplesApi } from '../services/api';
import { toast } from 'sonner';
import { DataContext } from './DataContext';

export interface DataContextType {
  companies: Company[];
  works: Work[];
  loads: Load[];
  samples: Sample[];
  isLoading: boolean;

  addCompany: (company: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (id: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;

  addWork: (work: Omit<Work, 'id'>) => Promise<void>;
  updateWork: (id: number, work: Partial<Work>) => Promise<void>;
  deleteWork: (id: number) => Promise<void>;

  addLoad: (load: Omit<Load, 'id'>) => Promise<void>;
  updateLoad: (id: number, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: number) => Promise<void>;

  addSample: (sample: Omit<Sample, 'id'>) => Promise<void>;
  addSamples: (samples: Omit<Sample, 'id'>[]) => Promise<void>;
  updateSample: (id: number, sample: Partial<Sample>) => Promise<void>;
  deleteSample: (id: number) => Promise<void>;

  refreshData: () => Promise<void>;
}


export function DataProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addCompany = async (company: Omit<Company, 'id'>) => {
    try {
      const newCompany = await companiesApi.create(company);
      setCompanies(prev => [...prev, newCompany]);
      toast.success('Empresa cadastrada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar empresa');
      throw error;
    }
  };

  const updateCompany = async (id: number, company: Partial<Company>) => {
    try {
      const updatedCompany = await companiesApi.update(id, company);
      setCompanies(prev => prev.map(c => (c.id === id ? updatedCompany : c)));
      toast.success('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar empresa');
      throw error;
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      await companiesApi.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success('Empresa excluída com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir empresa');
      throw error;
    }
  };

  const addWork = async (work: Omit<Work, 'id'>) => {
    try {
      const newWork = await worksApi.create(work);
      setWorks(prev => [...prev, newWork]);
      toast.success('Obra cadastrada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar obra');
      throw error;
    }
  };

  const updateWork = async (id: number, work: Partial<Work>) => {
    try {
      const updatedWork = await worksApi.update(id, work);
      setWorks(prev => prev.map(w => (w.id === id ? updatedWork : w)));
      toast.success('Obra atualizada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar obra');
      throw error;
    }
  };

  const deleteWork = async (id: number) => {
    try {
      await worksApi.delete(id);
      setWorks(prev => prev.filter(w => w.id !== id));
      toast.success('Obra excluída com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir obra');
      throw error;
    }
  };

  const addLoad = async (load: Omit<Load, 'id'>): Promise<Load> => {
  try {
    const newLoad = await loadsApi.create(load);

    setLoads(prev => [...prev, newLoad]);

    toast.success('Carga cadastrada com sucesso!');

    return newLoad;   // ← IMPORTANTE!
  } catch (error) {
    console.error(error);
    toast.error('Erro ao cadastrar carga');
    throw error; // mantém o erro para o caller
  }
};

  const updateLoad = async (id: number, load: Partial<Load>) => {
    try {
      const updatedLoad = await loadsApi.update(id, load);
      setLoads(prev => prev.map(l => (l.id === id ? updatedLoad : l)));
      toast.success('Carga atualizada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar carga');
      throw error;
    }
  };

  const deleteLoad = async (id: number) => {
    try {
      await loadsApi.delete(id);
      setLoads(prev => prev.filter(l => l.id !== id));
      setSamples(prev => prev.filter(s => s.carga_id !== id));
      toast.success('Carga excluída com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir carga');
      throw error;
    }
  };

  const addSample = async (sample: Omit<Sample, 'id'>) => {
    try {
      const newSample = await samplesApi.create(sample);
      setSamples(prev => [...prev, newSample]);
      toast.success('Amostra cadastrada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar amostra');
      throw error;
    }
  };

  const addSamples = async (samples: Omit<Sample, 'id'>[]) => {
    try {
      const newSamples = await samplesApi.bulkCreate(samples);
      setSamples(prev => [...prev, ...newSamples]);
      toast.success(`${newSamples.length} amostras cadastradas!`);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar amostras');
      throw error;
    }
  };

  const updateSample = async (id: number, sample: Partial<Sample>) => {
    try {
      const updatedSample = await samplesApi.update(id, sample);
      setSamples(prev => prev.map(s => (s.id === id ? updatedSample : s)));
      toast.success('Amostra atualizada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar amostra');
      throw error;
    }
  };

  const deleteSample = async (id: number) => {
    try {
      await samplesApi.delete(id);
      setSamples(prev => prev.filter(s => s.id !== id));
      toast.success('Amostra excluída com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir amostra');
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        works,
        loads,
        samples,
        isLoading,
        addCompany,
        updateCompany,
        deleteCompany,
        addWork,
        updateWork,
        deleteWork,
        addLoad,
        updateLoad,
        deleteLoad,
        addSample,
        addSamples,
        updateSample,
        deleteSample,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
