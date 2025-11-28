import Work from '../models/Work.js';

const workController = {
  // Listar todas as obras
  async getAll(req, res) {
    try {
      const works = await Work.findAll();
      res.json(works);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      res.status(500).json({ error: 'Erro ao buscar obras' });
    }
  },

  // Listar obras com contagens
  async getAllWithCounts(req, res) {
    try {
      const works = await Work.findAllWithCounts();
      res.json(works);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      res.status(500).json({ error: 'Erro ao buscar obras' });
    }
  },

  // Buscar obra por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const work = await Work.findById(id);
      
      if (!work) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }
      
      res.json(work);
    } catch (error) {
      console.error('Erro ao buscar obra:', error);
      res.status(500).json({ error: 'Erro ao buscar obra' });
    }
  },

  // Buscar obras por empresa
  async getByCompany(req, res) {
    try {
      const { companyId } = req.params;
      const works = await Work.findByCompany(companyId);
      res.json(works);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      res.status(500).json({ error: 'Erro ao buscar obras' });
    }
  },

  // Criar obra
  async create(req, res) {
    try {
      const work = await Work.create(req.body);
      res.status(201).json(work);
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      
      // Verificar erro de código duplicado
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Código da obra já cadastrado' });
      }
      
      // Verificar erro de foreign key (empresa não existe)
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Empresa não encontrada' });
      }
      
      res.status(500).json({ error: 'Erro ao criar obra' });
    }
  },

  // Atualizar obra
  async update(req, res) {
    try {
      const { id } = req.params;
      const work = await Work.update(id, req.body);
      
      if (!work) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }
      
      res.json(work);
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      
      // Verificar erro de código duplicado
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Código da obra já cadastrado' });
      }
      
      res.status(500).json({ error: 'Erro ao atualizar obra' });
    }
  },

  // Deletar obra
  async delete(req, res) {
    try {
      const { id } = req.params;
      const work = await Work.delete(id);
      
      if (!work) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }
      
      res.json({ message: 'Obra deletada com sucesso', work });
    } catch (error) {
      console.error('Erro ao deletar obra:', error);
      
      // Verificar erro de constraint (tem cargas vinculadas)
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Não é possível deletar obra com cargas vinculadas' });
      }
      
      res.status(500).json({ error: 'Erro ao deletar obra' });
    }
  },
};

export default workController;
