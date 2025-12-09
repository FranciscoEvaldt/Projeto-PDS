import { createContext, useContext, ReactNode } from "react";
import type { Company, Work, Load, Sample } from "../types";
import { useApiStorage } from "../hooks/useApiStorage";

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
  createCompany: (
    company: Omit<Company, "id" | "created_at" | "updated_at">
  ) => Promise<Company>;
  updateCompany: (id: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  createWork: (
    work: Omit<Work, "id" | "created_at" | "updated_at">
  ) => Promise<Work>;
  updateWork: (id: number, work: Partial<Work>) => Promise<void>;
  deleteWork: (id: number) => Promise<void>;
  createLoad: (
    load: Omit<Load, "id" | "created_at" | "updated_at">
  ) => Promise<Load>;
  updateLoad: (id: number, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: number) => Promise<void>;
  createSample: (
    sample: Omit<Sample, "id" | "created_at" | "updated_at">
  ) => Promise<Sample>;
  createSamplesBulk: (
    samples: Omit<Sample, "id" | "created_at" | "updated_at">[]
  ) => Promise<Sample[]>;
  updateSample: (id: number, sample: Partial<Sample>) => Promise<void>;
  deleteSample: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const storage = useApiStorage();

  const contextValue: DataContextType = {
    companies: storage.companies,
    works: storage.works,
    loads: storage.loads,
    samples: storage.samples,

    isLoading: storage.isLoading,
    error: storage.error,

    loadAllData: storage.loadAllData,
    refreshCompanies: storage.loadAllData,
    refreshWorks: storage.loadAllData,
    refreshLoads: storage.loadAllData,
    refreshSamples: storage.loadAllData,

    createCompany: storage.addCompany,
    updateCompany: storage.updateCompany,
    deleteCompany: storage.deleteCompany,

    createWork: storage.addWork,
    updateWork: storage.updateWork,
    deleteWork: storage.deleteWork,

    createLoad: storage.addLoad,
    updateLoad: storage.updateLoad,
    deleteLoad: storage.deleteLoad,

    createSample: storage.addSample,
    createSamplesBulk: storage.addSamplesBulk,
    updateSample: storage.updateSample,
    deleteSample: storage.deleteSample,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
