import Company from '../models/Company.js';

const companyController = {
  // Listar todas as empresas
  async getAll(req, res) {
    try {
      const companies = await Company.findAll();
      res.json(companies);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      res.status(500).json({ error: 'Erro ao buscar empresas' });
    }
  },

  // Listar empresas com contagem de obras
  async getAllWithWorkCount(req, res) {
    try {
      const companies = await Company.findAllWithWorkCount();
      res.json(companies);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      res.status(500).json({ error: 'Erro ao buscar empresas' });
    }
  },

  // Buscar empresa por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const company = await Company.findById(id);
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      
      res.json(company);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      res.status(500).json({ error: 'Erro ao buscar empresa' });
    }
  },

  // Criar empresa
  async create(req, res) {
    try {
      const company = await Company.create(req.body);
      res.status(201).json(company);
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      
      // Verificar erro de CNPJ duplicado
      if (error.code === '23505') {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
      
      res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  },

  // Atualizar empresa
  async update(req, res) {
    try {
      const { id } = req.params;
      const company = await Company.update(id, req.body);
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      
      res.json(company);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      
      // Verificar erro de CNPJ duplicado
      if (error.code === '23505') {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
      
      res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
  },

  // Deletar empresa
  async delete(req, res) {
    try {
      const { id } = req.params;
      const company = await Company.delete(id);
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      
      res.json({ message: 'Empresa deletada com sucesso', company });
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      
      // Verificar erro de constraint (tem obras vinculadas)
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Não é possível deletar empresa com obras vinculadas' });
      }
      
      res.status(500).json({ error: 'Erro ao deletar empresa' });
    }
  },
};

export default companyController;
