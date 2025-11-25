import type { Company, Load, Sample, Work } from "../types";

export interface DataContextType {
  companies: Company[];
  works: Work[];
  loads: Load[];
  samples: Sample[];
  isLoading: boolean;

  addCompany: (company: Omit<Company, "id">) => Promise<void>;
  updateCompany: (id: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;

  addWork: (work: Omit<Work, "id">) => Promise<void>;
  updateWork: (id: number, work: Partial<Work>) => Promise<void>;
  deleteWork: (id: number) => Promise<void>;

  addLoad: (load: Omit<Load, "id">) => Promise<Load>;
  updateLoad: (id: number, load: Partial<Load>) => Promise<void>;
  deleteLoad: (id: number) => Promise<void>;

  addSample: (sample: Omit<Sample, "id">) => Promise<void>;
  addSamples: (samples: Omit<Sample, "id">[]) => Promise<void>;
  updateSample: (id: number, sample: Partial<Sample>) => Promise<void>;
  deleteSample: (id: number) => Promise<void>;

  refreshData: () => Promise<void>;
}
