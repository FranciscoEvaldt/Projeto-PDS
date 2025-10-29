import { useState, useEffect } from 'react';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Work {
  id: string;
  companyId: string;
  name: string;
  address: string;
  responsible: string;
  supplier: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface Load {
  id: string;
  workId: string;
  loadNumber: string;
  invoiceNumber: string;
  fck: number;
  slump: number;
  deliveryDate: string;
  volume: number;
  samplesConfig: {
    age: number;
    quantity: number;
  }[];
  createdAt: string;
}

export interface Sample {
  id: string;
  loadId: string;
  code: string;
  age: number;
  moldingDate: string;
  testDate: string;
  result?: number;
  testedAt?: string;
  observations?: string;
}

const STORAGE_KEYS = {
  COMPANIES: 'concrete-lab-companies',
  WORKS: 'concrete-lab-works',
  LOADS: 'concrete-lab-loads',
  SAMPLES: 'concrete-lab-samples',
};

function getStorageData<T>(key: string, defaultValue: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageData<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function useStorage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    setCompanies(getStorageData(STORAGE_KEYS.COMPANIES, []));
    setWorks(getStorageData(STORAGE_KEYS.WORKS, []));
    setLoads(getStorageData(STORAGE_KEYS.LOADS, []));
    setSamples(getStorageData(STORAGE_KEYS.SAMPLES, []));
  }, []);

  const saveCompanies = (data: Company[]) => {
    setCompanies(data);
    setStorageData(STORAGE_KEYS.COMPANIES, data);
  };

  const saveWorks = (data: Work[]) => {
    setWorks(data);
    setStorageData(STORAGE_KEYS.WORKS, data);
  };

  const saveLoads = (data: Load[]) => {
    setLoads(data);
    setStorageData(STORAGE_KEYS.LOADS, data);
  };

  const saveSamples = (data: Sample[]) => {
    setSamples(data);
    setStorageData(STORAGE_KEYS.SAMPLES, data);
  };

  return {
    companies,
    works,
    loads,
    samples,
    saveCompanies,
    saveWorks,
    saveLoads,
    saveSamples,
  };
}
