import { useEffect, useState } from 'react';
import { Company, Work, Load, Sample } from '../types';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

// 🔧 Função genérica para requisições
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Erro na requisição');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const useStorage = () => {
  // Estados globais
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);

  // Carrega tudo ao iniciar
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [c, w, l, s] = await Promise.all([
        apiRequest<Company[]>(`${API_BASE_URL}/companies`),
        apiRequest<Work[]>(`${API_BASE_URL}/works`),
        apiRequest<Load[]>(`${API_BASE_URL}/loads`),
        apiRequest<Sample[]>(`${API_BASE_URL}/samples`),
      ]);

      setCompanies(c);
      setWorks(w);
      setLoads(l);
      setSamples(s);
    } catch {
      toast.error('Erro ao carregar dados da API');
    }
  };

  // =====================================================================
  // COMPANIES
  // =====================================================================

  const addCompany = async (company: Omit<Company, 'id'>) => {
    const newCompany = await apiRequest<Company>(
      `${API_BASE_URL}/companies`,
      { method: 'POST', body: JSON.stringify(company) }
    );

    setCompanies(prev => [...prev, newCompany]);
    toast.success('Empresa criada!');
    return newCompany;
  };

  const updateCompany = async (id: number, company: Partial<Company>) => {
    const updated = await apiRequest<Company>(
      `${API_BASE_URL}/companies/${id}`,
      { method: 'PUT', body: JSON.stringify(company) }
    );

    setCompanies(prev => prev.map(c => (c.id === id ? updated : c)));
    toast.success('Empresa atualizada!');
    return updated;
  };

  const deleteCompany = async (id: number) => {
    await apiRequest(`${API_BASE_URL}/companies/${id}`, { method: 'DELETE' });

    setCompanies(prev => prev.filter(c => c.id !== id));
    toast.success('Empresa removida!');
  };

  // =====================================================================
  // WORKS
  // =====================================================================

  const addWork = async (work: Omit<Work, 'id'>) => {
    const newWork = await apiRequest<Work>(
      `${API_BASE_URL}/works`,
      { method: 'POST', body: JSON.stringify(work) }
    );

    setWorks(prev => [...prev, newWork]);
    toast.success('Obra criada!');
    return newWork;
  };

  const updateWork = async (id: number, work: Partial<Work>) => {
    const updated = await apiRequest<Work>(
      `${API_BASE_URL}/works/${id}`,
      { method: 'PUT', body: JSON.stringify(work) }
    );

    setWorks(prev => prev.map(w => (w.id === id ? updated : w)));
    toast.success('Obra atualizada!');
    return updated;
  };

  const deleteWork = async (id: number) => {
    await apiRequest(`${API_BASE_URL}/works/${id}`, { method: 'DELETE' });

    setWorks(prev => prev.filter(w => w.id !== id));
    toast.success('Obra removida!');
  };

  // =====================================================================
  // LOADS
  // =====================================================================

  const addLoad = async (load: Omit<Load, 'id'>) => {
    const newLoad = await apiRequest<Load>(
      `${API_BASE_URL}/loads`,
      { method: 'POST', body: JSON.stringify(load) }
    );

    setLoads(prev => [...prev, newLoad]);
    toast.success('Carga criada!');
    return newLoad;
  };

  const updateLoad = async (id: number, load: Partial<Load>) => {
    const updated = await apiRequest<Load>(
      `${API_BASE_URL}/loads/${id}`,
      { method: 'PUT', body: JSON.stringify(load) }
    );

    setLoads(prev => prev.map(l => (l.id === id ? updated : l)));
    toast.success('Carga atualizada!');
    return updated;
  };

  const deleteLoad = async (id: number) => {
    await apiRequest(`${API_BASE_URL}/loads/${id}`, { method: 'DELETE' });

    setLoads(prev => prev.filter(l => l.id !== id));
    toast.success('Carga removida!');
  };

  // =====================================================================
  // SAMPLES
  // =====================================================================

  const addSample = async (sample: Omit<Sample, 'id'>) => {
    const newSample = await apiRequest<Sample>(
      `${API_BASE_URL}/samples`,
      { method: 'POST', body: JSON.stringify(sample) }
    );

    setSamples(prev => [...prev, newSample]);
    toast.success('Amostra criada!');
    return newSample;
  };

  const updateSample = async (id: number, sample: Partial<Sample>) => {
    const updated = await apiRequest<Sample>(
      `${API_BASE_URL}/samples/${id}`,
      { method: 'PUT', body: JSON.stringify(sample) }
    );

    setSamples(prev => prev.map(s => (s.id === id ? updated : s)));
    toast.success('Amostra atualizada!');
    return updated;
  };

  const deleteSample = async (id: number) => {
    await apiRequest(`${API_BASE_URL}/samples/${id}`, { method: 'DELETE' });

    setSamples(prev => prev.filter(s => s.id !== id));
    toast.success('Amostra removida!');
  };

  // Return do hook
  return {
    companies,
    works,
    loads,
    samples,

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
    updateSample,
    deleteSample,
  };
};
