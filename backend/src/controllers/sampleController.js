import Sample from '../models/Sample.js';

const sampleController = {
  // Listar todas as amostras
  async getAll(req, res) {
    try {
      const samples = await Sample.findAll();
      res.json(samples);
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras' });
    }
  },

  // Listar amostras com detalhes
  async getAllWithDetails(req, res) {
    try {
      const samples = await Sample.findAllWithDetails();
      res.json(samples);
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras' });
    }
  },

  // Buscar amostra por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const sample = await Sample.findById(id);
      
      if (!sample) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.json(sample);
    } catch (error) {
      console.error('Erro ao buscar amostra:', error);
      res.status(500).json({ error: 'Erro ao buscar amostra' });
    }
  },

  // Buscar amostras por carga
  async getByLoad(req, res) {
    try {
      const { loadId } = req.params;
      const samples = await Sample.findByLoad(loadId);
      res.json(samples);
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras' });
    }
  },

  // Buscar amostras por obra
  async getByWork(req, res) {
    try {
      const { workId } = req.params;
      const samples = await Sample.findByWork(workId);
      res.json(samples);
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras' });
    }
  },

  // Buscar amostras por status
  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const samples = await Sample.findByStatus(status);
      res.json(samples);
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras' });
    }
  },

  // Buscar amostras pendentes
  async getPending(req, res) {
    try {
      const samples = await Sample.findByStatus('pending');
      res.json(samples);
    } catch (error) {
      console.error('Erro ao buscar amostras pendentes:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras pendentes' });
    }
  },

  // Criar amostra (geralmente não usado, pois são criadas automaticamente)
  async create(req, res) {
    try {
      const sample = await Sample.create(req.body);
      res.status(201).json(sample);
    } catch (error) {
      console.error('Erro ao criar amostra:', error);
      
      // Verificar erro de foreign key (carga não existe)
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Carga não encontrada' });
      }
      
      // Verificar erro de código duplicado
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Código da amostra já cadastrado' });
      }
      
      res.status(500).json({ error: 'Erro ao criar amostra' });
    }
  },

  // Atualizar amostra
  async update(req, res) {
    try {
      const { id } = req.params;
      const sample = await Sample.update(id, req.body);
      
      if (!sample) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.json(sample);
    } catch (error) {
      console.error('Erro ao atualizar amostra:', error);
      res.status(500).json({ error: 'Erro ao atualizar amostra' });
    }
  },

  // Atualizar resultado do teste
  async updateResult(req, res) {
    try {
      const { id } = req.params;
      const { result, status, notes } = req.body;
      
      if (!result) {
        return res.status(400).json({ error: 'Resultado é obrigatório' });
      }
      
      const sample = await Sample.updateResult(id, { result, status, notes });
      
      if (!sample) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.json(sample);
    } catch (error) {
      console.error('Erro ao atualizar resultado:', error);
      res.status(500).json({ error: 'Erro ao atualizar resultado' });
    }
  },

  // Deletar amostra
  async delete(req, res) {
    try {
      const { id } = req.params;
      const sample = await Sample.delete(id);
      
      if (!sample) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.json({ message: 'Amostra deletada com sucesso', sample });
    } catch (error) {
      console.error('Erro ao deletar amostra:', error);
      res.status(500).json({ error: 'Erro ao deletar amostra' });
    }
  },
};

export default sampleController;
