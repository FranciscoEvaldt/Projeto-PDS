import pool from '../config/database.js';

class WorksController {
  // Listar todas as obras
  async getAll(req, res) {
    try {
      const { empresa_id } = req.query;
      
      let query = 'SELECT * FROM works';
      let params = [];
      
      if (empresa_id) {
        query += ' WHERE empresa_id = $1';
        params.push(empresa_id);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      res.status(500).json({ error: 'Erro ao buscar obras', message: error.message });
    }
  }

  // Buscar obra por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT * FROM works WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar obra:', error);
      res.status(500).json({ error: 'Erro ao buscar obra', message: error.message });
    }
  }

  // Criar nova obra
  async create(req, res) {
    try {
      const { 
        empresa_id, 
        codigo,
        nome, 
        endereco, 
        cidade, 
        estado,
        fck_projeto,
        responsavel_obra,
        contrato,
        data_inicio,
        status
      } = req.body;
      
      // Validação
      if (!empresa_id || !nome) {
        return res.status(400).json({ error: 'empresa_id e nome são obrigatórios' });
      }
      
      // Verificar se a empresa existe
      const companyCheck = await pool.query('SELECT id FROM companies WHERE id = $1', [empresa_id]);
      if (companyCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Empresa não encontrada' });
      }
      
      const result = await pool.query(
        `INSERT INTO works (
          empresa_id, codigo, nome, endereco, cidade, estado, 
          fck_projeto, responsavel_obra, contrato, data_inicio, status
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          empresa_id, 
          codigo || null,
          nome, 
          endereco || null, 
          cidade || null, 
          estado || null,
          fck_projeto || null,
          responsavel_obra || null,
          contrato || null,
          data_inicio || null,
          status || 'active'
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      res.status(500).json({ error: 'Erro ao criar obra', message: error.message });
    }
  }

  // Atualizar obra
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        empresa_id, 
        codigo,
        nome, 
        endereco, 
        cidade, 
        estado,
        fck_projeto,
        responsavel_obra,
        contrato,
        data_inicio,
        status
      } = req.body;
      
      const result = await pool.query(
        `UPDATE works
         SET empresa_id = COALESCE($1, empresa_id),
             codigo = COALESCE($2, codigo),
             nome = COALESCE($3, nome),
             endereco = COALESCE($4, endereco),
             cidade = COALESCE($5, cidade),
             estado = COALESCE($6, estado),
             fck_projeto = COALESCE($7, fck_projeto),
             responsavel_obra = COALESCE($8, responsavel_obra),
             contrato = COALESCE($9, contrato),
             data_inicio = COALESCE($10, data_inicio),
             status = COALESCE($11, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [
          empresa_id, 
          codigo,
          nome, 
          endereco, 
          cidade, 
          estado,
          fck_projeto,
          responsavel_obra,
          contrato,
          data_inicio,
          status,
          id
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      res.status(500).json({ error: 'Erro ao atualizar obra', message: error.message });
    }
  }

  // Deletar obra
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM works WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar obra:', error);
      
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Não é possível deletar obra com cargas cadastradas' });
      }
      
      res.status(500).json({ error: 'Erro ao deletar obra', message: error.message });
    }
  }
}

export default new WorksController();