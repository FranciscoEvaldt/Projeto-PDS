import pool from '../database/db.js';

// GET /api/samples - Listar todas as amostras
export async function getAllSamples(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM samples_complete
       ORDER BY numero_laboratorio DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar amostras:', error);
    res.status(500).json({ error: 'Erro ao buscar amostras' });
  }
}

// GET /api/samples/:id - Buscar amostra por ID
export async function getSampleById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM samples WHERE id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Amostra não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar amostra:', error);
    res.status(500).json({ error: 'Erro ao buscar amostra' });
  }
}

// GET /api/samples/load/:cargaId - Buscar amostras de uma carga
export async function getSamplesByLoad(req, res) {
  try {
    const { cargaId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM samples
       WHERE carga_id = $1
       ORDER BY sequencia ASC`,
      [cargaId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar amostras da carga:', error);
    res.status(500).json({ error: 'Erro ao buscar amostras da carga' });
  }
}

// POST /api/samples - Criar nova amostra
export async function createSample(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      carga_id,
      sequencia,
      numero_laboratorio,
      data_prevista_rompimento,
      data_rompimento,
      idade_dias,
      diametro_mm,
      altura_mm,
      carga_kn,
      resistencia_mpa,
      status
    } = req.body;
    
    if (!carga_id) {
      return res.status(400).json({ error: 'ID da carga é obrigatório' });
    }
    
    // Gerar número de laboratório se não fornecido
    let labNumber = numero_laboratorio;
    if (!labNumber) {
      const { rows: counterRows } = await client.query(
        `UPDATE system_counters
         SET counter_value = counter_value + 1
         WHERE counter_name = 'lab_number'
         RETURNING counter_value`
      );
      labNumber = counterRows[0].counter_value;
    }
    
    // Gerar sequência se não fornecida
    let seq = sequencia;
    if (!seq) {
      const { rows: seqRows } = await client.query(
        `SELECT COALESCE(MAX(sequencia), 0) + 1 as next_seq
         FROM samples
         WHERE carga_id = $1`,
        [carga_id]
      );
      seq = seqRows[0].next_seq;
    }
    
    const { rows } = await client.query(
      `INSERT INTO samples (
        carga_id, sequencia, numero_laboratorio, data_prevista_rompimento,
        data_rompimento, idade_dias, diametro_mm, altura_mm,
        carga_kn, resistencia_mpa, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        carga_id,
        seq,
        labNumber,
        data_prevista_rompimento,
        data_rompimento,
        idade_dias,
        diametro_mm || 100,
        altura_mm || 200,
        carga_kn,
        resistencia_mpa,
        status || 'pending'
      ]
    );
    
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar amostra:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Número de laboratório já existe' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Carga não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro ao criar amostra' });
    }
  } finally {
    client.release();
  }
}

// POST /api/samples/bulk - Criar múltiplas amostras
export async function createSamplesBulk(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const samples = req.body;
    
    if (!Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ error: 'Array de amostras é obrigatório' });
    }
    
    const createdSamples = [];
    
    for (const sample of samples) {
      const {
        carga_id,
        sequencia,
        numero_laboratorio,
        data_prevista_rompimento,
        data_rompimento,
        idade_dias,
        diametro_mm,
        altura_mm,
        carga_kn,
        resistencia_mpa,
        status
      } = sample;
      
      // Gerar número de laboratório se não fornecido
      let labNumber = numero_laboratorio;
      if (!labNumber) {
        const { rows: counterRows } = await client.query(
          `UPDATE system_counters
           SET counter_value = counter_value + 1
           WHERE counter_name = 'lab_number'
           RETURNING counter_value`
        );
        labNumber = counterRows[0].counter_value;
      }
      
      // Gerar sequência se não fornecida
      let seq = sequencia;
      if (!seq) {
        const { rows: seqRows } = await client.query(
          `SELECT COALESCE(MAX(sequencia), 0) + 1 as next_seq
           FROM samples
           WHERE carga_id = $1`,
          [carga_id]
        );
        seq = seqRows[0].next_seq;
      }
      
      const { rows } = await client.query(
        `INSERT INTO samples (
          carga_id, sequencia, numero_laboratorio, data_prevista_rompimento,
          data_rompimento, idade_dias, diametro_mm, altura_mm,
          carga_kn, resistencia_mpa, status
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          carga_id,
          seq,
          labNumber,
          data_prevista_rompimento,
          data_rompimento,
          idade_dias,
          diametro_mm || 100,
          altura_mm || 200,
          carga_kn,
          resistencia_mpa,
          status || 'pending'
        ]
      );
      
      createdSamples.push(rows[0]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(createdSamples);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar amostras em lote:', error);
    res.status(500).json({ error: 'Erro ao criar amostras em lote' });
  } finally {
    client.release();
  }
}

// PUT /api/samples/:id - Atualizar amostra
export async function updateSample(req, res) {
  try {
    const { id } = req.params;
    const {
      carga_id,
      sequencia,
      numero_laboratorio,
      data_prevista_rompimento,
      data_rompimento,
      idade_dias,
      diametro_mm,
      altura_mm,
      carga_kn,
      resistencia_mpa,
      status
    } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE samples
       SET carga_id = COALESCE($1, carga_id),
           sequencia = COALESCE($2, sequencia),
           numero_laboratorio = COALESCE($3, numero_laboratorio),
           data_prevista_rompimento = COALESCE($4, data_prevista_rompimento),
           data_rompimento = COALESCE($5, data_rompimento),
           idade_dias = COALESCE($6, idade_dias),
           diametro_mm = COALESCE($7, diametro_mm),
           altura_mm = COALESCE($8, altura_mm),
           carga_kn = COALESCE($9, carga_kn),
           resistencia_mpa = COALESCE($10, resistencia_mpa),
           status = COALESCE($11, status)
       WHERE id = $12
       RETURNING *`,
      [
        carga_id,
        sequencia,
        numero_laboratorio,
        data_prevista_rompimento,
        data_rompimento,
        idade_dias,
        diametro_mm,
        altura_mm,
        carga_kn,
        resistencia_mpa,
        status,
        id
      ]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Amostra não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar amostra:', error);
    res.status(500).json({ error: 'Erro ao atualizar amostra' });
  }
}

// DELETE /api/samples/:id - Excluir amostra
export async function deleteSample(req, res) {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query(
      'DELETE FROM samples WHERE id = $1',
      [id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Amostra não encontrada' });
    }
    
    res.json({ success: true, message: 'Amostra excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir amostra:', error);
    res.status(500).json({ error: 'Erro ao excluir amostra' });
  }
}

// GET /api/samples/next-lab-number - Obter próximo número de laboratório
export async function getNextLabNumber(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { rows } = await client.query(
      `UPDATE system_counters
       SET counter_value = counter_value + 1
       WHERE counter_name = 'lab_number'
       RETURNING counter_value`
    );
    
    await client.query('COMMIT');
    res.json({ number: rows[0].counter_value });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao obter próximo número de laboratório:', error);
    res.status(500).json({ error: 'Erro ao obter próximo número de laboratório' });
  } finally {
    client.release();
  }
}

// GET /api/samples/next-lab-numbers/:count - Obter múltiplos números de laboratório
export async function getNextLabNumbers(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { count } = req.params;
    const numCount = parseInt(count);
    
    if (isNaN(numCount) || numCount < 1) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }
    
    const { rows } = await client.query(
      `UPDATE system_counters
       SET counter_value = counter_value + $1
       WHERE counter_name = 'lab_number'
       RETURNING counter_value`,
      [numCount]
    );
    
    const lastNumber = rows[0].counter_value;
    const numbers = [];
    for (let i = numCount - 1; i >= 0; i--) {
      numbers.push(lastNumber - i);
    }
    
    await client.query('COMMIT');
    res.json({ numbers });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao obter números de laboratório:', error);
    res.status(500).json({ error: 'Erro ao obter números de laboratório' });
  } finally {
    client.release();
  }
}
