import pool from '../config/database.js';

class LoadsController {
  // Listar todas as cargas
  async getAll(req, res) {
    try {
      const { obra_id } = req.query;
      
      let query = 'SELECT *, TO_CHAR(data_moldagem, \'YYYY-MM-DD\') as data_moldagem FROM loads';
      let params = [];
      
      if (obra_id) {
        query += ' WHERE obra_id = $1';
        params.push(obra_id);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar cargas:', error);
      res.status(500).json({ error: 'Erro ao buscar cargas', message: error.message });
    }
  }

  // Buscar carga por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT *, TO_CHAR(data_moldagem, \'YYYY-MM-DD\') as data_moldagem FROM loads WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Carga não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar carga:', error);
      res.status(500).json({ error: 'Erro ao buscar carga', message: error.message });
    }
  }

  // Criar nova carga
  async create(req, res) {
    try {
      const {
        obra_id,
        numero_planilha,
        data_moldagem,
        caminhao,
        nota_fiscal,
        volume_m3,
        slump_cm,
        fck_mpa,
        pavimento,
        peca,
        fornecedor_concreto,
        observacoes
      } = req.body;
      
      // Validação
      if (!obra_id || !numero_planilha || !data_moldagem) {
        return res.status(400).json({ error: 'obra_id, numero_planilha e data_moldagem são obrigatórios' });
      }
      
      // Verificar se a obra existe
      const workCheck = await pool.query('SELECT id FROM works WHERE id = $1', [obra_id]);
      if (workCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Obra não encontrada' });
      }
      
      const result = await pool.query(
        `INSERT INTO loads (
          obra_id, numero_planilha, data_moldagem, caminhao, nota_fiscal,
          volume_m3, slump_cm, fck_mpa, pavimento, peca, fornecedor_concreto, observacoes
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          obra_id,
          numero_planilha,
          data_moldagem,
          caminhao || null,
          nota_fiscal || null,
          volume_m3 || null,
          slump_cm || null,
          fck_mpa || null,
          pavimento || null,
          peca || null,
          fornecedor_concreto || null,
          observacoes || null
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar carga:', error);
      res.status(500).json({ error: 'Erro ao criar carga', message: error.message });
    }
  }

  // Atualizar carga
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        obra_id,
        numero_planilha,
        data_moldagem,
        caminhao,
        nota_fiscal,
        volume_m3,
        slump_cm,
        fck_mpa,
        pavimento,
        peca,
        fornecedor_concreto,
        observacoes
      } = req.body;
      
      const result = await pool.query(
        `UPDATE loads
         SET obra_id = COALESCE($1, obra_id),
             numero_planilha = COALESCE($2, numero_planilha),
             data_moldagem = COALESCE($3, data_moldagem),
             caminhao = COALESCE($4, caminhao),
             nota_fiscal = COALESCE($5, nota_fiscal),
             volume_m3 = COALESCE($6, volume_m3),
             slump_cm = COALESCE($7, slump_cm),
             fck_mpa = COALESCE($8, fck_mpa),
             pavimento = COALESCE($9, pavimento),
             peca = COALESCE($10, peca),
             fornecedor_concreto = COALESCE($11, fornecedor_concreto),
             observacoes = COALESCE($12, observacoes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $13
         RETURNING *`,
        [obra_id, numero_planilha, data_moldagem, caminhao, nota_fiscal, volume_m3, slump_cm, fck_mpa, pavimento, peca, fornecedor_concreto, observacoes, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Carga não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar carga:', error);
      res.status(500).json({ error: 'Erro ao atualizar carga', message: error.message });
    }
  }

  // Deletar carga
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM loads WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Carga não encontrada' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar carga:', error);
      
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Não é possível deletar carga com amostras cadastradas' });
      }
      
      res.status(500).json({ error: 'Erro ao deletar carga', message: error.message });
    }
  }
}

export default new LoadsController();