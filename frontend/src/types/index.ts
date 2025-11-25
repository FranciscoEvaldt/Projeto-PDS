    export interface Company {
    id: number;
    nome: string;
    cnpj: string;
    telefone: string;
    email: string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    endereco?: string;
    }

    export interface Work {
    id: number;   
    empresa_id: number | null;
    codigo: string;
    nome: string;
    endereco: string;
    cidade: string;
    estado: string;
    fck_projeto: number | null;
    responsavel_obra: string;
    contrato: string;
    data_inicio: string | null;
    status: 'active' | 'inactive' | 'completed' | 'paused';
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    }

    export interface Load {
    id: number;
    obra_id: number;
    numero_planilha: number;
    fornecedor_concreto?: string | null;
    data_moldagem: string;
    caminhao: string;
    nota_fiscal: string;
    volume_m3: number;
    slump_cm: number;
    fck_mpa: number;
    pavimento: string | null;
    peca: string | null;
    observacoes: string | null;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    }

    export interface Sample {
    observacoes: string;
    id: number;
    carga_id: number;
    sequencia: number;
    numero_laboratorio: number;
    data_prevista_rompimento: string;
    data_rompimento: string | null;
    data_moldagem: string;
    idade_dias: number;
    diametro_mm: number | null;
    altura_mm: number | null;
    carga_kn: number | null;
    resistencia_mpa: number | null;
    status: 'pendente' | 'testado' | string;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    }

    export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    created_at?: string;
    updated_at?: string;
    }

    // Helper para gerar próximo número de planilha
    export function getNextPlanilhaNumber(loads: Load[], workId: number): number {
    const workLoads = loads.filter(load => load.obra_id === workId);
    if (workLoads.length === 0) return 1;
    
    const maxNumber = Math.max(...workLoads.map(load => load.numero_planilha));
    return maxNumber + 1;
    }   
