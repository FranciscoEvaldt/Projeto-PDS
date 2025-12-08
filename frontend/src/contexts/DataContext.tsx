import { createContext, useContext, ReactNode } from 'react';
import type { Company, Work, Load, Sample } from '../types';
import { useApiStorage } from '../hooks/useApiStorage';

interface DataContextType {
  companies: Company[];
  works: Work[];
  loads: Load[];
  samples: Sample[];
  isLoading: boolean;
  error: string | null;
  loadAllData: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
  refreshWorks: () => Promise<void>;
  refreshLoads: () => Promise<void>;
  refreshSamples: () => Promise<void>;
  createCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<Company>;
  updateCompany: (id: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  createWork: (work: Omit<Work, 'id' | 'created_at' | 'updated_at'>) => Promise<Work>;
  updateWork: (id: number, work: Partial<Work>) => Promise<void>;
  deleteWork: (id: number) => Promise<void>;
  createLoad: (load: Omit<Load, 'id' | 'created_at' | 'updated_at'>) => Promise<Load>;
  updateLoad: (id: number, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: number) => Promise<void>;
  createSample: (sample: Omit<Sample, 'id' | 'created_at' | 'updated_at'>) => Promise<Sample>;
  createSamplesBulk: (samples: Omit<Sample, 'id' | 'created_at' | 'updated_at'>[]) => Promise<Sample[]>;
  updateSample: (id: number, sample: Partial<Sample>) => Promise<void>;
  deleteSample: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const storage = useApiStorage();
  
  // Mapeia as funções do hook para os nomes esperados pelo contexto
  const contextValue: DataContextType = {
    // Data
    companies: storage.companies,
    works: storage.works,
    loads: storage.loads,
    samples: storage.samples,
    
    // Loading state
    isLoading: storage.isLoading,
    error: storage.error,
    
    // Refresh functions
    loadAllData: storage.loadAllData,
    refreshCompanies: storage.loadAllData, // Simplificado - recarrega tudo
    refreshWorks: storage.loadAllData,
    refreshLoads: storage.loadAllData,
    refreshSamples: storage.loadAllData,
    
    // Companies (mapeando addCompany -> createCompany)
    createCompany: storage.addCompany,
    updateCompany: storage.updateCompany,
    deleteCompany: storage.deleteCompany,
    
    // Works (mapeando addWork -> createWork)
    createWork: storage.addWork,
    updateWork: storage.updateWork,
    deleteWork: storage.deleteWork,
    
    // Loads (mapeando addLoad -> createLoad)
    createLoad: storage.addLoad,
    updateLoad: storage.updateLoad,
    deleteLoad: storage.deleteLoad,
    
    // Samples (mapeando addSample -> createSample)
    createSample: storage.addSample,
    createSamplesBulk: storage.addSamplesBulk,
    updateSample: storage.updateSample,
    deleteSample: storage.deleteSample,
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}