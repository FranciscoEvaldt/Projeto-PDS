import pool from '../config/database.js';

class SamplesController {
  // Listar todas as amostras
  async getAll(req, res) {
    try {
      const { carga_id } = req.query;
      
      let query = `SELECT 
        id, carga_id, sequencia, numero_laboratorio, idade_dias,
        TO_CHAR(data_prevista_rompimento, 'YYYY-MM-DD') as data_prevista_rompimento,
        TO_CHAR(data_rompimento, 'YYYY-MM-DD') as data_rompimento,
        diametro_mm, altura_mm, carga_kn, resistencia_mpa, status,
        created_at, updated_at, created_by, updated_by
      FROM samples`;
      let params = [];
      
      if (carga_id) {
        query += ' WHERE carga_id = $1';
        params.push(carga_id);
      }
      
      query += ' ORDER BY numero_laboratorio ASC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: 'Erro ao buscar amostras', message: error.message });
    }
  }

  // Buscar amostra por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT 
          id, carga_id, sequencia, numero_laboratorio, idade_dias,
          TO_CHAR(data_prevista_rompimento, 'YYYY-MM-DD') as data_prevista_rompimento,
          TO_CHAR(data_rompimento, 'YYYY-MM-DD') as data_rompimento,
          diametro_mm, altura_mm, carga_kn, resistencia_mpa, status,
          created_at, updated_at, created_by, updated_by
        FROM samples WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar amostra:', error);
      res.status(500).json({ error: 'Erro ao buscar amostra', message: error.message });
    }
  }

  // Criar nova amostra
  async create(req, res) {
    try {
      const {
        carga_id,
        sequencia,
        numero_laboratorio,
        idade_dias,
        data_prevista_rompimento,
        data_rompimento,
        diametro_mm,
        altura_mm,
        carga_kn,
        resistencia_mpa,
        status
      } = req.body;
      
      // Validação
      if (!carga_id || sequencia === undefined || numero_laboratorio === undefined || !idade_dias || !data_prevista_rompimento) {
        return res.status(400).json({ 
          error: 'carga_id, sequencia, numero_laboratorio, idade_dias e data_prevista_rompimento são obrigatórios' 
        });
      }
      
      // Verificar se a carga existe
      const loadCheck = await pool.query('SELECT id FROM loads WHERE id = $1', [carga_id]);
      if (loadCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Carga não encontrada' });
      }
      
      const result = await pool.query(
        `INSERT INTO samples (
          carga_id, sequencia, numero_laboratorio, idade_dias, data_prevista_rompimento,
          data_rompimento, diametro_mm, altura_mm, carga_kn, resistencia_mpa, status
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          carga_id,
          sequencia,
          numero_laboratorio,
          idade_dias,
          data_prevista_rompimento,
          data_rompimento || null,
          diametro_mm || null,
          altura_mm || null,
          carga_kn || null,
          resistencia_mpa || null,
          status || 'pending'
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar amostra:', error);
      
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Número de laboratório já cadastrado' });
      }
      
      res.status(500).json({ error: 'Erro ao criar amostra', message: error.message });
    }
  }

  // Criar múltiplas amostras de uma vez (bulk insert)
  async createBulk(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const samples = req.body;
      
      // Validação
      if (!Array.isArray(samples) || samples.length === 0) {
        return res.status(400).json({ error: 'Envie um array de amostras' });
      }
      
      const createdSamples = [];
      
      for (const sample of samples) {
        const {
          carga_id,
          sequencia,
          numero_laboratorio,
          idade_dias,
          data_prevista_rompimento,
          data_rompimento,
          diametro_mm,
          altura_mm,
          carga_kn,
          resistencia_mpa,
          status
        } = sample;
        
        const result = await client.query(
          `INSERT INTO samples (
            carga_id, sequencia, numero_laboratorio, idade_dias, data_prevista_rompimento,
            data_rompimento, diametro_mm, altura_mm, carga_kn, resistencia_mpa, status
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            carga_id,
            sequencia,
            numero_laboratorio,
            idade_dias,
            data_prevista_rompimento,
            data_rompimento || null,
            diametro_mm || null,
            altura_mm || null,
            carga_kn || null,
            resistencia_mpa || null,
            status || 'pending'
          ]
        );
        
        createdSamples.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json(createdSamples);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar amostras em lote:', error);
      res.status(500).json({ error: 'Erro ao criar amostras em lote', message: error.message });
    } finally {
      client.release();
    }
  }

  // Atualizar amostra
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        carga_id,
        sequencia,
        numero_laboratorio,
        idade_dias,
        data_prevista_rompimento,
        data_rompimento,
        diametro_mm,
        altura_mm,
        carga_kn,
        resistencia_mpa,
        status
      } = req.body;
      
      const result = await pool.query(
        `UPDATE samples
         SET carga_id = COALESCE($1, carga_id),
             sequencia = COALESCE($2, sequencia),
             numero_laboratorio = COALESCE($3, numero_laboratorio),
             idade_dias = COALESCE($4, idade_dias),
             data_prevista_rompimento = COALESCE($5, data_prevista_rompimento),
             data_rompimento = $6,
             diametro_mm = $7,
             altura_mm = $8,
             carga_kn = $9,
             resistencia_mpa = $10,
             status = COALESCE($11, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [carga_id, sequencia, numero_laboratorio, idade_dias, data_prevista_rompimento, data_rompimento, diametro_mm, altura_mm, carga_kn, resistencia_mpa, status, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar amostra:', error);
      res.status(500).json({ error: 'Erro ao atualizar amostra', message: error.message });
    }
  }

  // Deletar amostra
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM samples WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Amostra não encontrada' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar amostra:', error);
      res.status(500).json({ error: 'Erro ao deletar amostra', message: error.message });
    }
  }
}

export default new SamplesController();