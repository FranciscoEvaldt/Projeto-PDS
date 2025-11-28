import Load from '../models/Load.js';
import Sample from '../models/Sample.js';
import Work from '../models/Work.js';

const loadController = {
  // Listar todas as cargas
  async getAll(req, res) {
    try {
      const loads = await Load.findAll();
      res.json(loads);
    } catch (error) {
      console.error('Erro ao buscar cargas:', error);
      res.status(500).json({ error: 'Erro ao buscar cargas' });
    }
  },

  // Listar cargas com detalhes
  async getAllWithDetails(req, res) {
    try {
      const loads = await Load.findAllWithDetails();
      res.json(loads);
    } catch (error) {
      console.error('Erro ao buscar cargas:', error);
      res.status(500).json({ error: 'Erro ao buscar cargas' });
    }
  },

  // Buscar carga por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const load = await Load.findById(id);
      
      if (!load) {
        return res.status(404).json({ error: 'Carga não encontrada' });
      }
      
      res.json(load);
    } catch (error) {
      console.error('Erro ao buscar carga:', error);
      res.status(500).json({ error: 'Erro ao buscar carga' });
    }
  },

  // Buscar cargas por obra
  async getByWork(req, res) {
    try {
      const { workId } = req.params;
      const loads = await Load.findByWork(workId);
      res.json(loads);
    } catch (error) {
      console.error('Erro ao buscar cargas:', error);
      res.status(500).json({ error: 'Erro ao buscar cargas' });
    }
  },

  // Criar carga (com geração automática de amostras)
  async create(req, res) {
    try {
      const loadData = req.body;
      
      // Criar a carga
      const load = await Load.create(loadData);
      
      // Buscar informações da obra para gerar códigos das amostras
      const work = await Work.findById(load.work_id);
      const workCode = work.code.replace(/[^a-zA-Z0-9]/g, ''); // Remover caracteres especiais
      const invoiceCode = load.invoice_number.replace(/[^a-zA-Z0-9]/g, '');
      
      // Gerar amostras automaticamente
      const samples = [];
      const ages = [
        { days: 7, quantity: load.quantity_7_days },
        { days: 14, quantity: load.quantity_14_days },
        { days: 28, quantity: load.quantity_28_days },
        { days: 63, quantity: load.quantity_63_days },
      ];
      
      ages.forEach(({ days, quantity }) => {
        for (let i = 1; i <= quantity; i++) {
          // Gerar código único: OBR001-NF12345-7D-01
          const sampleCode = `${workCode}-${invoiceCode}-${days}D-${String(i).padStart(2, '0')}`;
          
          // Calcular data de rompimento (data da carga + dias)
          const breakDate = new Date(load.load_date);
          breakDate.setDate(breakDate.getDate() + days);
          
          samples.push({
            load_id: load.id,
            sample_code: sampleCode,
            break_age: days,
            break_date: breakDate.toISOString().split('T')[0],
            status: 'pending',
            notes: null,
          });
        }
      });
      
      // Inserir amostras no banco
      let createdSamples = [];
      if (samples.length > 0) {
        createdSamples = await Sample.createMany(samples);
      }
      
      res.status(201).json({
        load,
        samples: createdSamples,
      });
    } catch (error) {
      console.error('Erro ao criar carga:', error);
      
      // Verificar erro de foreign key (obra não existe)
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Obra não encontrada' });
      }
      
      res.status(500).json({ error: 'Erro ao criar carga' });
    }
  },

  // Atualizar carga
  async update(req, res) {
    try {
      const { id } = req.params;
      const load = await Load.update(id, req.body);
      
      if (!load) {
        return res.status(404).json({ error: 'Carga não encontrada' });
      }
      
      res.json(load);
    } catch (error) {
      console.error('Erro ao atualizar carga:', error);
      res.status(500).json({ error: 'Erro ao atualizar carga' });
    }
  },

  // Deletar carga (e suas amostras)
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Deletar amostras primeiro (devido ao CASCADE, mas fazemos explicitamente)
      await Sample.deleteByLoad(id);
      
      // Deletar a carga
      const load = await Load.delete(id);
      
      if (!load) {
        return res.status(404).json({ error: 'Carga não encontrada' });
      }
      
      res.json({ message: 'Carga e amostras deletadas com sucesso', load });
    } catch (error) {
      console.error('Erro ao deletar carga:', error);
      res.status(500).json({ error: 'Erro ao deletar carga' });
    }
  },
};

export default loadController;
